'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-green text-white hover:bg-green-light active:bg-green focus-visible:ring-green/40',
  secondary:
    'border-2 border-navy text-navy bg-transparent hover:bg-navy/5 active:bg-navy/10 focus-visible:ring-navy/40',
  danger:
    'bg-red text-white hover:bg-red/90 active:bg-red/80 focus-visible:ring-red/40',
  ghost:
    'bg-transparent text-text-secondary hover:bg-surface-border-light active:bg-surface-border focus-visible:ring-blue/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-[var(--radius-sm)]',
  md: 'text-sm px-4 py-2 rounded-[var(--radius-md)]',
  lg: 'text-base px-6 py-3 rounded-[var(--radius-lg)]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      asChild = false,
      className,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classes = cn(
      'inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150',
      'min-h-[44px] min-w-[44px]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none cursor-pointer',
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (asChild) {
      // When asChild is true, render a span wrapper so the parent can be a <Link> or <a>
      return (
        <span className={classes} aria-disabled={isDisabled || undefined}>
          {loading && <LoadingSpinner size="sm" className="text-current" />}
          {children}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={classes}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
