/**
 * AI Rate Limiter
 * ===============
 * Rate limiting specifically for AI endpoints
 * Supports both in-memory and Redis backends
 */

import { checkRateLimit, getRateLimitKey } from './rateLimit';

// ============================================
// Configuration
// ============================================

export interface AIRateLimitConfig {
    // Messages per hour
    messagesPerHour: number;
    // Max tokens per day
    dailyTokenLimit: number;
    // Max tokens per request
    maxTokensPerRequest: number;
    // Concurrent request limit
    maxConcurrentRequests: number;
}

// Default limits for different user tiers
export const AI_RATE_LIMITS: Record<string, AIRateLimitConfig> = {
    user: {
        messagesPerHour: 50,
        dailyTokenLimit: 100000,
        maxTokensPerRequest: 4096,
        maxConcurrentRequests: 2,
    },
    moderator: {
        messagesPerHour: 100,
        dailyTokenLimit: 200000,
        maxTokensPerRequest: 8192,
        maxConcurrentRequests: 3,
    },
    admin: {
        messagesPerHour: 500,
        dailyTokenLimit: 1000000,
        maxTokensPerRequest: 16384,
        maxConcurrentRequests: 5,
    },
};

// Rate limit window for messages
const MESSAGE_RATE_LIMIT = {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // Default, overridden by tier
};

// ============================================
// In-Memory Store for Concurrent Requests
// ============================================

const concurrentRequests = new Map<string, number>();

// ============================================
// Types
// ============================================

export interface AIRateLimitResult {
    allowed: boolean;
    reason?: string;
    remaining?: {
        messages: number;
        tokens: number;
    };
    retryAfter?: number;
}

// ============================================
// Functions
// ============================================

/**
 * Check if a user can make an AI request
 */
export function checkAIRateLimit(
    userId: string,
    userRole: string = 'user',
    currentDailyTokens: number = 0
): AIRateLimitResult {
    const limits = AI_RATE_LIMITS[userRole] || AI_RATE_LIMITS.user;

    // 1. Check message rate limit
    const rateLimitKey = getRateLimitKey(userId, 'ai-chat');
    const rateLimit = checkRateLimit(rateLimitKey, {
        windowMs: MESSAGE_RATE_LIMIT.windowMs,
        maxRequests: limits.messagesPerHour,
    });

    if (!rateLimit.allowed) {
        return {
            allowed: false,
            reason: 'Message rate limit exceeded. Please wait before sending more messages.',
            retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        };
    }

    // 2. Check daily token limit
    if (currentDailyTokens >= limits.dailyTokenLimit) {
        return {
            allowed: false,
            reason: 'Daily token limit exceeded. Your limit resets at midnight.',
            remaining: {
                messages: rateLimit.remaining,
                tokens: 0,
            },
        };
    }

    // 3. Check concurrent requests
    const concurrent = concurrentRequests.get(userId) || 0;
    if (concurrent >= limits.maxConcurrentRequests) {
        return {
            allowed: false,
            reason: 'Too many concurrent requests. Please wait for current requests to complete.',
        };
    }

    return {
        allowed: true,
        remaining: {
            messages: rateLimit.remaining,
            tokens: limits.dailyTokenLimit - currentDailyTokens,
        },
    };
}

/**
 * Track concurrent request start
 */
export function startRequest(userId: string): void {
    const current = concurrentRequests.get(userId) || 0;
    concurrentRequests.set(userId, current + 1);
}

/**
 * Track concurrent request end
 */
export function endRequest(userId: string): void {
    const current = concurrentRequests.get(userId) || 0;
    if (current > 0) {
        concurrentRequests.set(userId, current - 1);
    }
}

/**
 * Get rate limit configuration for a user tier
 */
export function getAIRateLimits(userRole: string = 'user'): AIRateLimitConfig {
    return AI_RATE_LIMITS[userRole] || AI_RATE_LIMITS.user;
}

/**
 * Check if daily limit needs to be reset (called when processing a request)
 */
export function shouldResetDailyLimits(lastResetAt?: Date): boolean {
    if (!lastResetAt) return true;

    const now = new Date();
    const resetDate = new Date(lastResetAt);

    // Reset if we're on a new day
    return (
        now.getUTCDate() !== resetDate.getUTCDate() ||
        now.getUTCMonth() !== resetDate.getUTCMonth() ||
        now.getUTCFullYear() !== resetDate.getUTCFullYear()
    );
}
