'use client';

/**
 * ConversationSidebar Component
 * =============================
 * Sidebar showing conversation history - always visible
 */

import { useState } from 'react';
import { Conversation } from '@/lib/hooks/useChat';

interface ConversationSidebarProps {
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelect: (conversationId: string) => void;
    onDelete: (conversationId: string) => void;
    onNewChat: () => void;
    isLoading?: boolean;
}

export function ConversationSidebar({
    conversations,
    currentConversationId,
    onSelect,
    onDelete,
    onNewChat,
    isLoading = false,
}: ConversationSidebarProps) {
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const handleDelete = (e: React.MouseEvent, conversationId: string) => {
        e.stopPropagation();
        if (deleteConfirm === conversationId) {
            onDelete(conversationId);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(conversationId);
            // Auto-reset after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    // Group conversations by date
    const groupedConversations = conversations.reduce((groups, conv) => {
        const dateLabel = formatDate(conv.updatedAt || conv.createdAt);
        if (!groups[dateLabel]) groups[dateLabel] = [];
        groups[dateLabel].push(conv);
        return groups;
    }, {} as Record<string, Conversation[]>);

    return (
        <aside className="chat-sidebar w-72">
            {/* New Chat Button */}
            <button onClick={onNewChat} className="chat-new-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                <span>New Chat</span>
            </button>

            {/* Conversations List */}
            <div className="chat-conversations">
                {isLoading ? (
                    <div className="chat-sidebar-loading">
                        <div className="chat-sidebar-skeleton"></div>
                        <div className="chat-sidebar-skeleton"></div>
                        <div className="chat-sidebar-skeleton"></div>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="chat-sidebar-empty">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 opacity-50 mb-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>
                        <p>No conversations yet</p>
                        <p className="text-sm opacity-70">Start a new chat to begin</p>
                    </div>
                ) : (
                    Object.entries(groupedConversations).map(([dateLabel, convs]) => (
                        <div key={dateLabel} className="chat-conversation-group">
                            <div className="chat-date-label">{dateLabel}</div>
                            {convs.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => onSelect(conv.id)}
                                    className={`chat-conversation-item ${currentConversationId === conv.id ? 'active' : ''
                                        }`}
                                >
                                    <div className="chat-conversation-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                            <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="chat-conversation-content">
                                        <span className="chat-conversation-title">
                                            {conv.title}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(e, conv.id)}
                                        className={`chat-conversation-delete ${deleteConfirm === conv.id ? 'confirm' : ''
                                            }`}
                                        title={deleteConfirm === conv.id ? 'Click again to confirm' : 'Delete'}
                                    >
                                        {deleteConfirm === conv.id ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
}

