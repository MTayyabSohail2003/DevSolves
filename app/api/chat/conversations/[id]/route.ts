/**
 * Single Conversation API
 * =======================
 * GET    - Get conversation with messages
 * PATCH  - Update conversation (title)
 * DELETE - Delete conversation and messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Conversation, Message, AIUsageLog } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// ============================================
// GET - Get Conversation with Messages
// ============================================

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Fetch conversation
        const conversation = await Conversation.findOne({
            _id: id,
            userId: user.userId,
        }).lean();

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Fetch messages
        const messages = await Message.find({ conversationId: id })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            conversation,
            messages,
        });
    } catch (error) {
        console.error('[Conversation GET] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}

// ============================================
// PATCH - Update Conversation
// ============================================

interface UpdateConversationBody {
    title?: string;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: UpdateConversationBody = await request.json();

        if (!body.title || body.title.trim().length === 0) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Update conversation
        const conversation = await Conversation.findOneAndUpdate(
            { _id: id, userId: user.userId },
            { title: body.title.trim() },
            { new: true }
        ).lean();

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.error('[Conversation PATCH] Error:', error);
        return NextResponse.json(
            { error: 'Failed to update conversation' },
            { status: 500 }
        );
    }
}

// ============================================
// DELETE - Delete Conversation
// ============================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await dbConnect();

        // Find and delete conversation
        const conversation = await Conversation.findOneAndDelete({
            _id: id,
            userId: user.userId,
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Delete associated messages
        await Message.deleteMany({ conversationId: id });

        // Delete associated usage logs (optional, depends on whether you want historical data)
        // await AIUsageLog.deleteMany({ conversationId: id });

        return NextResponse.json({
            success: true,
            message: 'Conversation deleted',
        });
    } catch (error) {
        console.error('[Conversation DELETE] Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete conversation' },
            { status: 500 }
        );
    }
}
