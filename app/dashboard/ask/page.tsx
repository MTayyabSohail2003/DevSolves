'use client';

import React, { useState } from 'react';

export default function AskQuestionPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Ask a Question</h1>
        <p className="text-[var(--text-secondary)]">
          Get help from the community. Be specific and provide enough details.
        </p>
      </div>

      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] p-6 space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. How do I implement authentication in Next.js?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-[var(--bg-primary)] hover:border-[var(--border-medium)] transition-all"
          />
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">
            Be specific and imagine you&apos;re asking another person
          </p>
        </div>

        {/* Body Textarea */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Body
          </label>
          <textarea
            placeholder="Describe your problem in detail. Include what you've tried and any error messages."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full px-4 py-3 bg-[var(--bg-secondary)] border-2 border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-[var(--bg-primary)] transition-all resize-none"
          />
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">
            Tip: You can use Markdown for formatting
          </p>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="e.g. javascript, react, nextjs"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-[var(--bg-primary)] hover:border-[var(--border-medium)] transition-all"
          />
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">
            Add up to 5 tags to describe what your question is about
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-light)]">
          <button className="h-10 px-6 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-medium rounded-lg transition-colors">
            Post Question
          </button>
          <button className="h-10 px-6 border-2 border-[var(--border-light)] hover:border-[var(--color-primary-400)] text-[var(--text-primary)] font-medium rounded-lg transition-colors">
            Save as Draft
          </button>
        </div>
      </div>

      {/* Tips Sidebar */}
      <div className="bg-[var(--color-primary-50)] rounded-2xl border border-[var(--color-primary-200)] p-6">
        <h3 className="font-semibold text-[var(--color-primary-700)] mb-3">Writing a good question</h3>
        <ul className="space-y-2 text-sm text-[var(--color-primary-600)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary-500)]">•</span>
            Summarize your problem in a one-line title
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary-500)]">•</span>
            Describe what you expected and what actually happened
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary-500)]">•</span>
            Include relevant code samples and error messages
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary-500)]">•</span>
            Tag with relevant technologies
          </li>
        </ul>
      </div>
    </div>
  );
}
