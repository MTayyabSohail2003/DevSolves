'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { popularQuestions, trendingTags } from '@/config/navigation';
import { Flame, TrendingUp, TrendingDown, Minus, MessageSquare, ArrowUp, ChevronLeft } from 'lucide-react';

// Helper function for trend icons
const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-3 h-3 text-[var(--color-success-500)]" />;
    case 'down':
      return <TrendingDown className="w-3 h-3 text-[var(--color-error-500)]" />;
    default:
      return <Minus className="w-3 h-3 text-[var(--text-tertiary)]" />;
  }
};

// Trending Tags Component (reusable)
export function TrendingTagsSection({ compact = false }: { compact?: boolean }) {
  const displayTags = compact ? trendingTags.slice(0, 6) : trendingTags;

  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[var(--color-primary-500)]" />
          Trending Tags
        </h3>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => (
            <Link
              key={tag.name}
              href={`/dashboard/tags/${tag.name}`}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--color-primary-500)]/10 rounded-lg transition-colors"
            >
              <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--color-primary-600)]">
                #{tag.name}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">
                {tag.count}
              </span>
              {getTrendIcon(tag.trend)}
            </Link>
          ))}
        </div>
      </div>
      <Link
        href="/dashboard/tags"
        className="block px-4 py-3 text-sm text-center font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] hover:bg-[var(--bg-secondary)] border-t border-[var(--border-light)] transition-colors"
      >
        Explore all tags →
      </Link>
    </div>
  );
}

// Quick Stats Component (reusable)
export function QuickStatsSection({ horizontal = false }: { horizontal?: boolean }) {
  return (
    <div className="bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-600)] rounded-2xl p-4 text-white">
      <h3 className="font-semibold mb-3">Your Activity</h3>
      <div className={`grid ${horizontal ? 'grid-cols-4' : 'grid-cols-2'} gap-3`}>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs opacity-80">Questions</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">48</div>
          <div className="text-xs opacity-80">Answers</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">156</div>
          <div className="text-xs opacity-80">Reputation</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">3</div>
          <div className="text-xs opacity-80">Badges</div>
        </div>
      </div>
    </div>
  );
}

// Mobile Sidebar Content (for embedding in main content on smaller screens)
export function MobileSidebarContent() {
  return (
    <div className="xl:hidden space-y-4 mt-6">
      {/* Horizontal Quick Stats for Mobile */}
      <QuickStatsSection horizontal />

      {/* Compact Trending Tags for Mobile */}
      <TrendingTagsSection compact />
    </div>
  );
}

// Main Desktop Right Sidebar
export default function RightSidebar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      className={`
        hidden xl:block h-[calc(100vh-4rem)] sticky top-16 py-6 overflow-hidden
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-80 pr-6' : 'w-12 pr-2'}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Expand indicator */}
      <div className={`
        absolute left-0 top-1/2 -translate-y-1/2 z-10
        w-5 h-10 flex items-center justify-center
        bg-[var(--bg-secondary)] border border-[var(--border-light)] border-l-0
        rounded-r-lg shadow-sm
        transition-all duration-300
        ${isExpanded ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'}
      `}>
        <ChevronLeft className="w-3 h-3 text-[var(--text-tertiary)]" />
      </div>

      <div className={`
        space-y-6 overflow-y-auto h-full transition-all duration-300
        ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}
      `}>
        {/* Popular Questions */}
        <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-light)] bg-[var(--bg-secondary)]">
            <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[var(--color-primary-500)]" />
              Popular Questions
            </h3>
          </div>
          <div className="divide-y divide-[var(--border-light)]">
            {popularQuestions.map((question) => (
              <Link
                key={question.id}
                href={`/dashboard/questions/${question.id}`}
                className="block px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors group"
              >
                <div className="flex items-start gap-2">
                  {question.isHot && (
                    <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-[var(--color-primary-500)] text-white rounded">
                      Hot
                    </span>
                  )}
                  <p className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] line-clamp-2 transition-colors">
                    {question.title}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    {question.votes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {question.answers}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link
            href="/dashboard/questions"
            className="block px-4 py-3 text-sm text-center font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-500)] hover:bg-[var(--bg-secondary)] border-t border-[var(--border-light)] transition-colors"
          >
            View all questions →
          </Link>
        </div>

        {/* Trending Tags */}
        <TrendingTagsSection />

        {/* Quick Stats */}
        <QuickStatsSection />
      </div>
    </aside>
  );
}


