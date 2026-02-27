'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, id, disabled, readOnly, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center w-full rounded-[var(--radius-md)] border transition-colors',
            'bg-white min-h-[44px]',
            error
              ? 'border-red focus-within:ring-2 focus-within:ring-red/30'
              : 'border-surface-border focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/20',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-bg',
            readOnly && 'bg-surface-bg'
          )}
        >
          {prefix && (
            <span className="flex items-center pl-3 text-sm text-text-tertiary select-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              'flex-1 bg-transparent px-3 py-2 text-sm text-text-primary',
              'placeholder:text-text-tertiary',
              'outline-none border-none focus:ring-0',
              'disabled:cursor-not-allowed',
              !prefix && 'pl-3',
              !suffix && 'pr-3',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="flex items-center pr-3 text-sm text-text-tertiary select-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
