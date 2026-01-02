/**
 * Answer Vote API Route
 * ======================
 * POST /api/answers/[id]/vote - Vote on an answer (upvote/downvote)
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Answer } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/jwt';
import { Types } from 'mongoose';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'You must be logged in to vote' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id: answerId } = await params;
        const body = await request.json();
        const { voteType } = body; // 'upvote' or 'downvote'

        if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
            return NextResponse.json(
                { success: false, message: 'Invalid vote type' },
                { status: 400 }
            );
        }

        const answer = await Answer.findById(answerId);
        if (!answer) {
            return NextResponse.json(
                { success: false, message: 'Answer not found' },
                { status: 404 }
            );
        }

        const userId = user.userId;

        // Check current vote state
        const hasUpvoted = answer.upvotes.some((id: any) => id.toString() === userId);
        const hasDownvoted = answer.downvotes.some((id: any) => id.toString() === userId);

        if (voteType === 'upvote') {
            if (hasUpvoted) {
                // Remove upvote (toggle off)
                answer.upvotes = answer.upvotes.filter((id: any) => id.toString() !== userId);
            } else {
                // Add upvote, remove downvote if exists
                if (hasDownvoted) {
                    answer.downvotes = answer.downvotes.filter((id: any) => id.toString() !== userId);
                }
                answer.upvotes.push(new Types.ObjectId(userId));
            }
        } else {
            if (hasDownvoted) {
                // Remove downvote (toggle off)
                answer.downvotes = answer.downvotes.filter((id: any) => id.toString() !== userId);
            } else {
                // Add downvote, remove upvote if exists
                if (hasUpvoted) {
                    answer.upvotes = answer.upvotes.filter((id: any) => id.toString() !== userId);
                }
                answer.downvotes.push(new Types.ObjectId(userId));
            }
        }

        await answer.save();

        return NextResponse.json({
            success: true,
            data: {
                upvotes: answer.upvotes,
                downvotes: answer.downvotes,
                voteScore: answer.upvotes.length - answer.downvotes.length,
            },
        });

    } catch (error) {
        console.error('Error voting on answer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to vote' },
            { status: 500 }
        );
    }
}
