'use client';

import { useState, useCallback, type ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { IS_DEMO } from '@/lib/demo';

export interface DemoTooltipProps {
  children: ReactNode;
  /** Override tooltip text (default: "Sign up to use this feature") */
  message?: string;
  className?: string;
}

/**
 * Wraps action buttons to intercept clicks in demo mode and show a tooltip.
 * In non-demo mode the children render normally with no overhead.
 */
export function DemoTooltip({
  children,
  message = 'Sign up to use this feature',
  className,
}: DemoTooltipProps) {
  const [visible, setVisible] = useState(false);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!IS_DEMO) return;
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  if (!IS_DEMO) return <>{children}</>;

  return (
    <span
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClickCapture={handleClick}
    >
      {children}

      {visible && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-[var(--radius-sm)] bg-navy px-3 py-1.5 text-xs font-medium text-white shadow-lg pointer-events-none"
        >
          {message}
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
        </span>
      )}
    </span>
  );
}
