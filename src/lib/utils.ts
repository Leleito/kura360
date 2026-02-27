import { clsx, type ClassValue } from "clsx";

/** Merge Tailwind classes safely (clsx) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format amount in KES */
export function formatKES(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format Kenya phone number */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/** Format date for display */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

/** Format date only (no time) */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
  }).format(new Date(date));
}

/** Calculate percentage with safety */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/** Truncate string with ellipsis */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/** Generate initials from name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
