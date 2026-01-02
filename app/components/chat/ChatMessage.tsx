'use client';

/**
 * ChatMessage Component
 * =====================
 * Renders individual chat messages with styling for user/assistant
 */

import { useState } from 'react';
import { Message } from '@/lib/hooks/useChat';

interface ChatMessageProps {
    message: Message;
    onRegenerate?: () => void;
    isLast?: boolean;
    canRegenerate?: boolean;
}

export function ChatMessage({
    message,
    onRegenerate,
    isLast = false,
    canRegenerate = false,
}: ChatMessageProps) {
    const [copied, setCopied] = useState(false);

    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Format message content with basic markdown support
    const formatContent = (content: string) => {
        // Split by code blocks
        const parts = content.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                // Extract language and code
                const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
                if (match) {
                    const [, lang, code] = match;
                    return (
                        <pre key={index} className="chat-code-block">
                            {lang && <span className="chat-code-lang">{lang}</span>}
                            <code>{code.trim()}</code>
                        </pre>
                    );
                }
            }
            // Regular text - handle inline code and basic formatting
            return (
                <span key={index} className="whitespace-pre-wrap">
                    {part.split(/(`[^`]+`)/g).map((segment, i) => {
                        if (segment.startsWith('`') && segment.endsWith('`')) {
                            return (
                                <code key={i} className="chat-inline-code">
                                    {segment.slice(1, -1)}
                                </code>
                            );
                        }
                        return segment;
                    })}
                </span>
            );
        });
    };

    return (
        <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}>
            {/* Avatar */}
            <div className={`chat-avatar ${isUser ? 'chat-avatar-user' : 'chat-avatar-assistant'}`}>
                {isUser ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 2a2 2 0 012 2v1h1a3 3 0 013 3v1h1a2 2 0 110 4h-1v1a3 3 0 01-3 3h-1v1a2 2 0 11-4 0v-1H9a3 3 0 01-3-3v-1H5a2 2 0 110-4h1V8a3 3 0 013-3h1V4a2 2 0 012-2z" />
                    </svg>
                )}
            </div>

            {/* Content */}
            <div className="chat-content">
                <div className="chat-role">
                    {isUser ? 'You' : 'DevSolve AI'}
                </div>
                <div className={`chat-text ${message.isStreaming ? 'chat-streaming' : ''}`}>
                    {formatContent(message.content)}
                    {message.isStreaming && (
                        <span className="chat-cursor">▋</span>
                    )}
                </div>

                {/* Actions */}
                {isAssistant && !message.isStreaming && message.content && (
                    <div className="chat-actions">
                        <button
                            onClick={handleCopy}
                            className="chat-action-btn"
                            title="Copy message"
                        >
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.44A1.5 1.5 0 008.378 6H4.5z" />
                                </svg>
                            )}
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>

                        {isLast && canRegenerate && onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                className="chat-action-btn"
                                title="Regenerate response"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0v2.43l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                                </svg>
                                <span>Regenerate</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
