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
import TiptapEditor from '@/app/components/editor/TiptapEditor';

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
// EXAMPLE: BACKEND INTEGRATION FUNCTIONS
// ============================================

/**
 * Example: Save question to backend
 * Replace this with your actual API call
 */
const saveQuestion = async (data: QuestionData): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real implementation, you would:
    // const response = await fetch('/api/questions', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return await response.json();

    console.log('Question saved:', data);
    return { success: true, id: 'example-id-123' };
  } catch (error) {
    console.error('Failed to save question:', error);
    return { success: false, error: 'Failed to save question' };
  }
};

/**
 * Example: Load saved draft from backend
 * Replace this with your actual API call
 */
const loadDraft = async (): Promise<QuestionData | null> => {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In real implementation, you would:
    // const response = await fetch('/api/questions/draft');
    // if (response.ok) {
    //   return await response.json();
    // }

    // Return null if no draft exists
    return null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function AskQuestionPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');

  // UI state
  const [isPosting, setIsPosting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ============================================
  // LOAD SAVED DRAFT ON MOUNT
  // ============================================

  useEffect(() => {
    const loadSavedDraft = async () => {
      setIsLoading(true);
      try {
        const draft = await loadDraft();
        if (draft) {
          setTitle(draft.title);
          setBody(draft.body);
          setTags(draft.tags.join(', '));
          setMessage({ type: 'success', text: 'Draft loaded successfully' });
          // Clear success message after 3 seconds
          setTimeout(() => setMessage(null), 3000);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedDraft();
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
   * Parse tags from comma-separated string
   */
  const parseTags = (tagString: string): string[] => {
    return tagString
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)
      .slice(0, 5); // Max 5 tags
  };

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
      const result = await saveQuestion({
        title: title.trim(),
        body,
        tags: parseTags(tags),
        status: 'published',
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Question posted successfully!' });
        // In real app, you would redirect to the question page:
        // router.push(`/questions/${result.id}`);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to post question' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsPosting(false);
    }
  };

  /**
   * Handle saving as draft
   */
  const handleSaveDraft = async () => {
    if (!title.trim() && !body.trim()) {
      setMessage({ type: 'error', text: 'Nothing to save' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const result = await saveQuestion({
        title: title.trim(),
        body,
        tags: parseTags(tags),
        status: 'draft',
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Draft saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save draft' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsSaving(false);
    }
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
            htmlFor="question-tags"
            className="block text-sm font-medium text-[var(--text-primary)] mb-2"
          >
            Tags
          </label>
          <input
            id="question-tags"
            type="text"
            placeholder="e.g. javascript, react, nextjs"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 border-[var(--border-light)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-[var(--bg-primary)] hover:border-[var(--border-medium)] transition-all"
            aria-describedby="tags-hint"
          />
          <p id="tags-hint" className="mt-2 text-sm text-[var(--text-tertiary)]">
            Add up to 5 tags to describe what your question is about (comma-separated)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-4 border-t border-[var(--border-light)]">
          <button
            onClick={handlePost}
            disabled={isPosting || isSaving}
            className="h-10 px-6 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
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
            onClick={handleSaveDraft}
            disabled={isPosting || isSaving}
            className="h-10 px-6 border-2 border-[var(--border-light)] hover:border-[var(--color-primary-400)] disabled:opacity-50 disabled:cursor-not-allowed text-[var(--text-primary)] font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
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
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-light)] p-6">
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
