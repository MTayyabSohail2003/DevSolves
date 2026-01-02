/**
 * Messages API - Streaming Chat Completion
 * ========================================
 * POST - Send message and receive streaming AI response
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
    validateUserInput,
    ChatMessage,
} from '@/lib/ai';

// ============================================
// Types
// ============================================

interface SendMessageBody {
    conversationId: string;
    content: string;
}

// ============================================
// POST - Send Message with Streaming Response
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

        const body: SendMessageBody = await request.json();

        // Validate input
        const validation = validateUserInput(body.content);
        if (!validation.valid) {
            return new Response(
                JSON.stringify({ error: validation.error }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

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

        // Fetch recent messages for context
        const recentMessages = await Message.find({
            conversationId: body.conversationId,
            role: { $ne: 'system' },
        })
            .sort({ createdAt: -1 })
            .limit(15)
            .lean();

        // Reverse to get chronological order
        const messagesForContext: ChatMessage[] = recentMessages
            .reverse()
            .map((m) => ({
                role: m.role,
                content: m.content,
            }));

        // Add the new user message
        messagesForContext.push({
            role: 'user',
            content: body.content.trim(),
        });

        // Build context with system prompt
        const context = buildContext(messagesForContext, {
            systemPromptVersion: conversation.systemPromptVersion,
        });

        // Save user message to database
        const userMessage = await Message.create({
            conversationId: body.conversationId,
            role: 'user',
            content: body.content.trim(),
            tokenCount: 0, // Will be updated with usage
        });

        // Track concurrent request
        startRequest(userId);

        const startTime = Date.now();
        let fullContent = '';
        let inputTokens = 0;
        let outputTokens = 0;

        // Create streaming response
        const stream = await createStreamingCompletion(context.messages, {
            model: conversation.model,
            temperature: 0.7,
            maxTokens: 4096,
            onToken: (token) => {
                fullContent += token;
            },
            onComplete: async (content, usage) => {
                const latencyMs = Date.now() - startTime;
                inputTokens = usage.inputTokens;
                outputTokens = usage.outputTokens;

                try {
                    // Save assistant message
                    await Message.create({
                        conversationId: body.conversationId,
                        role: 'assistant',
                        content,
                        tokenCount: outputTokens,
                        latencyMs,
                    });

                    // Update conversation stats
                    await Conversation.findByIdAndUpdate(body.conversationId, {
                        $inc: {
                            messageCount: 2,
                            totalTokens: usage.totalTokens,
                        },
                        updatedAt: new Date(),
                    });

                    // Update user usage stats
                    await User.findByIdAndUpdate(userId, {
                        $inc: {
                            'aiUsage.totalTokensUsed': usage.totalTokens,
                            'aiUsage.dailyTokensUsed': usage.totalTokens,
                            'aiUsage.dailyMessages': 1,
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

                    // Auto-generate title if first message
                    if (conversation.title === 'New Chat' && content) {
                        const title = body.content.trim().substring(0, 50);
                        await Conversation.findByIdAndUpdate(body.conversationId, {
                            title: title + (body.content.length > 50 ? '...' : ''),
                        });
                    }
                } catch (error) {
                    console.error('[Messages] Failed to save completion data:', error);
                }
            },
            onError: (error) => {
                console.error('[Messages] Streaming error:', error);
            },
        });

        // Return SSE response
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Message-Id': userMessage._id.toString(),
            },
        });
    } catch (error) {
        console.error('[Messages POST] Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process message' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    } finally {
        // Always clean up concurrent request tracking
        if (userId) {
            endRequest(userId);
        }
    }
}
