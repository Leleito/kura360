type BadgeVariant = "success" | "warning" | "danger" | "neutral";

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-pale text-green",
  warning: "bg-orange-pale text-orange",
  danger: "bg-red-pale text-red",
  neutral: "bg-surface-border-light text-text-secondary",
};

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
}

export function Badge({ text, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${variantStyles[variant]}`}
    >
      {text}
    </span>
  );
}
