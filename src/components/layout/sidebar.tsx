'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  Users,
  Shield,
  Heart,
  CheckCircle,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Finance', href: '/finance', icon: Wallet },
  { label: 'Agents', href: '/agents', icon: Users },
  { label: 'Evidence', href: '/evidence', icon: Shield },
  { label: 'Donations', href: '/donations', icon: Heart },
  { label: 'Compliance', href: '/compliance', icon: CheckCircle },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 pt-5 pb-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-green flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            KURA<span className="text-green-light">360</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 mt-2 space-y-2">
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </form>
        <div className="px-3 text-xs text-white/30">
          Laitigo Labs
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-navy text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-navy flex flex-col transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-navy flex-col shrink-0 min-h-screen sticky top-0">
        <NavContent />
      </aside>
    </>
  );
}
