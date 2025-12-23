import React from 'react';
import Link from 'next/link';
import { MessageSquare, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  // Sample stats data
  const stats = [
    { label: 'Questions', value: '12.5K', icon: MessageSquare, trend: '+12%', color: 'var(--color-primary-500)' },
    { label: 'Active Users', value: '3.2K', icon: Users, trend: '+8%', color: 'var(--color-success-500)' },
    { label: 'Answers Today', value: '847', icon: TrendingUp, trend: '+23%', color: 'var(--color-accent-500)' },
    { label: 'Reputation', value: '156', icon: Zap, trend: '+5', color: 'var(--color-warning-500)' },
  ];

  // Sample recent questions
  const recentQuestions = [
    {
      id: '1',
      title: 'How to implement authentication in Next.js 14 with Server Actions?',
      tags: ['nextjs', 'authentication', 'server-actions'],
      votes: 12,
      answers: 3,
      views: 234,
      user: 'John Doe',
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Best practices for TypeScript generic types with React components',
      tags: ['typescript', 'react', 'generics'],
      votes: 8,
      answers: 5,
      views: 156,
      user: 'Jane Smith',
      time: '4 hours ago',
    },
    {
      id: '3',
      title: 'How to optimize Tailwind CSS bundle size in production?',
      tags: ['tailwindcss', 'optimization', 'css'],
      votes: 15,
      answers: 7,
      views: 312,
      user: 'Alex Johnson',
      time: '6 hours ago',
    },
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
          <Link
            href="/dashboard/questions"
            className="text-sm font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-[var(--border-light)]">
          {recentQuestions.map((question) => (
            <Link
              key={question.id}
              href={`/dashboard/questions/${question.id}`}
              className="block px-6 py-4 hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Stats */}
                <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[60px]">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">{question.votes}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">votes</div>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[60px] px-2 py-1 rounded-lg bg-[var(--color-success-500)]/10">
                  <div className="text-sm font-semibold text-[var(--color-success-500)]">{question.answers}</div>
                  <div className="text-xs text-[var(--color-success-500)]">answers</div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[var(--text-primary)] font-medium mb-2 line-clamp-2 group-hover:text-[var(--color-primary-600)]">
                    {question.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <span>{question.user}</span>
                    <span>•</span>
                    <span>{question.time}</span>
                    <span>•</span>
                    <span>{question.views} views</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
