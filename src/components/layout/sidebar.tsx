'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  Users,
  Camera,
  Heart,
  CheckCircle,
  Settings,
  HelpCircle,
  ChevronLeft,
  X,
  Menu,
  LogOut,
} from 'lucide-react';
import { KuraLogoWhite } from '@/components/ui/kura-logo';
import { useLayout } from './layout-context';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/finance', icon: Wallet, label: 'Finance' },
  { href: '/agents', icon: Users, label: 'Agents' },
  { href: '/evidence', icon: Camera, label: 'Evidence' },
  { href: '/donations', icon: Heart, label: 'Donations' },
  { href: '/compliance', icon: CheckCircle, label: 'Compliance' },
  { href: '/settings', icon: Settings, label: 'Settings' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
];

// Bottom mobile nav: first 5 items
const MOBILE_NAV = NAV_ITEMS.slice(0, 5);

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useLayout();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop (always visible) + mobile drawer */}
      <motion.aside
        className={`fixed lg:relative z-50 h-full flex flex-col border-r border-[#E2E8F0] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
        style={{
          width: collapsed ? 72 : 240,
          background: 'linear-gradient(180deg, #0A1929 0%, #0F2A44 100%)',
          transition: 'width 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-white/5 flex-shrink-0">
          {!collapsed ? (
            <Link href="/dashboard">
              <KuraLogoWhite size="sm" animated={false} />
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto">
              <svg width={24} height={24} viewBox="0 0 64 64" fill="none">
                <path
                  d="M32 6C32 6 12 14 12 28C12 42 22 54 32 58C42 54 52 42 52 28C52 14 32 6 32 6Z"
                  fill="rgba(255,255,255,0.12)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1.5"
                />
                <path
                  d="M23 32L29 38L41 24"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="32" cy="4" r="2" fill="#27AE60" />
              </svg>
            </Link>
          )}
          <div className="flex items-center gap-2">
            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white/60 cursor-pointer"
              aria-label="Close navigation"
            >
              <X size={14} />
            </button>
            {/* Desktop collapse toggle */}
            <button
              onClick={() => {
                setCollapsed((prev) => !prev);
                setMobileOpen(false);
              }}
              className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors cursor-pointer"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft
                size={14}
                style={{
                  transform: collapsed ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.3s',
                }}
              />
            </button>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-hide" aria-label="Main navigation">
          <div className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group cursor-pointer ${
                    active
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#27AE60]"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  </div>
                  {!collapsed && (
                    <span
                      className="text-[13px] whitespace-nowrap"
                      style={{ fontWeight: active ? 600 : 400 }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-1">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors w-full cursor-pointer ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={16} />
              {!collapsed && (
                <span className="text-[12px]" style={{ fontWeight: 500 }}>
                  Sign Out
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Bottom user */}
        <div className="border-t border-white/5 p-3 flex-shrink-0">
          <div
            className={`flex items-center gap-3 px-2 py-2 rounded-lg ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div
              className="w-8 h-8 rounded-full bg-[#27AE60] flex items-center justify-center text-white text-[11px] flex-shrink-0"
              style={{ fontWeight: 700 }}
            >
              JK
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-white text-[12px] truncate" style={{ fontWeight: 600 }}>
                  Jane Kamau
                </div>
                <div className="text-white/30 text-[10px]">Governor, Nakuru</div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

/** Mobile bottom navigation — fixed bar at viewport bottom (lg: hidden) */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { setMobileOpen, mobileOpen } = useLayout();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0] safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {MOBILE_NAV.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#27AE60]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                strokeWidth={active ? 2.2 : 1.6}
                color={active ? '#0F2A44' : '#A0AEC0'}
              />
              <span
                className="text-[9px]"
                style={{
                  fontWeight: active ? 700 : 400,
                  color: active ? '#0F2A44' : '#A0AEC0',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        {/* "More" button to open full sidebar drawer */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 cursor-pointer"
        >
          <Menu
            size={18}
            strokeWidth={1.6}
            color={mobileOpen ? '#0F2A44' : '#A0AEC0'}
          />
          <span className="text-[9px] text-[#A0AEC0]" style={{ fontWeight: 400 }}>
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
