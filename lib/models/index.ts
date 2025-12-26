/**
 * Models Index
 * ============
 * Barrel export for all models
 * Import from '@/lib/models' for clean imports
 */

export { default as User } from './User';
export type { IUser, IUserDocument, IUserModel } from './User';

export { default as Question } from './Question';
export type { IQuestion, IQuestionDocument, IQuestionModel } from './Question';

export { default as Answer } from './Answer';
export type { IAnswer, IAnswerDocument, IAnswerModel } from './Answer';

// AI Chat Models
export { default as Conversation } from './Conversation';
export type { IConversation, IConversationDocument, IConversationModel } from './Conversation';

export { default as Message } from './Message';
export type { IMessage, IMessageDocument, IMessageModel, MessageRole } from './Message';

export { default as AIUsageLog, calculateCost, MODEL_PRICING } from './AIUsageLog';
export type { IAIUsageLog, IAIUsageLogDocument, IAIUsageLogModel } from './AIUsageLog';
