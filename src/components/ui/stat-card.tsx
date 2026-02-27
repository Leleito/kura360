type Variant = "green" | "blue" | "navy" | "purple" | "orange" | "red";

const variantColors: Record<Variant, string> = {
  green: "text-green",
  blue: "text-blue",
  navy: "text-navy",
  purple: "text-purple",
  orange: "text-orange",
  red: "text-red",
};

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  variant?: Variant;
}

export function StatCard({ label, value, sub, variant = "navy" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-surface-border">
      <p className="text-[10px] font-semibold text-text-tertiary uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-xl font-extrabold mt-1 ${variantColors[variant]}`}>
        {value}
      </p>
      {sub && (
        <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>
      )}
    </div>
  );
}
