'use client';

/**
 * TiptapEditor - A production-ready rich text editor component
 * 
 * Features:
 * - StarterKit (Bold, Italic, Strike, Headings, Lists, Blockquote, Code Block)
 * - Underline, Link, Image, Placeholder extensions
 * - Character and Word count
 * - Keyboard shortcuts
 * - Accessibility support
 * - Dark mode compatible
 * - Mobile responsive
 * 
 * @author DevSolve Team
 * @version 1.0.0
 */

import React, { useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';

import EditorToolbar from './EditorToolbar';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TiptapEditorProps {
    /** Initial content - can be HTML string or empty */
    value?: string;
    /** Callback fired when content changes - returns HTML string */
    onChange?: (html: string) => void;
    /** Placeholder text shown when editor is empty */
    placeholder?: string;
    /** Whether the editor is read-only */
    readOnly?: boolean;
    /** Maximum character limit (optional) */
    maxLength?: number;
    /** Additional CSS classes for the editor container */
    className?: string;
    /** Aria label for accessibility */
    ariaLabel?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

const TiptapEditor: React.FC<TiptapEditorProps> = ({
    value = '',
    onChange,
    placeholder = 'Start writing...',
    readOnly = false,
    maxLength,
    className = '',
    ariaLabel = 'Rich text editor',
}) => {
    // ============================================
    // EDITOR CONFIGURATION
    // ============================================

    const editor = useEditor({
        extensions: [
            // StarterKit includes: Bold, Italic, Strike, Code, Heading, 
            // BulletList, OrderedList, Blockquote, CodeBlock, HardBreak, 
            // HorizontalRule, History (Undo/Redo)
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3], // Only allow H1, H2, H3
                },
                codeBlock: {
                    HTMLAttributes: {
                        class: 'tiptap-code-block',
                    },
                },
                blockquote: {
                    HTMLAttributes: {
                        class: 'tiptap-blockquote',
                    },
                },
            }),

            // Underline extension (not included in StarterKit)
            Underline,

            // Link extension with URL validation
            Link.configure({
                openOnClick: false, // Don't open links when clicking in editor
                autolink: true, // Auto-detect and convert URLs
                linkOnPaste: true, // Convert pasted URLs to links
                HTMLAttributes: {
                    class: 'tiptap-link',
                    rel: 'noopener noreferrer nofollow',
                    target: '_blank',
                },
                validate: (url) => {
                    // Basic URL validation
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                },
            }),

            // Image extension for URL-based images
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'tiptap-image',
                },
            }),

            // Placeholder text when editor is empty
            Placeholder.configure({
                placeholder,
                emptyEditorClass: 'tiptap-empty',
            }),

            // Character count extension
            CharacterCount.configure({
                limit: maxLength,
            }),
        ],

        content: value,
        editable: !readOnly,
        immediatelyRender: false, // Prevent SSR hydration mismatch

        // Keyboard shortcuts are handled by extensions automatically:
        // - Ctrl/Cmd + B: Bold
        // - Ctrl/Cmd + I: Italic
        // - Ctrl/Cmd + U: Underline
        // - Ctrl/Cmd + Shift + S: Strike
        // - Ctrl/Cmd + E: Code
        // - Ctrl/Cmd + Shift + B: Blockquote
        // - Ctrl/Cmd + Z: Undo
        // - Ctrl/Cmd + Shift + Z / Ctrl + Y: Redo

        // Callback when content changes
        onUpdate: ({ editor }) => {
            if (onChange) {
                onChange(editor.getHTML());
            }
        },
    });

    // ============================================
    // SYNC EXTERNAL VALUE CHANGES
    // ============================================

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            // Only update if the value is different (prevents cursor jump)
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    // ============================================
    // CLEANUP
    // ============================================

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    // ============================================
    // CHARACTER & WORD COUNT
    // ============================================

    const characterCount = editor?.storage.characterCount.characters() ?? 0;
    const wordCount = editor?.storage.characterCount.words() ?? 0;

    // ============================================
    // RENDER
    // ============================================

    if (!editor) {
        // Loading state - prevent hydration mismatch
        return (
            <div className={`tiptap-editor-container ${className}`}>
                <div className="tiptap-editor-loading" aria-busy="true">
                    Loading editor...
                </div>
            </div>
        );
    }

    return (
        <div
            className={`tiptap-editor-container ${className} ${readOnly ? 'tiptap-readonly' : ''}`}
            role="application"
            aria-label={ariaLabel}
        >
            {/* Toolbar - only show if not read-only */}
            {!readOnly && <EditorToolbar editor={editor} />}

            {/* Editor Content Area */}
            <div className="tiptap-editor-wrapper">
                <EditorContent
                    editor={editor}
                    className="tiptap-content"
                    aria-multiline="true"
                    aria-placeholder={placeholder}
                />
            </div>

            {/* Footer with character/word count */}
            {!readOnly && (
                <div className="tiptap-footer" aria-live="polite">
                    <span className="tiptap-count">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </span>
                    <span className="tiptap-separator">•</span>
                    <span className="tiptap-count">
                        {characterCount} {characterCount === 1 ? 'character' : 'characters'}
                        {maxLength && (
                            <span className="tiptap-limit"> / {maxLength}</span>
                        )}
                    </span>
                </div>
            )}
        </div>
    );
};

export default TiptapEditor;
