/**
 * Regenerate API
 * ==============
 * POST - Regenerate the last assistant response
 */

import { NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Conversation, Message, User, AIUsageLog, calculateCost } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';
import {
    checkAIRateLimit,
    startRequest,
    endRequest,
    shouldResetDailyLimits,
} from '@/lib/auth/aiRateLimit';
import {
    createStreamingCompletion,
    buildContext,
    ChatMessage,
} from '@/lib/ai';

// ============================================
// Types
// ============================================

interface RegenerateBody {
    conversationId: string;
}

// ============================================
// POST - Regenerate Last Response
// ============================================

export async function POST(request: NextRequest) {
    let userId: string | null = null;

    try {
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
        userId = user.userId;

        const body: RegenerateBody = await request.json();

        if (!body.conversationId) {
            return new Response(
                JSON.stringify({ error: 'Conversation ID is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await dbConnect();

        // Fetch user from database
        const dbUser = await User.findById(userId);
        if (!dbUser) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check and reset daily limits if needed
        if (shouldResetDailyLimits(dbUser.aiUsage?.dailyResetAt)) {
            dbUser.aiUsage = {
                ...dbUser.aiUsage,
                dailyTokensUsed: 0,
                dailyMessages: 0,
                dailyResetAt: new Date(),
            };
            await dbUser.save();
        }

        // Check rate limits
        const rateLimitResult = checkAIRateLimit(
            userId,
            user.role,
            dbUser.aiUsage?.dailyTokensUsed || 0
        );

        if (!rateLimitResult.allowed) {
            return new Response(
                JSON.stringify({
                    error: rateLimitResult.reason,
                    retryAfter: rateLimitResult.retryAfter,
                }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Fetch conversation
        const conversation = await Conversation.findOne({
            _id: body.conversationId,
            userId,
        });

        if (!conversation) {
            return new Response(
                JSON.stringify({ error: 'Conversation not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Find and delete the last assistant message
        const lastAssistantMessage = await Message.findOne({
            conversationId: body.conversationId,
            role: 'assistant',
        }).sort({ createdAt: -1 });

        if (lastAssistantMessage) {
            await Message.findByIdAndDelete(lastAssistantMessage._id);

            // Decrement message count
            await Conversation.findByIdAndUpdate(body.conversationId, {
                $inc: {
                    messageCount: -1,
                    totalTokens: -(lastAssistantMessage.tokenCount || 0),
                },
            });
        }

        // Fetch messages for context (all remaining user/assistant messages)
        const recentMessages = await Message.find({
            conversationId: body.conversationId,
            role: { $ne: 'system' },
        })
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();

        if (recentMessages.length === 0) {
            return new Response(
                JSON.stringify({ error: 'No messages to regenerate from' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Reverse to get chronological order
        const messagesForContext: ChatMessage[] = recentMessages
            .reverse()
            .map((m) => ({
                role: m.role,
                content: m.content,
            }));

        // Build context with system prompt
        const context = buildContext(messagesForContext, {
            systemPromptVersion: conversation.systemPromptVersion,
        });

        // Track concurrent request
        startRequest(userId);

        const startTime = Date.now();

        // Create streaming response
        const stream = await createStreamingCompletion(context.messages, {
            model: conversation.model,
            temperature: 0.8, // Slightly higher for regeneration variety
            maxTokens: 4096,
            onComplete: async (content, usage) => {
                const latencyMs = Date.now() - startTime;

                try {
                    // Save new assistant message
                    await Message.create({
                        conversationId: body.conversationId,
                        role: 'assistant',
                        content,
                        tokenCount: usage.outputTokens,
                        latencyMs,
                    });

                    // Update conversation stats
                    await Conversation.findByIdAndUpdate(body.conversationId, {
                        $inc: {
                            messageCount: 1,
                            totalTokens: usage.totalTokens,
                        },
                        updatedAt: new Date(),
                    });

                    // Update user usage stats
                    await User.findByIdAndUpdate(userId, {
                        $inc: {
                            'aiUsage.totalTokensUsed': usage.totalTokens,
                            'aiUsage.dailyTokensUsed': usage.totalTokens,
                        },
                        'aiUsage.lastUsedAt': new Date(),
                    });

                    // Log usage for cost tracking
                    await AIUsageLog.create({
                        userId,
                        conversationId: body.conversationId,
                        model: conversation.model,
                        inputTokens: usage.inputTokens,
                        outputTokens: usage.outputTokens,
                        totalTokens: usage.totalTokens,
                        estimatedCost: calculateCost(
                            conversation.model,
                            usage.inputTokens,
                            usage.outputTokens
                        ),
                        latencyMs,
                    });
                } catch (error) {
                    console.error('[Regenerate] Failed to save completion data:', error);
                }
            },
            onError: (error) => {
                console.error('[Regenerate] Streaming error:', error);
            },
        });

        // Return SSE response
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('[Regenerate POST] Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to regenerate response' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    } finally {
        // Always clean up concurrent request tracking
        if (userId) {
            endRequest(userId);
        }
    }
}
