'use client';

/**
 * useChat Hook
 * ============
 * React hook for managing chat state and API interactions
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================
// Types
// ============================================

export interface Conversation {
    id: string;
    _id?: string;
    userId: string;
    title: string;
    model: string;
    systemPromptVersion: string;
    messageCount: number;
    totalTokens: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    _id?: string;
    conversationId: string;
    role: 'system' | 'user' | 'assistant';
    content: string;
    tokenCount?: number;
    latencyMs?: number;
    createdAt: string;
    isStreaming?: boolean;
}

export interface UseChatOptions {
    onError?: (error: Error) => void;
}

export interface UseChatReturn {
    // State
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    isLoading: boolean;
    isStreaming: boolean;
    error: string | null;

    // Actions
    loadConversations: () => Promise<void>;
    createConversation: (title?: string) => Promise<Conversation | null>;
    selectConversation: (conversationId: string) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
    updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    regenerateResponse: () => Promise<void>;
    clearError: () => void;
}

// ============================================
// Hook Implementation
// ============================================

export function useChat(options: UseChatOptions = {}): UseChatReturn {
    const { onError } = options;

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs for streaming
    const abortControllerRef = useRef<AbortController | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    // ========================================
    // Error Handling
    // ========================================

    const handleError = useCallback((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error.message);
        onError?.(error);
    }, [onError]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // ========================================
    // Conversation Management
    // ========================================

    const loadConversations = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/chat/conversations');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load conversations');
            }

            // Normalize IDs
            const normalized = data.conversations.map((c: Conversation) => ({
                ...c,
                id: c.id || c._id,
            }));

            setConversations(normalized);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const createConversation = useCallback(async (title?: string): Promise<Conversation | null> => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create conversation');
            }

            const conversation = {
                ...data.conversation,
                id: data.conversation.id || data.conversation._id,
            };

            setConversations(prev => [conversation, ...prev]);
            setCurrentConversation(conversation);
            setMessages([]);

            return conversation;
        } catch (err) {
            handleError(err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const selectConversation = useCallback(async (conversationId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/chat/conversations/${conversationId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load conversation');
            }

            const conversation = {
                ...data.conversation,
                id: data.conversation.id || data.conversation._id,
            };

            const normalizedMessages = data.messages.map((m: Message) => ({
                ...m,
                id: m.id || m._id,
            }));

            setCurrentConversation(conversation);
            setMessages(normalizedMessages);
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [handleError]);

    const deleteConversation = useCallback(async (conversationId: string) => {
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete conversation');
            }

            setConversations(prev => prev.filter(c => c.id !== conversationId));

            if (currentConversation?.id === conversationId) {
                setCurrentConversation(null);
                setMessages([]);
            }
        } catch (err) {
            handleError(err);
        }
    }, [currentConversation, handleError]);

    const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
        try {
            const response = await fetch(`/api/chat/conversations/${conversationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update conversation');
            }

            setConversations(prev =>
                prev.map(c => (c.id === conversationId ? { ...c, title } : c))
            );

            if (currentConversation?.id === conversationId) {
                setCurrentConversation(prev => (prev ? { ...prev, title } : null));
            }
        } catch (err) {
            handleError(err);
        }
    }, [currentConversation, handleError]);

    // ========================================
    // Message Handling with Streaming
    // ========================================

    const sendMessage = useCallback(async (content: string) => {
        if (!currentConversation || !content.trim()) return;

        // Abort any existing stream
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            conversationId: currentConversation.id,
            role: 'user',
            content: content.trim(),
            createdAt: new Date().toISOString(),
        };

        const assistantMessage: Message = {
            id: `temp-assistant-${Date.now()}`,
            conversationId: currentConversation.id,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            isStreaming: true,
        };

        try {
            setError(null);
            setMessages(prev => [...prev, userMessage, assistantMessage]);
            setIsStreaming(true);

            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: currentConversation.id,
                    content: content.trim(),
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to send message');
            }

            // Process SSE stream
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.token) {
                                fullContent += data.token;
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMessage.id
                                            ? { ...m, content: fullContent }
                                            : m
                                    )
                                );
                            }

                            if (data.done) {
                                // Update with final content
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMessage.id
                                            ? { ...m, content: data.content || fullContent, isStreaming: false }
                                            : m
                                    )
                                );
                            }

                            if (data.error) {
                                throw new Error(data.message || 'Streaming error');
                            }
                        } catch (parseError) {
                            // Skip malformed JSON
                        }
                    }
                }
            }

            // Refresh conversations to update title/stats
            loadConversations();
        } catch (err) {
            if ((err as Error).name === 'AbortError') {
                // User cancelled, just clean up streaming state
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMessage.id
                            ? { ...m, isStreaming: false, content: m.content || '[Cancelled]' }
                            : m
                    )
                );
            } else {
                handleError(err);
                // Remove the failed assistant message
                setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
            }
        } finally {
            setIsStreaming(false);
        }
    }, [currentConversation, handleError, loadConversations]);

    const regenerateResponse = useCallback(async () => {
        if (!currentConversation) return;

        // Abort any existing stream
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        // Find and remove last assistant message
        const lastAssistantIdx = [...messages].reverse().findIndex(m => m.role === 'assistant');
        if (lastAssistantIdx === -1) return;

        const actualIdx = messages.length - 1 - lastAssistantIdx;

        const assistantMessage: Message = {
            id: `temp-regen-${Date.now()}`,
            conversationId: currentConversation.id,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            isStreaming: true,
        };

        try {
            setError(null);
            // Replace last assistant message with streaming placeholder
            setMessages(prev => [
                ...prev.slice(0, actualIdx),
                assistantMessage,
            ]);
            setIsStreaming(true);

            const response = await fetch('/api/chat/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: currentConversation.id,
                }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to regenerate response');
            }

            // Process SSE stream
            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream');

            const decoder = new TextDecoder();
            let fullContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.token) {
                                fullContent += data.token;
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMessage.id
                                            ? { ...m, content: fullContent }
                                            : m
                                    )
                                );
                            }

                            if (data.done) {
                                setMessages(prev =>
                                    prev.map(m =>
                                        m.id === assistantMessage.id
                                            ? { ...m, content: data.content || fullContent, isStreaming: false }
                                            : m
                                    )
                                );
                            }

                            if (data.error) {
                                throw new Error(data.message || 'Streaming error');
                            }
                        } catch (parseError) {
                            // Skip malformed JSON
                        }
                    }
                }
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                handleError(err);
            }
        } finally {
            setIsStreaming(false);
        }
    }, [currentConversation, messages, handleError]);

    return {
        // State
        conversations,
        currentConversation,
        messages,
        isLoading,
        isStreaming,
        error,

        // Actions
        loadConversations,
        createConversation,
        selectConversation,
        deleteConversation,
        updateConversationTitle,
        sendMessage,
        regenerateResponse,
        clearError,
    };
}
