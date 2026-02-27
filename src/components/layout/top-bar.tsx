'use client';

import { usePathname } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/finance': 'Campaign Finance',
  '/agents': 'Agent Management',
  '/evidence': 'Evidence Vault',
  '/donations': 'Donations',
  '/compliance': 'Compliance',
  '/settings': 'Settings',
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];
  let path = '';
  for (const seg of segments) {
    path += '/' + seg;
    crumbs.push({
      label: pageNames[path] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: path,
    });
  }
  return crumbs;
}

export function TopBar() {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="h-14 border-b border-surface-border bg-white flex items-center justify-between px-4 md:px-6 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm ml-10 md:ml-0">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />}
            <span
              className={
                i === crumbs.length - 1
                  ? 'font-semibold text-text-primary'
                  : 'text-text-tertiary'
              }
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative p-2 rounded-lg text-text-tertiary hover:bg-surface-border-light transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red" />
        </button>
        <Avatar name="James Kariuki" size="sm" />
      </div>
    </header>
  );
}
