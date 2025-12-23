'use client';

import React, { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-[0.98]
    `;

    const variants: Record<ButtonVariant, string> = {
      primary: `
        bg-[var(--color-primary-600)] text-white
        hover:bg-[var(--color-primary-700)]
        focus-visible:ring-[var(--color-primary-500)]
        shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-[var(--color-secondary-100)] text-[var(--text-primary)]
        hover:bg-[var(--color-secondary-200)]
        focus-visible:ring-[var(--color-secondary-400)]
        dark:bg-[var(--color-secondary-800)] dark:text-[var(--text-inverse)]
        dark:hover:bg-[var(--color-secondary-700)]
      `,
      outline: `
        border-2 border-[var(--border-medium)] text-[var(--text-primary)]
        hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-600)]
        focus-visible:ring-[var(--color-primary-500)]
        bg-transparent
      `,
      ghost: `
        text-[var(--text-secondary)]
        hover:bg-[var(--color-secondary-100)] hover:text-[var(--text-primary)]
        focus-visible:ring-[var(--color-secondary-400)]
        bg-transparent
        dark:hover:bg-[var(--color-secondary-800)]
      `,
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-13 px-8 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
