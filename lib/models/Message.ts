/**
 * Message Model
 * =============
 * Stores individual chat messages within conversations
 */

import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// ============================================
// TypeScript Interfaces
// ============================================

export type MessageRole = 'system' | 'user' | 'assistant';

export interface IMessage {
    conversationId: Types.ObjectId;
    role: MessageRole;
    content: string;
    tokenCount: number;
    latencyMs?: number;
    createdAt: Date;
}

export interface IMessageDocument extends IMessage, Document { }

export interface IMessageModel extends Model<IMessageDocument> {
    findByConversationId(conversationId: string, limit?: number): Promise<IMessageDocument[]>;
    getRecentMessages(conversationId: string, limit: number): Promise<IMessageDocument[]>;
}

// ============================================
// Schema Definition
// ============================================

const MessageSchema = new Schema<IMessageDocument, IMessageModel>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: [true, 'Conversation ID is required'],
            index: true,
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['system', 'user', 'assistant'],
                message: 'Role must be system, user, or assistant',
            },
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            maxlength: [100000, 'Content cannot exceed 100,000 characters'],
        },
        tokenCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        latencyMs: {
            type: Number,
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

MessageSchema.index({ conversationId: 1, createdAt: 1 });

// ============================================
// Static Methods
// ============================================

/**
 * Find all messages for a conversation
 */
MessageSchema.statics.findByConversationId = function (
    conversationId: string,
    limit?: number
) {
    const query = this.find({ conversationId }).sort({ createdAt: 1 });
    if (limit) {
        query.limit(limit);
    }
    return query.lean();
};

/**
 * Get recent messages for context (excludes system message)
 */
MessageSchema.statics.getRecentMessages = function (
    conversationId: string,
    limit: number = 15
) {
    return this.find({
        conversationId,
        role: { $ne: 'system' },
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
        .then((messages: IMessageDocument[]) => messages.reverse());
};

// ============================================
// Model Export
// ============================================

const Message: IMessageModel =
    (mongoose.models.Message as IMessageModel) ||
    mongoose.model<IMessageDocument, IMessageModel>('Message', MessageSchema);

export default Message;
