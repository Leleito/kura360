interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor =
    pct > 95 ? "bg-red" : pct > 80 ? "bg-orange" : "bg-green";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="font-semibold text-text-secondary">{label}</span>
        <span
          className={`font-bold ${
            pct > 95
              ? "text-red"
              : pct > 80
                ? "text-orange"
                : "text-green"
          }`}
        >
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 bg-surface-border-light rounded-full">
        <div
          className={`h-1.5 ${barColor} rounded-full transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}
