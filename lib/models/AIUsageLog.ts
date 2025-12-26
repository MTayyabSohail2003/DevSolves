/**
 * AI Usage Log Model
 * ==================
 * Tracks AI API usage for cost monitoring and analytics
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ============================================
// Pricing Constants (per 1K tokens)
// ============================================

export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    'gpt-4.1-mini': { input: 0.0004, output: 0.0016 },
    'gpt-4.1': { input: 0.002, output: 0.008 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

// ============================================
// TypeScript Interfaces
// ============================================

export interface IAIUsageLog {
    userId: Types.ObjectId;
    conversationId: Types.ObjectId;
    model: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
    latencyMs: number;
    createdAt: Date;
}

export interface IAIUsageLogDocument extends IAIUsageLog, Document { }

export interface IAIUsageLogModel extends Model<IAIUsageLogDocument> {
    getUserUsageStats(userId: string, days?: number): Promise<{
        totalTokens: number;
        totalCost: number;
        requestCount: number;
    }>;
    getDailyUsage(userId: string): Promise<{
        tokens: number;
        requests: number;
    }>;
}

// ============================================
// Schema Definition
// ============================================

const AIUsageLogSchema = new Schema<IAIUsageLogDocument, IAIUsageLogModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: [true, 'Conversation ID is required'],
            index: true,
        },
        model: {
            type: String,
            required: true,
            default: 'gpt-4.1-mini',
        },
        inputTokens: {
            type: Number,
            required: true,
            min: 0,
        },
        outputTokens: {
            type: Number,
            required: true,
            min: 0,
        },
        totalTokens: {
            type: Number,
            required: true,
            min: 0,
        },
        estimatedCost: {
            type: Number,
            required: true,
            min: 0,
        },
        latencyMs: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        toJSON: {
            transform: (_, ret: Record<string, unknown>) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// ============================================
// Indexes
// ============================================

AIUsageLogSchema.index({ userId: 1, createdAt: -1 });
AIUsageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 days TTL

// ============================================
// Static Methods
// ============================================

/**
 * Get user's usage statistics for a time period
 */
AIUsageLogSchema.statics.getUserUsageStats = async function (
    userId: string,
    days: number = 30
) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: null,
                totalTokens: { $sum: '$totalTokens' },
                totalCost: { $sum: '$estimatedCost' },
                requestCount: { $sum: 1 },
            },
        },
    ]);

    return result[0] || { totalTokens: 0, totalCost: 0, requestCount: 0 };
};

/**
 * Get user's usage for today (for daily limits)
 */
AIUsageLogSchema.statics.getDailyUsage = async function (userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                createdAt: { $gte: startOfDay },
            },
        },
        {
            $group: {
                _id: null,
                tokens: { $sum: '$totalTokens' },
                requests: { $sum: 1 },
            },
        },
    ]);

    return result[0] || { tokens: 0, requests: 0 };
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate estimated cost for a request
 */
export function calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
): number {
    const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4.1-mini'];
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return Math.round((inputCost + outputCost) * 1000000) / 1000000; // Round to 6 decimal places
}

// ============================================
// Model Export
// ============================================

const AIUsageLog: IAIUsageLogModel =
    (mongoose.models.AIUsageLog as IAIUsageLogModel) ||
    mongoose.model<IAIUsageLogDocument, IAIUsageLogModel>('AIUsageLog', AIUsageLogSchema);

export default AIUsageLog;
