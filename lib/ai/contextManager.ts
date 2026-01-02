/**
 * Context Manager
 * ===============
 * Manages conversation context for AI requests
 * Handles message trimming, token budgets, and system prompt injection
 */

import { MessageRole } from '@/lib/models/Message';
import { getSystemPromptContent, CURRENT_PROMPT_VERSION } from './systemPrompt';

// ============================================
// Configuration
// ============================================

/**
 * Maximum number of messages to include in context (excluding system prompt)
 */
export const MAX_CONTEXT_MESSAGES = 15;

/**
 * Maximum characters per message (rough token estimation: 1 token ≈ 4 chars)
 */
export const MAX_MESSAGE_CHARS = 32000; // ~8K tokens per message

/**
 * Maximum total context size in characters
 */
export const MAX_CONTEXT_CHARS = 80000; // ~20K tokens total

/**
 * Token estimation multiplier (characters to tokens)
 */
export const CHARS_PER_TOKEN = 4;

// ============================================
// Types
// ============================================

export interface ChatMessage {
    role: MessageRole;
    content: string;
}

export interface ContextOptions {
    maxMessages?: number;
    maxChars?: number;
    systemPromptVersion?: string;
    includeSystemPrompt?: boolean;
}

export interface ContextResult {
    messages: ChatMessage[];
    systemPromptVersion: string;
    estimatedTokens: number;
    trimmedCount: number;
}

// ============================================
// Functions
// ============================================

/**
 * Estimate token count from character count
 */
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate tokens for an array of messages
 */
export function estimateMessagesTokens(messages: ChatMessage[]): number {
    const contentTokens = messages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
    );
    // Add overhead for message structure (~4 tokens per message)
    return contentTokens + messages.length * 4;
}

/**
 * Truncate a message if it exceeds the character limit
 */
export function truncateMessage(content: string, maxChars: number = MAX_MESSAGE_CHARS): string {
    if (content.length <= maxChars) return content;

    // Truncate with ellipsis
    const truncated = content.substring(0, maxChars - 100);
    return truncated + '\n\n[Message truncated due to length...]';
}

/**
 * Build context for AI request
 * - Always includes system prompt at index 0
 * - Trims older messages to stay within limits
 * - Truncates overly long messages
 */
export function buildContext(
    messages: ChatMessage[],
    options: ContextOptions = {}
): ContextResult {
    const {
        maxMessages = MAX_CONTEXT_MESSAGES,
        maxChars = MAX_CONTEXT_CHARS,
        systemPromptVersion = CURRENT_PROMPT_VERSION,
        includeSystemPrompt = true,
    } = options;

    // Get system prompt
    const systemPromptContent = getSystemPromptContent(systemPromptVersion);
    const systemMessage: ChatMessage = {
        role: 'system',
        content: systemPromptContent,
    };

    // Filter out any existing system messages and truncate content
    const userAssistantMessages = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
            ...msg,
            content: truncateMessage(msg.content),
        }));

    // Take only the last N messages
    let trimmedMessages = userAssistantMessages.slice(-maxMessages);
    let trimmedCount = Math.max(0, userAssistantMessages.length - maxMessages);

    // Calculate current size
    let currentChars = includeSystemPrompt ? systemPromptContent.length : 0;
    currentChars += trimmedMessages.reduce((sum, msg) => sum + msg.content.length, 0);

    // If still over limit, remove older messages
    while (currentChars > maxChars && trimmedMessages.length > 1) {
        const removed = trimmedMessages.shift();
        if (removed) {
            currentChars -= removed.content.length;
            trimmedCount++;
        }
    }

    // Build final message array
    const finalMessages: ChatMessage[] = includeSystemPrompt
        ? [systemMessage, ...trimmedMessages]
        : trimmedMessages;

    return {
        messages: finalMessages,
        systemPromptVersion,
        estimatedTokens: estimateMessagesTokens(finalMessages),
        trimmedCount,
    };
}

/**
 * Validate user input
 */
export function validateUserInput(content: string): { valid: boolean; error?: string } {
    if (!content || typeof content !== 'string') {
        return { valid: false, error: 'Message content is required' };
    }

    const trimmed = content.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > MAX_MESSAGE_CHARS) {
        return {
            valid: false,
            error: `Message too long. Maximum ${MAX_MESSAGE_CHARS} characters allowed.`
        };
    }

    // Check for potential abuse patterns
    const suspiciousPatterns = [
        /ignore.*previous.*instructions/i,
        /ignore.*all.*rules/i,
        /system.*prompt/i,
        /jailbreak/i,
    ];

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmed)) {
            // Log but don't block - just flag for monitoring
            console.warn('[Context] Suspicious input pattern detected');
            break;
        }
    }

    return { valid: true };
}
