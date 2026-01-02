/**
 * Answers API Route
 * =================
 * POST /api/questions/[id]/answers - Submit a new answer to a question
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Question, Answer } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth/jwt';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'You must be logged in to post an answer' },
                { status: 401 }
            );
        }

        await dbConnect();

        const { id: questionId } = await params;

        // Validate question exists
        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json(
                { success: false, message: 'Question not found' },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { body: answerBody } = body;

        // Validate answer body
        if (!answerBody || typeof answerBody !== 'string') {
            return NextResponse.json(
                { success: false, message: 'Answer body is required' },
                { status: 400 }
            );
        }

        if (answerBody.trim().length < 30) {
            return NextResponse.json(
                { success: false, message: 'Answer must be at least 30 characters' },
                { status: 400 }
            );
        }

        // Create the answer
        const answer = await Answer.create({
            body: answerBody.trim(),
            author: user.userId,
            question: questionId,
            upvotes: [],
            downvotes: [],
            isAccepted: false,
            comments: [],
        });

        // Add answer to question's answers array
        question.answers.push(answer._id);
        await question.save();

        // Populate author info for response
        await answer.populate('author', 'name avatar reputation');

        return NextResponse.json({
            success: true,
            message: 'Answer posted successfully',
            data: answer,
        }, { status: 201 });

    } catch (error) {
        console.error('Error posting answer:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to post answer' },
            { status: 500 }
        );
    }
}
