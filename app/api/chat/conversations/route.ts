/**
 * Conversations API
 * =================
 * GET  - List user's conversations
 * POST - Create new conversation
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Conversation, Message, User } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';
import { CURRENT_PROMPT_VERSION } from '@/lib/ai';

// ============================================
// GET - List Conversations
// ============================================

export async function GET() {
    try {
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch conversations sorted by most recent
        const conversations = await Conversation.find({ userId: user.userId })
            .sort({ updatedAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            conversations,
        });
    } catch (error) {
        console.error('[Conversations GET] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// ============================================
// POST - Create Conversation
// ============================================

interface CreateConversationBody {
    title?: string;
    model?: string;
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: CreateConversationBody = await request.json();

        await dbConnect();

        // Verify user exists in database
        const dbUser = await User.findById(user.userId);
        if (!dbUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Create new conversation
        const conversation = await Conversation.create({
            userId: user.userId,
            title: body.title || 'New Chat',
            model: body.model || 'gpt-4.1-mini',
            systemPromptVersion: CURRENT_PROMPT_VERSION,
            messageCount: 0,
            totalTokens: 0,
        });

        return NextResponse.json({
            success: true,
            conversation: conversation.toJSON(),
        }, { status: 201 });
    } catch (error) {
        console.error('[Conversations POST] Error:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}
