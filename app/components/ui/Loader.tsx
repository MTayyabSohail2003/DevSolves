'use client';

import React from 'react';

interface LoaderProps {
    /** Show the loader */
    show?: boolean;
    /** Custom message to display */
    message?: string;
    /** Whether to cover the full screen */
    fullScreen?: boolean;
    /** Size of the loader: 'sm', 'md', 'lg' */
    size?: 'sm' | 'md' | 'lg';
    /** Variant: 'default', 'minimal', 'dots' */
    variant?: 'default' | 'minimal' | 'dots';
}

export default function Loader({
    show = true,
    message = 'Loading...',
    fullScreen = true,
    size = 'lg',
    variant = 'default',
}: LoaderProps) {
    if (!show) return null;

    const sizeClasses = {
        sm: { spinner: 'w-8 h-8', text: 'text-sm', dots: 'w-2 h-2' },
        md: { spinner: 'w-12 h-12', text: 'text-base', dots: 'w-3 h-3' },
        lg: { spinner: 'w-16 h-16', text: 'text-lg', dots: 'w-4 h-4' },
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/95 backdrop-blur-sm'
        : 'flex items-center justify-center p-8';

    // Dots variant
    if (variant === 'dots') {
        return (
            <div className={containerClasses}>
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className={`${sizeClasses[size].dots} rounded-full bg-[var(--color-primary-500)] animate-bounce`}
                            style={{ animationDelay: '0ms' }}
                        />
                        <div
                            className={`${sizeClasses[size].dots} rounded-full bg-[var(--color-primary-400)] animate-bounce`}
                            style={{ animationDelay: '150ms' }}
                        />
                        <div
                            className={`${sizeClasses[size].dots} rounded-full bg-[var(--color-primary-300)] animate-bounce`}
                            style={{ animationDelay: '300ms' }}
                        />
                    </div>
                    {message && (
                        <p className={`${sizeClasses[size].text} text-[var(--text-secondary)] font-medium`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Minimal variant
    if (variant === 'minimal') {
        return (
            <div className={containerClasses}>
                <div className="flex flex-col items-center gap-4">
                    <div
                        className={`${sizeClasses[size].spinner} rounded-full border-4 border-[var(--border-light)] border-t-[var(--color-primary-500)] animate-spin`}
                    />
                    {message && (
                        <p className={`${sizeClasses[size].text} text-[var(--text-secondary)] font-medium`}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Default variant - Premium animated loader
    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-6">
                {/* Animated Logo/Spinner */}
                <div className="relative">
                    {/* Outer glow ring */}
                    <div
                        className={`${sizeClasses[size].spinner} rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] animate-spin`}
                        style={{ animationDuration: '3s' }}
                    >
                        <div className="absolute inset-1 rounded-full bg-[var(--bg-primary)]" />
                    </div>

                    {/* Inner pulse */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-3/5 h-3/5 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] animate-pulse"
                            style={{ animationDuration: '1.5s' }}
                        />
                    </div>

                    {/* Orbiting dots */}
                    <div
                        className="absolute inset-0 animate-spin"
                        style={{ animationDuration: '2s' }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-primary-500)] shadow-lg shadow-[var(--color-primary-500)]/50" />
                    </div>
                    <div
                        className="absolute inset-0 animate-spin"
                        style={{ animationDuration: '2s', animationDirection: 'reverse', animationDelay: '-0.5s' }}
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-accent-500)] shadow-lg shadow-[var(--color-accent-500)]/50" />
                    </div>
                </div>

                {/* Text with gradient */}
                {message && (
                    <div className="flex flex-col items-center gap-2">
                        <p
                            className={`${sizeClasses[size].text} font-semibold bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] bg-clip-text text-transparent`}
                        >
                            {message}
                        </p>
                        {/* Animated progress line */}
                        <div className="w-32 h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
                            <div
                                className="h-full w-1/3 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)] rounded-full animate-loader-progress"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Export reusable loader content (without container) for custom positioning
export function LoaderSpinner({
    size = 'md',
    className = '',
}: {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-6 h-6 border-2',
        lg: 'w-8 h-8 border-3',
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full border-[var(--border-light)] border-t-[var(--color-primary-500)] animate-spin ${className}`}
        />
    );
}
