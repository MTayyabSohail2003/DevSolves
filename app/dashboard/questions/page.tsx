'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, MessageSquare, Plus, RefreshCw, Filter } from 'lucide-react';
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
  answers: string[];
  author?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

interface QuestionsResponse {
  success: boolean;
  data: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: sortBy,
      });

      if (searchQuery.trim()) {
        params.set('search', searchQuery.trim());
      }

      const response = await fetch(`/api/questions?${params}`);
      const data: QuestionsResponse = await response.json();

      if (data.success) {
        setQuestions(data.data);
        setTotalPages(data.pagination.pages);
        setTotal(data.pagination.total);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [page, sortBy, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Questions</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            {total} question{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/ask"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ask Question
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]"
            />
          </div>
        </form>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[var(--text-tertiary)] hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="h-10 px-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] flex-1 sm:flex-initial"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="votes">Most Votes</option>
            <option value="views">Most Views</option>
          </select>

          <button
            onClick={fetchQuestions}
            disabled={isLoading}
            className="h-10 w-10 flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50 shrink-0"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--text-tertiary)] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
        {/* Loading State */}
        {isLoading && (
          <div className="px-6 py-12">
            <Loader fullScreen={false} variant="dots" size="md" message="Loading questions..." />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="px-6 py-12 text-center">
            <p className="text-[var(--color-error-500)] mb-3">{error}</p>
            <button
              onClick={fetchQuestions}
              className="text-sm text-[var(--color-primary-600)] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && questions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {searchQuery ? 'No questions found' : 'No questions yet'}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Be the first to ask a question!'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/ask"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-600)] transition-colors"
              >
                Ask a Question
              </Link>
            )}
          </div>
        )}

        {/* Questions */}
        {!isLoading && !error && questions.length > 0 && (
          <div className="divide-y divide-[var(--border-light)]">
            {questions.map((question) => (
              <Link
                key={question._id}
                href={`/dashboard/questions/${question._id}`}
                className="block px-6 py-5 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                {/* Title */}
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 line-clamp-2 hover:text-[var(--color-primary-500)] transition-colors">
                  {question.title}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg border border-[var(--border-light)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author & Stats Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center text-xs font-semibold text-white">
                      {question.author?.avatar ? (
                        <img
                          src={question.author.avatar}
                          alt={question.author.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (question.author?.name || 'A').charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {question.author?.name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-[var(--text-tertiary)]">
                      • asked {formatTimeAgo(question.createdAt)}
                    </span>
                  </div>

                  {/* Stats - Hide views on very small screens */}
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[var(--color-primary-500)]">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="font-medium">
                        {formatNumber(question.upvotes.length - question.downvotes.length)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[var(--text-secondary)]">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">
                        {formatNumber(question.answers.length)}
                      </span>
                    </div>
                    <div className="hidden xs:flex items-center gap-1 sm:gap-1.5 text-[var(--text-tertiary)]">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-medium">
                        {formatNumber(question.views)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-[var(--border-light)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--border-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-[var(--text-tertiary)] order-first sm:order-none">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-lg hover:bg-[var(--border-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
