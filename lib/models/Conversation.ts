/**
 * Conversation Model
 * ==================
 * Stores chat conversation metadata
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ============================================
// TypeScript Interfaces
// ============================================

export interface IConversation {
    userId: Types.ObjectId;
    title: string;
    model: string;
    systemPromptVersion: string;
    messageCount: number;
    totalTokens: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IConversationDocument extends IConversation, Document { }

export interface IConversationModel extends Model<IConversationDocument> {
    findByUserId(userId: string): Promise<IConversationDocument[]>;
}

// ============================================
// Schema Definition
// ============================================

const ConversationSchema = new Schema<IConversationDocument, IConversationModel>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
            default: 'New Chat',
        },
        model: {
            type: String,
            required: true,
            default: 'gpt-4.1-mini',
            enum: {
                values: ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
                message: 'Invalid model specified',
            },
        },
        systemPromptVersion: {
            type: String,
            required: true,
            default: '1.0.0',
        },
        messageCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalTokens: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
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

ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ createdAt: -1 });

// ============================================
// Static Methods
// ============================================

ConversationSchema.statics.findByUserId = function (userId: string) {
    return this.find({ userId })
        .sort({ updatedAt: -1 })
        .lean();
};

// ============================================
// Model Export
// ============================================

const Conversation: IConversationModel =
    (mongoose.models.Conversation as IConversationModel) ||
    mongoose.model<IConversationDocument, IConversationModel>('Conversation', ConversationSchema);

export default Conversation;
