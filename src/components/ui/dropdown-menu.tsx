'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  divider?: false;
}

export interface DropdownMenuDivider {
  divider: true;
}

export type DropdownMenuEntry = DropdownMenuItem | DropdownMenuDivider;

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: DropdownMenuEntry[];
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute z-40 mt-1 min-w-[180px] rounded-[var(--radius-md)] border border-surface-border bg-white shadow-lg',
            'animate-[fadeIn_100ms_ease-out]',
            'py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item, i) => {
            if ('divider' in item && item.divider) {
              return (
                <div
                  key={`divider-${i}`}
                  className="my-1 border-t border-surface-border-light"
                  role="separator"
                />
              );
            }
            const menuItem = item as DropdownMenuItem;
            const Icon = menuItem.icon;
            return (
              <button
                key={i}
                role="menuitem"
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                  menuItem.variant === 'danger'
                    ? 'text-red hover:bg-red-pale'
                    : 'text-text-primary hover:bg-surface-bg'
                )}
                onClick={() => {
                  menuItem.onClick();
                  setOpen(false);
                }}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {menuItem.label}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
