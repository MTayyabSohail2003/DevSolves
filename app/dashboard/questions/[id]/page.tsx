'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Eye, Bookmark, Clock, Share2 } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';
import Loader from '@/app/components/ui/Loader';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Question {
    _id: string;
    title: string;
    body: string;
    tags: string[];
    views: number;
    upvotes: string[];
    downvotes: string[];
    answers: Answer[];
    author?: {
        _id: string;
        name: string;
        avatar?: string;
        reputation?: number;
    };
    createdAt: string;
    updatedAt: string;
}

interface Answer {
    _id: string;
    body: string;
    author?: {
        _id: string;
        name: string;
        avatar?: string;
    };
    upvotes: string[];
    downvotes: string[];
    createdAt: string;
}

interface ApiResponse {
    success: boolean;
    data?: Question;
    message?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
}

// Auto-detect language from code content
function detectLanguage(code: string): string {
    // Check for common patterns
    if (code.includes('import ') && (code.includes(' from ') || code.includes('React'))) return 'tsx';
    if (code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('=>')) return 'javascript';
    if (code.includes('interface ') || code.includes(': string') || code.includes(': number')) return 'typescript';
    if (code.includes('def ') || code.includes('import ') && code.includes(':')) return 'python';
    if (code.includes('public class ') || code.includes('private ') && code.includes('void')) return 'java';
    if (code.includes('SELECT ') || code.includes('FROM ') || code.includes('WHERE ')) return 'sql';
    if (code.includes('<') && code.includes('>') && (code.includes('</') || code.includes('/>'))) return 'markup';
    if (code.includes('{') && code.includes(':') && !code.includes('function')) return 'json';
    if (code.includes('$') || code.includes('npm ') || code.includes('cd ')) return 'bash';
    return 'javascript'; // Default fallback
}

// Highlight all code blocks in a container
function highlightCodeBlocks(container: HTMLElement | null) {
    if (!container) return;

    // Find all code blocks
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
        const codeElement = block as HTMLElement;
        const code = codeElement.textContent || '';

        // Detect language and add class if not present
        if (!codeElement.className.includes('language-')) {
            const lang = detectLanguage(code);
            codeElement.className = `language-${lang}`;
        }

        // Highlight with Prism
        Prism.highlightElement(codeElement);
    });
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function QuestionDetailPage() {
    const params = useParams();
    const [question, setQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!params.id) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/questions/${params.id}`);
                const data: ApiResponse = await response.json();

                if (data.success && data.data) {
                    setQuestion(data.data);
                } else {
                    setError(data.message || 'Question not found');
                }
            } catch (err) {
                console.error('Error fetching question:', err);
                setError('Failed to load question');
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuestion();
    }, [params.id]);

    // Highlight code blocks when question loads
    useEffect(() => {
        if (question && !isLoading) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
                const questionBody = document.querySelector('.question-content');
                highlightCodeBlocks(questionBody as HTMLElement);
            }, 100);
        }
    }, [question, isLoading]);

    // Loading State
    if (isLoading) {
        return <Loader message="Loading question..." variant="default" />;
    }

    // Error State
    if (error || !question) {
        return (
            <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-[var(--text-tertiary)]" />
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Question not found</h2>
                <p className="text-[var(--text-secondary)] mb-4">{error || 'This question may have been deleted or does not exist.'}</p>
                <Link
                    href="/dashboard/questions"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-600)] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Questions
                </Link>
            </div>
        );
    }

    const voteScore = question.upvotes.length - question.downvotes.length;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Link
                href="/dashboard/questions"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Questions
            </Link>

            {/* Question Card */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                {/* Header - Author & Stats */}
                <div className="px-6 py-4 border-b border-[var(--border-light)] flex flex-wrap items-center justify-between gap-4">
                    {/* Author */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center text-sm font-semibold text-white">
                            {(question.author?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="font-medium text-[var(--text-primary)]">
                                {question.author?.name || 'Anonymous'}
                            </div>
                            {question.author?.reputation && (
                                <div className="text-xs text-[var(--text-tertiary)]">
                                    {formatNumber(question.author.reputation)} reputation
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[var(--color-primary-500)]">
                            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-semibold text-sm sm:text-base">{formatNumber(voteScore)}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 text-[var(--text-secondary)]">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-semibold text-sm sm:text-base">{question.answers.length}</span>
                        </div>
                        <button className="p-1.5 sm:p-2 text-[var(--text-tertiary)] hover:text-[var(--color-warning-500)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
                            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Question Content */}
                <div className="px-6 py-6">
                    {/* Title */}
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
                        {question.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-tertiary)] mb-6">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>Asked {formatTimeAgo(question.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                            <span>{question.answers.length} Answers</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span>{formatNumber(question.views)} Views</span>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div
                        className="question-content prose prose-invert max-w-none mb-6 text-[var(--text-secondary)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: question.body }}
                    />

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border-light)]">
                        {question.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-light)]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-4 sm:px-6 py-4 bg-[var(--bg-secondary)] border-t border-[var(--border-light)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--color-success-500)]/10 text-[var(--color-success-500)] rounded-lg font-medium hover:bg-[var(--color-success-500)]/20 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            Upvote
                        </button>
                        <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg font-medium hover:bg-[var(--border-light)] transition-colors">
                            <ThumbsDown className="w-4 h-4" />
                            Downvote
                        </button>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </div>

            {/* Answers Section */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-light)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                        {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                    </h2>
                </div>

                {question.answers.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[var(--text-tertiary)]" />
                        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No answers yet</h3>
                        <p className="text-[var(--text-secondary)] mb-4">Be the first to answer this question!</p>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-600)] transition-colors">
                            Write an Answer
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border-light)]">
                        {question.answers.map((answer) => (
                            <div key={answer._id} className="px-6 py-5">
                                <div className="flex items-start gap-4">
                                    {/* Vote Buttons - Visible on all screen sizes */}
                                    <div className="flex sm:flex-col items-center gap-2 sm:gap-2 order-first sm:order-none mb-2 sm:mb-0">
                                        <button className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-success-500)] transition-colors">
                                            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                        <span className="text-sm font-semibold text-[var(--text-primary)] min-w-[2rem] text-center">
                                            {answer.upvotes.length - answer.downvotes.length}
                                        </span>
                                        <button className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--color-error-500)] transition-colors">
                                            <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>

                                    {/* Answer Content */}
                                    <div className="flex-1 min-w-0">
                                        <div
                                            className="prose prose-invert max-w-none text-[var(--text-secondary)] mb-4"
                                            dangerouslySetInnerHTML={{ __html: answer.body }}
                                        />
                                        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center text-[8px] font-semibold text-white">
                                                {(answer.author?.name || 'A').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-[var(--text-primary)]">
                                                {answer.author?.name || 'Anonymous'}
                                            </span>
                                            <span>answered {formatTimeAgo(answer.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Write Answer Section */}
            <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border-light)]">
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Your Answer</h2>
                </div>
                <div className="p-6">
                    <textarea
                        placeholder="Write your answer here... You can use markdown for formatting."
                        className="w-full h-40 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] resize-none"
                    />
                    <div className="flex justify-end mt-4">
                        <button className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-600)] transition-colors">
                            Post Answer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
