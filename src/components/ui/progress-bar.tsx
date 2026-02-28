"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  animate?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  animate = false,
  showTooltip = true,
  className,
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor =
    pct > 95 ? "bg-red" : pct > 80 ? "bg-orange" : "bg-green";
  const textColor =
    pct > 95 ? "text-red" : pct > 80 ? "text-orange" : "text-green";

  const [mounted, setMounted] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger animated width on mount
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const shouldPulse = animate && pct > 80;

  return (
    <div className={cn("mb-3 group", className)}>
      <div className="flex justify-between text-[10px] mb-1">
        <span className="font-semibold text-text-secondary">{label}</span>
        <span className={`font-bold ${textColor}`}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="relative h-2 bg-surface-border-light rounded-full"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <div
          ref={barRef}
          className={cn(
            "h-2 rounded-full transition-all duration-700 ease-out",
            barColor,
            shouldPulse && "animate-pulse"
          )}
          style={{ width: mounted ? `${pct}%` : "0%" }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />

        {/* Tooltip */}
        {showTooltip && tooltipVisible && (
          <div
            className="absolute -top-8 px-2 py-1 bg-navy text-white text-[9px] font-semibold rounded shadow-lg pointer-events-none whitespace-nowrap transition-opacity duration-150 z-10"
            style={{ left: `${Math.min(pct, 92)}%`, transform: "translateX(-50%)" }}
          >
            {value.toLocaleString()}M / {max.toLocaleString()}M
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-navy" />
          </div>
        )}
      </div>
    </div>
  );
}
