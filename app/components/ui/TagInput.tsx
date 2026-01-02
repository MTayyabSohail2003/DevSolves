'use client';

/**
 * TagInput - Industry-level tag input component
 * 
 * Features:
 * - Visual tag badges with remove functionality
 * - Keyboard support (Enter to add, Backspace to remove)
 * - Auto-suggestions (optional)
 * - Maximum tags limit
 * - Duplicate prevention
 * - Animated transitions
 * - Full accessibility support
 * 
 * @author DevSolve Team
 * @version 1.0.0
 */

import React, { useState, useRef, useCallback, KeyboardEvent, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TagInputProps {
    /** Current tags array */
    value: string[];
    /** Callback when tags change */
    onChange: (tags: string[]) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Maximum number of tags allowed */
    maxTags?: number;
    /** Maximum length of each tag */
    maxTagLength?: number;
    /** Minimum length of each tag */
    minTagLength?: number;
    /** Whether the input is disabled */
    disabled?: boolean;
    /** Suggested tags to show */
    suggestions?: string[];
    /** Aria label for accessibility */
    ariaLabel?: string;
    /** Additional CSS classes */
    className?: string;
    /** Error message to display */
    error?: string;
}

// ============================================
// POPULAR TAG SUGGESTIONS
// ============================================

const DEFAULT_SUGGESTIONS = [
    'javascript',
    'typescript',
    'react',
    'nextjs',
    'nodejs',
    'python',
    'css',
    'html',
    'api',
    'database',
    'mongodb',
    'postgresql',
    'tailwindcss',
    'git',
    'docker',
];

// ============================================
// TAG INPUT COMPONENT
// ============================================

export default function TagInput({
    value = [],
    onChange,
    placeholder = 'Add a tag...',
    maxTags = 5,
    maxTagLength = 25,
    minTagLength = 2,
    disabled = false,
    suggestions = DEFAULT_SUGGESTIONS,
    ariaLabel = 'Tags',
    className = '',
    error,
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showPopularTags, setShowPopularTags] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // ============================================
    // FILTERED SUGGESTIONS
    // ============================================

    const filteredSuggestions = suggestions.filter(
        (suggestion) =>
            suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
            !value.includes(suggestion.toLowerCase()) &&
            inputValue.length > 0
    );

    // ============================================
    // TAG MANIPULATION
    // ============================================

    /**
     * Normalize tag: lowercase, trim, remove special chars
     */
    const normalizeTag = (tag: string): string => {
        return tag
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\-_.#+ ]/g, '')
            .replace(/\s+/g, '-');
    };

    /**
     * Add a new tag
     */
    const addTag = useCallback(
        (tag: string) => {
            const normalizedTag = normalizeTag(tag);

            // Validation checks
            if (!normalizedTag) return;
            if (normalizedTag.length < minTagLength) return;
            if (normalizedTag.length > maxTagLength) return;
            if (value.length >= maxTags) return;
            if (value.includes(normalizedTag)) return;

            onChange([...value, normalizedTag]);
            setInputValue('');
            setShowSuggestions(false);
            setShowPopularTags(false); // Hide popular tags after selection
        },
        [value, onChange, maxTags, minTagLength, maxTagLength]
    );

    /**
     * Remove a tag by index
     */
    const removeTag = useCallback(
        (indexToRemove: number) => {
            onChange(value.filter((_, index) => index !== indexToRemove));
        },
        [value, onChange]
    );

    /**
     * Remove the last tag (Backspace)
     */
    const removeLastTag = useCallback(() => {
        if (value.length > 0 && inputValue === '') {
            removeTag(value.length - 1);
        }
    }, [value, inputValue, removeTag]);

    // ============================================
    // EVENT HANDLERS
    // ============================================

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (inputValue.trim()) {
                    addTag(inputValue);
                }
                break;

            case 'Backspace':
                if (inputValue === '' && value.length > 0) {
                    e.preventDefault();
                    removeLastTag();
                }
                break;

            case ',':
            case 'Tab':
                if (inputValue.trim()) {
                    e.preventDefault();
                    addTag(inputValue);
                }
                break;

            case 'Escape':
                setShowSuggestions(false);
                inputRef.current?.blur();
                break;

            case 'ArrowDown':
                if (filteredSuggestions.length > 0) {
                    e.preventDefault();
                    setShowSuggestions(true);
                }
                break;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        // Check for comma to split tags
        if (newValue.includes(',')) {
            const parts = newValue.split(',');
            parts.forEach((part, index) => {
                if (index < parts.length - 1 && part.trim()) {
                    addTag(part.trim());
                }
            });
            setInputValue(parts[parts.length - 1] || '');
        } else {
            setInputValue(newValue);
            setShowSuggestions(newValue.length > 0);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        addTag(suggestion);
        inputRef.current?.focus();
    };

    const handleContainerClick = () => {
        inputRef.current?.focus();
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ============================================
    // RENDER
    // ============================================

    const isMaxReached = value.length >= maxTags;

    return (
        <div className={`tag-input-wrapper ${className}`} ref={containerRef}>
            {/* Main Input Container */}
            <div
                className={`
          tag-input-container
          ${isFocused ? 'tag-input-focused' : ''}
          ${error ? 'tag-input-error' : ''}
          ${disabled ? 'tag-input-disabled' : ''}
        `}
                onClick={handleContainerClick}
                role="group"
                aria-labelledby="tag-input-label"
            >
                {/* Tags Display */}
                <div className="tag-input-tags">
                    {value.map((tag, index) => (
                        <div
                            key={`${tag}-${index}`}
                            className="tag-badge"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px 6px 12px',
                                backgroundColor: 'var(--color-primary-500)',
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: 500,
                            }}
                        >
                            <span className="tag-text">{tag}</span>
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeTag(index);
                                    }}
                                    className="tag-remove-btn"
                                    aria-label={`Remove tag ${tag}`}
                                    tabIndex={-1}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '18px',
                                        height: '18px',
                                        padding: 0,
                                        border: 'none',
                                        borderRadius: '4px',
                                        background: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Input Field */}
                    {!isMaxReached && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                setIsFocused(true);
                                if (inputValue.length > 0) setShowSuggestions(true);
                                // Show popular tags when focused and no tags selected
                                if (value.length === 0 && inputValue === '') {
                                    setShowPopularTags(true);
                                }
                            }}
                            onBlur={() => {
                                // Small delay to allow button clicks to register before hiding
                                setTimeout(() => {
                                    setIsFocused(false);
                                    setShowPopularTags(false);
                                }, 150);
                            }}
                            placeholder={value.length === 0 ? placeholder : 'Add more...'}
                            disabled={disabled || isMaxReached}
                            className="tag-input-field"
                            aria-label={ariaLabel}
                            aria-describedby={error ? 'tag-error' : 'tag-hint'}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                        />
                    )}

                    {/* Max Tags Indicator */}
                    {isMaxReached && (
                        <span className="tag-max-reached">Max {maxTags} tags</span>
                    )}
                </div>

                {/* Tag Counter */}
                <div className="tag-counter">
                    <span className={value.length >= maxTags ? 'tag-counter-max' : ''}>
                        {value.length}/{maxTags}
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p id="tag-error" className="tag-error-message" role="alert">
                    {error}
                </p>
            )}

            {/* Hint Text */}
            <p id="tag-hint" className="tag-hint">
                Press Enter or comma to add • Backspace to remove last tag
            </p>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="tag-suggestions" role="listbox">
                    <div className="tag-suggestions-header">
                        <Plus size={14} />
                        <span>Suggestions</span>
                    </div>
                    {filteredSuggestions.slice(0, 6).map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="tag-suggestion-item"
                            role="option"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

        </div>
    );
}
