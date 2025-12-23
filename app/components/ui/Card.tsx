import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'lg',
  hover = false,
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: `
      bg-[var(--bg-primary)]
      shadow-[var(--shadow-lg)]
      border border-[var(--border-light)]
    `,
    glass: `
      bg-[var(--bg-primary)]/80
      backdrop-blur-xl
      shadow-[var(--shadow-xl)]
      border border-[var(--border-light)]
    `,
    bordered: `
      bg-[var(--bg-primary)]
      border-2 border-[var(--border-medium)]
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const hoverStyles = hover
    ? 'hover:shadow-[var(--shadow-2xl)] hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
