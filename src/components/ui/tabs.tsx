'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tab {
  key: string;
  label: string;
  icon?: LucideIcon;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div
      className={cn(
        'flex border-b border-surface-border overflow-x-auto',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.key)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              'min-h-[44px] min-w-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 focus-visible:ring-inset',
              isActive
                ? 'text-green'
                : 'text-text-tertiary hover:text-text-secondary'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {/* Active indicator */}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
