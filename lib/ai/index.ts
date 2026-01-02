/**
 * AI Module Index
 * ===============
 * Barrel export for AI utilities
 */

// OpenAI Service
export {
    createStreamingCompletion,
    createCompletion,
    validateApiKey,
    AVAILABLE_MODELS,
    DEFAULT_MODEL,
    FALLBACK_MODEL,
} from './openai';
export type { OpenAIStreamOptions, TokenUsage, StreamResult } from './openai';

// System Prompts
export {
    getSystemPrompt,
    getSystemPromptContent,
    listPromptVersions,
    CURRENT_PROMPT_VERSION,
    SYSTEM_PROMPTS,
} from './systemPrompt';
export type { SystemPromptConfig } from './systemPrompt';

// Context Manager
export {
    buildContext,
    validateUserInput,
    estimateTokens,
    estimateMessagesTokens,
    truncateMessage,
    MAX_CONTEXT_MESSAGES,
    MAX_MESSAGE_CHARS,
    MAX_CONTEXT_CHARS,
    CHARS_PER_TOKEN,
} from './contextManager';
export type { ChatMessage, ContextOptions, ContextResult } from './contextManager';
