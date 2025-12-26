/**
 * OpenAI Service
 * ==============
 * Server-side OpenAI API integration with streaming support
 * IMPORTANT: This module must only be used on the server side
 */

import { ChatMessage } from './contextManager';

// ============================================
// Configuration
// ============================================

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

export const DEFAULT_MODEL = 'gpt-4.1-mini';
export const FALLBACK_MODEL = 'gpt-4o-mini';

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 60000; // 60 seconds

// ============================================
// Types
// ============================================

export interface OpenAIStreamOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    onToken?: (token: string) => void;
    onComplete?: (fullContent: string, usage: TokenUsage) => void;
    onError?: (error: Error) => void;
    signal?: AbortSignal;
}

export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export interface StreamResult {
    content: string;
    usage: TokenUsage;
}

// ============================================
// Validation
// ============================================

/**
 * Validate that OpenAI API key is configured
 * @throws Error if API key is not set
 */
export function validateApiKey(): void {
    if (!OPENAI_API_KEY) {
        throw new Error(
            'OPENAI_API_KEY is not configured. Please set it in your .env.local file.'
        );
    }
}

// ============================================
// Streaming Implementation
// ============================================

/**
 * Create a streaming chat completion request
 * Returns a ReadableStream that emits tokens as they arrive
 */
export async function createStreamingCompletion(
    messages: ChatMessage[],
    options: OpenAIStreamOptions = {}
): Promise<ReadableStream<Uint8Array>> {
    validateApiKey();

    const {
        model = DEFAULT_MODEL,
        temperature = 0.7,
        maxTokens = 4096,
        signal,
    } = options;

    const encoder = new TextEncoder();
    let fullContent = '';
    let inputTokens = 0;
    let outputTokens = 0;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    // Combine signals if external signal provided
    const combinedSignal = signal
        ? { signal: controller.signal }
        : { signal: controller.signal };

    return new ReadableStream({
        async start(streamController) {
            try {
                const response = await fetch(OPENAI_CHAT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages: messages.map(m => ({
                            role: m.role,
                            content: m.content,
                        })),
                        temperature,
                        max_tokens: maxTokens,
                        stream: true,
                        stream_options: { include_usage: true },
                    }),
                    ...combinedSignal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorBody = await response.text();
                    let errorMessage = `OpenAI API error: ${response.status}`;

                    try {
                        const errorJson = JSON.parse(errorBody);
                        errorMessage = errorJson.error?.message || errorMessage;
                    } catch {
                        // Use default error message
                    }

                    throw new Error(errorMessage);
                }

                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error('Failed to get response stream');
                }

                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();

                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmedLine = line.trim();

                        if (trimmedLine === '' || trimmedLine === 'data: [DONE]') {
                            continue;
                        }

                        if (trimmedLine.startsWith('data: ')) {
                            try {
                                const json = JSON.parse(trimmedLine.slice(6));

                                // Handle token content
                                const delta = json.choices?.[0]?.delta;
                                if (delta?.content) {
                                    fullContent += delta.content;
                                    streamController.enqueue(
                                        encoder.encode(`data: ${JSON.stringify({ token: delta.content })}\n\n`)
                                    );
                                    options.onToken?.(delta.content);
                                }

                                // Handle usage stats (comes at the end with stream_options)
                                if (json.usage) {
                                    inputTokens = json.usage.prompt_tokens || 0;
                                    outputTokens = json.usage.completion_tokens || 0;
                                }
                            } catch {
                                // Skip malformed JSON
                            }
                        }
                    }
                }

                // Send completion event
                const usage: TokenUsage = {
                    inputTokens,
                    outputTokens,
                    totalTokens: inputTokens + outputTokens,
                };

                streamController.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                        done: true,
                        content: fullContent,
                        usage
                    })}\n\n`)
                );

                options.onComplete?.(fullContent, usage);
                streamController.close();

            } catch (error) {
                clearTimeout(timeoutId);

                const err = error instanceof Error ? error : new Error(String(error));

                // Send error event
                streamController.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                        error: true,
                        message: err.message
                    })}\n\n`)
                );

                options.onError?.(err);
                streamController.close();
            }
        },

        cancel() {
            clearTimeout(timeoutId);
            controller.abort();
        },
    });
}

/**
 * Non-streaming completion (for simpler use cases)
 */
export async function createCompletion(
    messages: ChatMessage[],
    options: Omit<OpenAIStreamOptions, 'onToken' | 'onComplete' | 'onError'> = {}
): Promise<StreamResult> {
    validateApiKey();

    const {
        model = DEFAULT_MODEL,
        temperature = 0.7,
        maxTokens = 4096,
    } = options;

    const response = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
            temperature,
            max_tokens: maxTokens,
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `OpenAI API error: ${response.status}`;

        try {
            const errorJson = JSON.parse(errorBody);
            errorMessage = errorJson.error?.message || errorMessage;
        } catch {
            // Use default error message
        }

        throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
        content: data.choices[0]?.message?.content || '',
        usage: {
            inputTokens: data.usage?.prompt_tokens || 0,
            outputTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
        },
    };
}

/**
 * Get available models
 */
export const AVAILABLE_MODELS = [
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Fast and cost-effective' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Most capable model' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Optimized for conversation' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Compact and efficient' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Legacy fast model' },
];
