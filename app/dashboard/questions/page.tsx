import React from 'react';

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Questions</h1>
        <div className="flex items-center gap-2">
          <select className="h-10 px-4 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary-500)]">
            <option>Newest</option>
            <option>Active</option>
            <option>Unanswered</option>
            <option>Most Votes</option>
          </select>
        </div>
      </div>

      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
          <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Questions Page</h3>
        <p className="text-[var(--text-secondary)]">
          This page will display all questions from the community.
        </p>
      </div>
    </div>
  );
}
