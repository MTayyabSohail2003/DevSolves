'use client';

import { useEffect } from 'react';
import Prism from 'prismjs';

// Import languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-markup';

interface CodeHighlighterProps {
    html: string;
    className?: string;
}

/**
 * Component that renders HTML content with Prism.js syntax highlighting
 */
export default function CodeHighlighter({ html, className = '' }: CodeHighlighterProps) {
    useEffect(() => {
        // Highlight all code blocks after render
        Prism.highlightAll();
    }, [html]);

    return (
        <div
            className={`code-highlighter ${className}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
