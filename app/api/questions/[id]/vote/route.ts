/**
 * Question Vote API Route
 * ========================
 * POST /api/questions/[id]/vote - Vote on a question (upvote/downvote)
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Question } from '@/lib/models';
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

        const { id: questionId } = await params;
        const body = await request.json();
        const { voteType } = body; // 'upvote' or 'downvote'

        if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
            return NextResponse.json(
                { success: false, message: 'Invalid vote type' },
                { status: 400 }
            );
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json(
                { success: false, message: 'Question not found' },
                { status: 404 }
            );
        }

        const userId = user.userId;

        // Check current vote state
        const hasUpvoted = question.upvotes.some((id: any) => id.toString() === userId);
        const hasDownvoted = question.downvotes.some((id: any) => id.toString() === userId);

        if (voteType === 'upvote') {
            if (hasUpvoted) {
                // Remove upvote (toggle off)
                question.upvotes = question.upvotes.filter((id: any) => id.toString() !== userId);
            } else {
                // Add upvote, remove downvote if exists
                if (hasDownvoted) {
                    question.downvotes = question.downvotes.filter((id: any) => id.toString() !== userId);
                }
                question.upvotes.push(new Types.ObjectId(userId));
            }
        } else {
            if (hasDownvoted) {
                // Remove downvote (toggle off)
                question.downvotes = question.downvotes.filter((id: any) => id.toString() !== userId);
            } else {
                // Add downvote, remove upvote if exists
                if (hasUpvoted) {
                    question.upvotes = question.upvotes.filter((id: any) => id.toString() !== userId);
                }
                question.downvotes.push(new Types.ObjectId(userId));
            }
        }

        await question.save();

        return NextResponse.json({
            success: true,
            data: {
                upvotes: question.upvotes,
                downvotes: question.downvotes,
                voteScore: question.upvotes.length - question.downvotes.length,
            },
        });

    } catch (error) {
        console.error('Error voting on question:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to vote' },
            { status: 500 }
        );
    }
}
