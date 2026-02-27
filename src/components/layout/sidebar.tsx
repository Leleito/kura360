"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "\u{1F4CA}" },
  { href: "/finance", label: "Finance", icon: "\u{1F4B0}" },
  { href: "/agents", label: "Agents", icon: "\u{1F465}" },
  { href: "/evidence", label: "Evidence", icon: "\u{1F4F8}" },
  { href: "/donations", label: "Donations", icon: "\u{1F91D}" },
  { href: "/compliance", label: "Compliance", icon: "\u2705" },
  { href: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-navy text-white shrink-0">
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-baseline gap-0.5">
          <span className="text-xl font-black tracking-tight">KURA</span>
          <span className="text-xl font-black tracking-tight text-green-light">
            360
          </span>
        </Link>
      </div>
      <nav className="flex-1 py-2" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-r-2 border-green-light"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 text-xs text-white/40">
        Sysmera Limited
      </div>
    </aside>
  );
}
