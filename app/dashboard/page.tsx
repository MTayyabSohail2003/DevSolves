'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, TrendingUp, Users, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { MobileSidebarContent } from '@/app/components/dashboard';
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
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
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

export default function DashboardPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Fetch recent questions
  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/questions?limit=5&sort=newest');
      const data: QuestionsResponse = await response.json();

      if (data.success) {
        setQuestions(data.data);
        setTotalQuestions(data.pagination.total);
      } else {
        setError('Failed to load questions');
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Sample stats data (can be fetched from API later)
  const stats = [
    { label: 'Questions', value: totalQuestions.toString(), icon: MessageSquare, trend: '+12%', color: 'var(--color-primary-500)' },
    { label: 'Active Users', value: '3.2K', icon: Users, trend: '+8%', color: 'var(--color-success-500)' },
    { label: 'Answers Today', value: '847', icon: TrendingUp, trend: '+23%', color: 'var(--color-accent-500)' },
    { label: 'Reputation', value: '156', icon: Zap, trend: '+5', color: 'var(--color-warning-500)' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-600)] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-white/80 mb-4">
          Ready to help the community? Check out the latest questions or share your knowledge.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/questions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
          >
            Browse Questions
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/ask"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[var(--color-primary-600)] hover:bg-white/90 rounded-lg font-medium transition-colors"
          >
            Ask a Question
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border-light)] hover:border-[var(--color-primary-400)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-medium text-[var(--color-success-500)] bg-[var(--color-success-500)]/10 px-2 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</div>
              <div className="text-sm text-[var(--text-tertiary)]">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Questions */}
      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-light)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Recent Questions</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchQuestions}
              disabled={isLoading}
              className="p-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors disabled:opacity-50"
              aria-label="Refresh questions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/dashboard/questions"
              className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>

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
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No questions yet</h3>
            <p className="text-[var(--text-secondary)] mb-4">Be the first to ask a question!</p>
            <Link
              href="/dashboard/ask"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-600)] transition-colors"
            >
              Ask a Question
            </Link>
          </div>
        )}

        {/* Questions List */}
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

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--color-primary-500)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="font-medium">
                        {formatNumber(question.upvotes.length - question.downvotes.length)} Votes
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">
                        {formatNumber(question.answers.length)} Answers
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="font-medium">
                        {formatNumber(question.views)} Views
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Content - Shows on screens smaller than xl */}
      <MobileSidebarContent />
    </div>
  );
}
