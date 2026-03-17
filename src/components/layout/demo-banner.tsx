'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { IS_DEMO } from '@/lib/demo';

const STORAGE_KEY = 'kura360-demo-banner-dismissed';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Show banner only if not previously dismissed this session
    setDismissed(sessionStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  if (!IS_DEMO || dismissed) return null;

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  }

  return (
    <div
      className="fixed top-0 inset-x-0 z-60 flex items-center justify-center gap-3 px-4 py-2 text-white text-sm"
      style={{ background: 'linear-gradient(90deg, var(--color-green) 0%, var(--color-blue) 100%)' }}
      role="banner"
    >
      <span className="font-semibold tracking-tight">
        You&apos;re viewing a demo of KURA360
      </span>

      <button
        type="button"
        className="ml-1 inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-white/25 transition-colors cursor-pointer"
      >
        Start Guided Tour
      </button>

      <a
        href="https://app.kura360.co"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-xs font-semibold text-white underline underline-offset-2 hover:text-white/80 transition-colors"
      >
        Sign Up &rarr;
      </a>

      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-white/70 hover:text-white transition-colors cursor-pointer"
        aria-label="Dismiss demo banner"
      >
        <X size={16} />
      </button>
    </div>
  );
}
