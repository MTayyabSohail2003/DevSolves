'use client';

/**
 * AI Chat Page
 * ============
 * Main chat interface with conversation sidebar and streaming messages
 */

import { useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/lib/hooks';
import { ChatMessage } from '@/app/components/chat/ChatMessage';
import { ChatInput } from '@/app/components/chat/ChatInput';
import { ConversationSidebar } from '@/app/components/chat/ConversationSidebar';

export default function ChatPage() {
    const {
        conversations,
        currentConversation,
        messages,
        isLoading,
        isStreaming,
        error,
        loadConversations,
        createConversation,
        selectConversation,
        deleteConversation,
        sendMessage,
        regenerateResponse,
        clearError,
    } = useChat();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleNewChat = useCallback(async () => {
        await createConversation();
    }, [createConversation]);

    const handleSendMessage = useCallback(async (content: string) => {
        if (!currentConversation) {
            // Create new conversation first
            const conv = await createConversation();
            if (conv) {
                // Wait for state to update, then send
                setTimeout(() => sendMessage(content), 100);
            }
        } else {
            await sendMessage(content);
        }
    }, [currentConversation, createConversation, sendMessage]);

    // Find the last assistant message for regeneration
    const lastAssistantMessageIdx = [...messages]
        .reverse()
        .findIndex(m => m.role === 'assistant');
    const canRegenerate = lastAssistantMessageIdx !== -1 && !isStreaming;

    return (
        <div className="chat-page">
            {/* Sidebar */}
            <ConversationSidebar
                conversations={conversations}
                currentConversationId={currentConversation?.id || null}
                onSelect={selectConversation}
                onDelete={deleteConversation}
                onNewChat={handleNewChat}
                isLoading={isLoading && conversations.length === 0}
            />

            {/* Main Chat Area */}
            <main className="chat-main">
                {/* Error Banner */}
                {error && (
                    <div className="chat-error">
                        <span>{error}</span>
                        <button onClick={clearError} className="chat-error-close">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Messages Area */}
                <div className="chat-messages" ref={chatContainerRef}>
                    {!currentConversation && messages.length === 0 ? (
                        <div className="chat-welcome">
                            <div className="chat-welcome-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16">
                                    <path d="M12 2a2 2 0 012 2v1h1a3 3 0 013 3v1h1a2 2 0 110 4h-1v1a3 3 0 01-3 3h-1v1a2 2 0 11-4 0v-1H9a3 3 0 01-3-3v-1H5a2 2 0 110-4h1V8a3 3 0 013-3h1V4a2 2 0 012-2z" />
                                </svg>
                            </div>
                            <h1 className="chat-welcome-title">DevSolve AI</h1>
                            <p className="chat-welcome-text">
                                Your intelligent coding assistant. Ask questions, debug code, or explore new concepts.
                            </p>
                            <div className="chat-suggestions">
                                <button
                                    onClick={() => handleSendMessage("Explain the difference between REST and GraphQL")}
                                    className="chat-suggestion"
                                >
                                    <span className="chat-suggestion-icon">💡</span>
                                    Explain REST vs GraphQL
                                </button>
                                <button
                                    onClick={() => handleSendMessage("How do I optimize React performance?")}
                                    className="chat-suggestion"
                                >
                                    <span className="chat-suggestion-icon">⚡</span>
                                    Optimize React Performance
                                </button>
                                <button
                                    onClick={() => handleSendMessage("Write a TypeScript function to debounce API calls")}
                                    className="chat-suggestion"
                                >
                                    <span className="chat-suggestion-icon">🔧</span>
                                    Write a Debounce Function
                                </button>
                                <button
                                    onClick={() => handleSendMessage("What are the best practices for MongoDB schema design?")}
                                    className="chat-suggestion"
                                >
                                    <span className="chat-suggestion-icon">📊</span>
                                    MongoDB Best Practices
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages
                                .filter(m => m.role !== 'system')
                                .map((message, index, filteredMessages) => (
                                    <ChatMessage
                                        key={message.id}
                                        message={message}
                                        isLast={index === filteredMessages.length - 1}
                                        canRegenerate={canRegenerate}
                                        onRegenerate={regenerateResponse}
                                    />
                                ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <ChatInput
                        onSend={handleSendMessage}
                        disabled={isStreaming}
                        placeholder={
                            !currentConversation
                                ? "Start a new conversation..."
                                : "Send a message..."
                        }
                    />
                    <div className="chat-footer-text">
                        DevSolve AI can make mistakes. Please verify important information.
                    </div>
                </div>
            </main>
        </div>
    );
}
