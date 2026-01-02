'use client';

/**
 * Ask Question Page
 * 
 * Allows users to compose and submit questions using a rich text editor.
 * Features:
 * - Title input
 * - TipTap rich text editor for body
 * - Tags input
 * - Save/Post functionality with example backend integration
 * 
 * @author DevSolve Team
 * @version 2.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TiptapEditor from '@/app/components/editor/TiptapEditor';
import TagInput from '@/app/components/ui/TagInput';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface QuestionData {
  id?: string;
  title: string;
  body: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// API INTEGRATION FUNCTIONS
// ============================================

interface ApiResponse {
  success: boolean;
  data?: {
    _id: string;
    title: string;
    body: string;
    tags: string[];
  };
  message?: string;
}

/**
 * Create a question via API
 */
const createQuestion = async (data: { title: string; body: string; tags: string[] }): Promise<ApiResponse> => {
  try {
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    return await response.json();
  } catch (error) {
    console.error('Failed to create question:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};


// ============================================
// MAIN COMPONENT
// ============================================

export default function AskQuestionPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // UI state
  const [isPosting, setIsPosting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // No draft loading - ready to create new question
  useEffect(() => {
    // Clear any stale state on mount
    setTitle('');
    setBody('');
    setTags([]);
    setMessage(null);
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handle body content changes from TipTap editor
   */
  const handleBodyChange = useCallback((html: string) => {
    setBody(html);
  }, []);

  /**
   * Handle tag changes from TagInput component
   */
  const handleTagsChange = useCallback((newTags: string[]) => {
    setTags(newTags);
  }, []);

  /**
   * Validate form before submission
   */
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Please enter a title for your question';
    }
    if (title.trim().length < 10) {
      return 'Title should be at least 10 characters';
    }

    // Check if body has actual content (not just empty HTML tags)
    const strippedBody = body.replace(/<[^>]*>/g, '').trim();
    if (!strippedBody) {
      return 'Please describe your question in the body';
    }
    if (strippedBody.length < 30) {
      return 'Body should be at least 30 characters';
    }

    return null;
  };

  /**
   * Handle posting the question
   */
  const handlePost = async () => {
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsPosting(true);
    setMessage(null);

    try {
      const result = await createQuestion({
        title: title.trim(),
        body,
        tags,
      });

      if (result.success && result.data) {
        setMessage({ type: 'success', text: 'Question posted successfully! Redirecting...' });
        // Clear form
        setTitle('');
        setBody('');
        setTags([]);
        // Redirect to questions page after short delay
        setTimeout(() => {
          router.push('/dashboard/questions');
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to post question' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsPosting(false);
    }
  };

  /**
   * Handle clearing the form
   */
  const handleClear = () => {
    setTitle('');
    setBody('');
    setTags([]);
    setMessage(null);
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-tertiary)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Ask a Question</h1>
        <p className="text-[var(--text-secondary)]">
          Get help from the community. Be specific and provide enough details.
        </p>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === 'success'
            ? 'bg-[var(--color-success-50)] text-[var(--color-success-600)] border border-[var(--color-success-500)]'
            : 'bg-[var(--color-error-50)] text-[var(--color-error-600)] border border-[var(--color-error-500)]'
            }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] p-6 space-y-6">
        {/* Title Input */}
        <div>
          <label
            htmlFor="question-title"
            className="block text-sm font-medium text-[var(--text-primary)] mb-2"
          >
            Title
          </label>
          <input
            id="question-title"
            type="text"
            placeholder="e.g. How do I implement authentication in Next.js?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-[var(--bg-primary)] hover:border-[var(--border-medium)] transition-all"
            aria-describedby="title-hint"
          />
          <p id="title-hint" className="mt-2 text-sm text-[var(--text-tertiary)]">
            Be specific and imagine you&apos;re asking another person
          </p>
        </div>

        {/* Body - TipTap Rich Text Editor */}
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
            Body
          </label>
          <TiptapEditor
            value={body}
            onChange={handleBodyChange}
            placeholder="Describe your problem in detail. Include what you've tried and any error messages..."
            ariaLabel="Question body editor"
          />
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">
            Tip: Use the toolbar to format your code, add links, and include images
          </p>
        </div>

        {/* Tags Input */}
        <div>
          <label
            className="block text-sm font-medium text-[var(--text-primary)] mb-2"
          >
            Tags
          </label>
          <TagInput
            value={tags}
            onChange={handleTagsChange}
            placeholder="Add a tag (e.g. javascript)"
            maxTags={5}
            ariaLabel="Question tags"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 border-t border-[var(--border-light)]">
          <button
            onClick={handlePost}
            disabled={isPosting || isSaving}
            className="h-11 sm:h-10 px-6 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2 order-first"
          >
            {isPosting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </>
            ) : (
              'Post Question'
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isPosting}
            className="h-11 sm:h-10 px-6 border-2 border-[var(--border-light)] hover:border-[var(--border-medium)] hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] font-medium rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            Clear
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

      {/* Keyboard Shortcuts Info */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-light)] p-4 sm:p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs font-mono">Ctrl+B</kbd>
            <span className="text-[var(--text-secondary)]">Bold</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs font-mono">Ctrl+I</kbd>
            <span className="text-[var(--text-secondary)]">Italic</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs font-mono">Ctrl+U</kbd>
            <span className="text-[var(--text-secondary)]">Underline</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-[var(--bg-tertiary)] rounded text-xs font-mono">Ctrl+Z</kbd>
            <span className="text-[var(--text-secondary)]">Undo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
