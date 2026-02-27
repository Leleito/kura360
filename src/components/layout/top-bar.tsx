"use client";

export function TopBar() {
  return (
    <header className="h-14 bg-white border-b border-surface-border flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger - shown only on small screens */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-surface-bg"
          aria-label="Toggle navigation"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-sm font-bold text-navy">
          Hon. Jane Kamau &mdash; Governor, Nakuru
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-full hover:bg-surface-bg"
          aria-label="Notifications"
        >
          <span className="text-lg">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-green flex items-center justify-center text-white text-xs font-bold">
          JK
        </div>
      </div>
    </header>
  );
}
