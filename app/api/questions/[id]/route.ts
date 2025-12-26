/**
 * Single Question API Route
 * ==========================
 * GET /api/questions/[id] - Get a single question by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Question } from '@/lib/models';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;

        const question = await Question.findById(id)
            .populate('author', 'name avatar reputation')
            .populate({
                path: 'answers',
                populate: {
                    path: 'author',
                    select: 'name avatar reputation'
                }
            });

        if (!question) {
            return NextResponse.json(
                { success: false, message: 'Question not found' },
                { status: 404 }
            );
        }

        // Increment view count
        question.views = (question.views || 0) + 1;
        await question.save();

        return NextResponse.json({
            success: true,
            data: question,
        });
    } catch (error) {
        console.error('Error fetching question:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
