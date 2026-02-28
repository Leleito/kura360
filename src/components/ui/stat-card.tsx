import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "green" | "blue" | "navy" | "purple" | "orange" | "red";

const variantColors: Record<Variant, string> = {
  green: "text-green",
  blue: "text-blue",
  navy: "text-navy",
  purple: "text-purple",
  orange: "text-orange",
  red: "text-red",
};

const variantBorders: Record<Variant, string> = {
  green: "border-l-green",
  blue: "border-l-blue",
  navy: "border-l-navy",
  purple: "border-l-purple",
  orange: "border-l-orange",
  red: "border-l-red",
};

const variantIconBg: Record<Variant, string> = {
  green: "bg-green-pale text-green",
  blue: "bg-blue-light/10 text-blue",
  navy: "bg-navy/5 text-navy",
  purple: "bg-purple/10 text-purple",
  orange: "bg-orange-pale text-orange",
  red: "bg-red-pale text-red",
};

interface StatCardProps {
  label: string;
  value: string | ReactNode;
  sub?: string;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  variant = "navy",
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-3.5 border border-surface-border",
        "border-l-[3px] transition-shadow duration-200",
        "hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        variantBorders[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
            {label}
          </p>
          <div className={`text-xl font-extrabold mt-1 ${variantColors[variant]}`}>
            {value}
          </div>
          {sub && (
            <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex-shrink-0 ml-2 w-8 h-8 rounded-lg flex items-center justify-center",
              variantIconBg[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
