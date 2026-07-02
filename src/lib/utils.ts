import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without specificity conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Milliseconds → "m:ss", the format used for timestamped feedback. */
export function formatTimestamp(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Compact play/listener counts: 942 · 12.4K · 1.2M. */
export function formatCount(n: number) {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}

/** 0–1 ratio → whole-number percent. */
export function formatPercent(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}
