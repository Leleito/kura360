'use client';

import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, maxLength, showCount = false, className, id, disabled, readOnly, value, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const internalRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize
    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }, [value]);

    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          id={textareaId}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full rounded-[var(--radius-md)] border px-3 py-2 text-sm',
            'bg-white min-h-[88px] resize-y transition-colors',
            'placeholder:text-text-tertiary outline-none',
            error
              ? 'border-red focus:ring-2 focus:ring-red/30'
              : 'border-surface-border focus:border-blue focus:ring-2 focus:ring-blue/20',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-bg',
            readOnly && 'bg-surface-bg',
            className
          )}
          {...props}
        />
        <div className="flex justify-between mt-1">
          {error ? (
            <p className="text-xs text-red" role="alert">
              {error}
            </p>
          ) : (
            <span />
          )}
          {showCount && maxLength && (
            <span
              className={cn(
                'text-xs',
                charCount >= maxLength ? 'text-red' : 'text-text-tertiary'
              )}
            >
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
