'use client';

/**
 * EditorToolbar - Custom toolbar component for TipTap editor
 * 
 * Features:
 * - Bold, Italic, Underline, Strike buttons
 * - Headings dropdown (H1-H3)
 * - Bullet/Ordered list buttons
 * - Code block & Blockquote buttons
 * - Link add/remove with URL validation
 * - Image insert via URL modal
 * - Undo/Redo buttons
 * - Active state indicators
 * - Disabled states
 * - Mobile responsive
 * - Full accessibility support
 * 
 * @author DevSolve Team
 * @version 1.0.0
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    Link,
    Unlink,
    Image,
    Undo,
    Redo,
    ChevronDown,
    X,
    Check,
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface EditorToolbarProps {
    editor: Editor;
}

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    ariaLabel: string;
    title: string;
    children: React.ReactNode;
}

// ============================================
// TOOLBAR BUTTON COMPONENT
// ============================================

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
    onClick,
    isActive = false,
    isDisabled = false,
    ariaLabel,
    title,
    children,
}) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isDisabled}
            className={`
        toolbar-btn
        ${isActive ? 'toolbar-btn-active' : ''}
        ${isDisabled ? 'toolbar-btn-disabled' : ''}
      `}
            aria-label={ariaLabel}
            aria-pressed={isActive}
            title={title}
        >
            {children}
        </button>
    );
};

// ============================================
// TOOLBAR DIVIDER
// ============================================

const ToolbarDivider: React.FC = () => (
    <div className="toolbar-divider" role="separator" aria-orientation="vertical" />
);

// ============================================
// HEADINGS DROPDOWN
// ============================================

interface HeadingsDropdownProps {
    editor: Editor;
}

const HeadingsDropdown: React.FC<HeadingsDropdownProps> = ({ editor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Get current heading level for display
    const getCurrentLabel = (): string => {
        if (editor.isActive('heading', { level: 1 })) return 'H1';
        if (editor.isActive('heading', { level: 2 })) return 'H2';
        if (editor.isActive('heading', { level: 3 })) return 'H3';
        return 'Normal';
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle heading selection
    const handleSelect = (level: 1 | 2 | 3 | null) => {
        if (level === null) {
            editor.chain().focus().setParagraph().run();
        } else {
            editor.chain().focus().toggleHeading({ level }).run();
        }
        setIsOpen(false);
    };

    return (
        <div className="toolbar-dropdown" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`toolbar-dropdown-btn ${isOpen ? 'toolbar-dropdown-open' : ''}`}
                aria-label="Select heading level"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span>{getCurrentLabel()}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="toolbar-dropdown-menu" role="menu">
                    <button
                        type="button"
                        onClick={() => handleSelect(null)}
                        className={`toolbar-dropdown-item ${!editor.isActive('heading') ? 'toolbar-dropdown-active' : ''}`}
                        role="menuitem"
                    >
                        Normal Text
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelect(1)}
                        className={`toolbar-dropdown-item ${editor.isActive('heading', { level: 1 }) ? 'toolbar-dropdown-active' : ''}`}
                        role="menuitem"
                    >
                        <Heading1 size={18} />
                        <span>Heading 1</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelect(2)}
                        className={`toolbar-dropdown-item ${editor.isActive('heading', { level: 2 }) ? 'toolbar-dropdown-active' : ''}`}
                        role="menuitem"
                    >
                        <Heading2 size={18} />
                        <span>Heading 2</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSelect(3)}
                        className={`toolbar-dropdown-item ${editor.isActive('heading', { level: 3 }) ? 'toolbar-dropdown-active' : ''}`}
                        role="menuitem"
                    >
                        <Heading3 size={18} />
                        <span>Heading 3</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================
// LINK MODAL
// ============================================

interface LinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (url: string) => void;
    initialUrl?: string;
}

const LinkModal: React.FC<LinkModalProps> = ({ isOpen, onClose, onSubmit, initialUrl = '' }) => {
    const [url, setUrl] = useState(initialUrl);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setUrl(initialUrl);
            setError('');
            inputRef.current.focus();
        }
    }, [isOpen, initialUrl]);

    // Validate URL
    const validateUrl = (value: string): boolean => {
        if (!value.trim()) {
            setError('URL is required');
            return false;
        }

        // Add https:// if no protocol specified
        let urlToCheck = value;
        if (!value.match(/^https?:\/\//)) {
            urlToCheck = `https://${value}`;
        }

        try {
            new URL(urlToCheck);
            setError('');
            return true;
        } catch {
            setError('Please enter a valid URL');
            return false;
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateUrl(url)) return;

        // Add https:// if no protocol specified
        let finalUrl = url;
        if (!url.match(/^https?:\/\//)) {
            finalUrl = `https://${url}`;
        }

        onSubmit(finalUrl);
        setUrl('');
        onClose();
    };

    // Handle escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-modal-title"
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="modal-header">
                    <h3 id="link-modal-title">Insert Link</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <label htmlFor="link-url" className="modal-label">
                            URL
                        </label>
                        <input
                            ref={inputRef}
                            id="link-url"
                            type="text"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                if (error) validateUrl(e.target.value);
                            }}
                            placeholder="https://example.com"
                            className={`modal-input ${error ? 'modal-input-error' : ''}`}
                            aria-invalid={!!error}
                            aria-describedby={error ? 'link-error' : undefined}
                        />
                        {error && (
                            <p id="link-error" className="modal-error">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="modal-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-primary">
                            <Check size={16} />
                            <span>Insert Link</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// IMAGE MODAL
// ============================================

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (url: string, alt?: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [url, setUrl] = useState('');
    const [alt, setAlt] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setUrl('');
            setAlt('');
            setError('');
            setPreview(null);
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Validate image URL
    const validateUrl = (value: string): boolean => {
        if (!value.trim()) {
            setError('Image URL is required');
            setPreview(null);
            return false;
        }

        // Check for image extension
        const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i;
        const hasImageExtension = imageExtensions.test(value);

        try {
            new URL(value);
            setError('');

            // Only set preview for URLs that look like images
            if (hasImageExtension) {
                setPreview(value);
            } else {
                // Try loading anyway, clear preview on fail
                setPreview(value);
            }
            return true;
        } catch {
            setError('Please enter a valid URL');
            setPreview(null);
            return false;
        }
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateUrl(url)) return;

        onSubmit(url, alt || undefined);
        setUrl('');
        setAlt('');
        onClose();
    };

    // Handle escape key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-modal-title"
        >
            <div
                className="modal-content modal-content-lg"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="modal-header">
                    <h3 id="image-modal-title">Insert Image</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                        aria-label="Close modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {/* URL Input */}
                        <div className="modal-field">
                            <label htmlFor="image-url" className="modal-label">
                                Image URL <span className="modal-required">*</span>
                            </label>
                            <input
                                ref={inputRef}
                                id="image-url"
                                type="text"
                                value={url}
                                onChange={(e) => {
                                    setUrl(e.target.value);
                                    validateUrl(e.target.value);
                                }}
                                placeholder="https://example.com/image.jpg"
                                className={`modal-input ${error ? 'modal-input-error' : ''}`}
                                aria-invalid={!!error}
                                aria-describedby={error ? 'image-error' : undefined}
                            />
                            {error && (
                                <p id="image-error" className="modal-error">
                                    {error}
                                </p>
                            )}
                        </div>

                        {/* Alt Text Input */}
                        <div className="modal-field">
                            <label htmlFor="image-alt" className="modal-label">
                                Alt Text <span className="modal-optional">(optional)</span>
                            </label>
                            <input
                                id="image-alt"
                                type="text"
                                value={alt}
                                onChange={(e) => setAlt(e.target.value)}
                                placeholder="Describe the image"
                                className="modal-input"
                            />
                        </div>

                        {/* Image Preview */}
                        {preview && (
                            <div className="modal-preview">
                                <p className="modal-preview-label">Preview:</p>
                                <div className="modal-preview-container">
                                    <img
                                        src={preview}
                                        alt={alt || 'Preview'}
                                        onError={() => setPreview(null)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="modal-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-primary">
                            <Image size={16} />
                            <span>Insert Image</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// MAIN TOOLBAR COMPONENT
// ============================================

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    const [linkModalOpen, setLinkModalOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    // ============================================
    // LINK HANDLERS
    // ============================================

    // Open link modal with current URL if editing existing link
    const handleLinkClick = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        setLinkModalOpen(true);
    }, [editor]);

    // Apply link to selected text
    const handleLinkSubmit = useCallback((url: string) => {
        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    }, [editor]);

    // Remove link from selected text
    const handleUnlink = useCallback(() => {
        editor.chain().focus().unsetLink().run();
    }, [editor]);

    // ============================================
    // IMAGE HANDLERS
    // ============================================

    const handleImageSubmit = useCallback((url: string, alt?: string) => {
        editor
            .chain()
            .focus()
            .setImage({ src: url, alt: alt || '' })
            .run();
    }, [editor]);

    // ============================================
    // RENDER
    // ============================================

    return (
        <div
            className="tiptap-toolbar"
            role="toolbar"
            aria-label="Text formatting options"
        >
            {/* Text Formatting Group */}
            <div className="toolbar-group" role="group" aria-label="Text formatting">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    isDisabled={!editor.can().chain().focus().toggleBold().run()}
                    ariaLabel="Bold (Ctrl+B)"
                    title="Bold (Ctrl+B)"
                >
                    <Bold size={18} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    isDisabled={!editor.can().chain().focus().toggleItalic().run()}
                    ariaLabel="Italic (Ctrl+I)"
                    title="Italic (Ctrl+I)"
                >
                    <Italic size={18} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    isDisabled={!editor.can().chain().focus().toggleUnderline().run()}
                    ariaLabel="Underline (Ctrl+U)"
                    title="Underline (Ctrl+U)"
                >
                    <Underline size={18} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    isDisabled={!editor.can().chain().focus().toggleStrike().run()}
                    ariaLabel="Strikethrough"
                    title="Strikethrough"
                >
                    <Strikethrough size={18} />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Headings Group */}
            <div className="toolbar-group" role="group" aria-label="Headings">
                <HeadingsDropdown editor={editor} />
            </div>

            <ToolbarDivider />

            {/* Lists Group */}
            <div className="toolbar-group" role="group" aria-label="Lists">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    isDisabled={!editor.can().chain().focus().toggleBulletList().run()}
                    ariaLabel="Bullet list"
                    title="Bullet list"
                >
                    <List size={18} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    isDisabled={!editor.can().chain().focus().toggleOrderedList().run()}
                    ariaLabel="Numbered list"
                    title="Numbered list"
                >
                    <ListOrdered size={18} />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Block Formatting Group */}
            <div className="toolbar-group" role="group" aria-label="Block formatting">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    isDisabled={!editor.can().chain().focus().toggleCodeBlock().run()}
                    ariaLabel="Code block"
                    title="Code block"
                >
                    <Code size={18} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    isDisabled={!editor.can().chain().focus().toggleBlockquote().run()}
                    ariaLabel="Blockquote"
                    title="Blockquote"
                >
                    <Quote size={18} />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* Links & Media Group */}
            <div className="toolbar-group" role="group" aria-label="Links and media">
                <ToolbarButton
                    onClick={handleLinkClick}
                    isActive={editor.isActive('link')}
                    ariaLabel="Insert link"
                    title="Insert link"
                >
                    <Link size={18} />
                </ToolbarButton>

                {editor.isActive('link') && (
                    <ToolbarButton
                        onClick={handleUnlink}
                        ariaLabel="Remove link"
                        title="Remove link"
                    >
                        <Unlink size={18} />
                    </ToolbarButton>
                )}

                <ToolbarButton
                    onClick={() => setImageModalOpen(true)}
                    ariaLabel="Insert image"
                    title="Insert image"
                >
                    <Image size={18} />
                </ToolbarButton>
            </div>

            <ToolbarDivider />

            {/* History Group */}
            <div className="toolbar-group" role="group" aria-label="History">
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    isDisabled={!editor.can().chain().focus().undo().run()}
                    ariaLabel="Undo (Ctrl+Z)"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo size={18} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    isDisabled={!editor.can().chain().focus().redo().run()}
                    ariaLabel="Redo (Ctrl+Shift+Z)"
                    title="Redo (Ctrl+Shift+Z)"
                >
                    <Redo size={18} />
                </ToolbarButton>
            </div>

            {/* Link Modal */}
            <LinkModal
                isOpen={linkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                onSubmit={handleLinkSubmit}
                initialUrl={editor.getAttributes('link').href || ''}
            />

            {/* Image Modal */}
            <ImageModal
                isOpen={imageModalOpen}
                onClose={() => setImageModalOpen(false)}
                onSubmit={handleImageSubmit}
            />
        </div>
    );
};

export default EditorToolbar;
