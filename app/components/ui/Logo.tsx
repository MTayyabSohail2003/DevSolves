import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl' },
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group ${className}`}
    >
      {/* Logo Icon */}
      <div
        className={`
          ${sizes[size].icon}
          relative flex items-center justify-center
          bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-600)]
          rounded-xl
          shadow-[var(--shadow-md)]
          group-hover:shadow-[var(--shadow-glow)]
          transition-all duration-300
          group-hover:scale-105
        `}
      >
        {/* Code Bracket Icon */}
        <svg
          className="w-1/2 h-1/2 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
        
        {/* Animated Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
      </div>

      {/* Logo Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`
              ${sizes[size].text}
              font-bold tracking-tight
              bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-600)]
              bg-clip-text text-transparent
              group-hover:from-[var(--color-primary-500)] group-hover:to-[var(--color-accent-500)]
              transition-all duration-300
            `}
          >
            DevSolve
          </span>
          <span className="text-xs text-[var(--text-tertiary)] font-medium tracking-wider uppercase">
            Code. Learn. Solve.
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
