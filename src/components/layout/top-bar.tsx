'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Menu } from 'lucide-react';
import { useLayout } from './layout-context';

export function TopBar() {
  const { setMobileOpen, mobileSearch, setMobileSearch } = useLayout();

  return (
    <>
      <header className="h-12 sm:h-14 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-3 sm:px-4 lg:px-6 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F4F8] text-[#4A5568] cursor-pointer transition-colors"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>

          {/* Mobile: inline logo */}
          <div className="lg:hidden flex items-center gap-1.5">
            <svg width={20} height={20} viewBox="0 0 64 64" fill="none">
              <path
                d="M32 6C32 6 12 14 12 28C12 42 22 54 32 58C42 54 52 42 52 28C52 14 32 6 32 6Z"
                fill="#0F2A44"
                stroke="#4A9FE5"
                strokeWidth="1.5"
                strokeOpacity="0.3"
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
            <span
              className="font-heading"
              style={{ fontSize: 14, fontWeight: 700, color: '#0F2A44' }}
            >
              kura
              <span style={{ color: '#27AE60', fontSize: 9, position: 'relative', top: -1 }}>
                360
              </span>
            </span>
          </div>

          {/* Desktop search bar */}
          <div className="relative hidden md:block">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
            />
            <input
              type="text"
              placeholder="Search transactions, agents, evidence..."
              className="pl-9 pr-4 py-2 bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg text-[12px] text-[#4A5568] w-80 focus:outline-none focus:border-[#4A9FE5] transition-colors placeholder:text-[#A0AEC0]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearch((prev) => !prev)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F4F8] text-[#4A5568] cursor-pointer transition-colors"
            aria-label="Toggle search"
          >
            <Search size={16} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F4F8] text-[#4A5568] cursor-pointer transition-colors"
              aria-label="Notifications"
            >
              <Bell size={16} />
            </button>
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E53E3E] border-2 border-white" />
          </div>

          {/* Compliance badge */}
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#E2E8F0]">
            <div
              className="px-2.5 py-1 rounded-md text-[10px]"
              style={{ background: '#E8F5E9', color: '#1D6B3F', fontWeight: 700 }}
            >
              COMPLIANT
            </div>
            <span className="text-[11px] text-[#A0AEC0] hidden md:inline">Score: 94%</span>
          </div>
        </div>
      </header>

      {/* Mobile search bar — expandable */}
      <AnimatePresence>
        {mobileSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-[#E2E8F0] overflow-hidden"
          >
            <div className="p-3">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 bg-[#F7F9FC] border border-[#E2E8F0] rounded-lg text-[12px] text-[#4A5568] focus:outline-none focus:border-[#4A9FE5] transition-colors placeholder:text-[#A0AEC0]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
