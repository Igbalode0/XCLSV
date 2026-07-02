"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Dark/light toggle. Dark is the brand default; light is an opt-in, themed
 * variant. The choice is written to <html class="light"> (read pre-paint by the
 * inline script in the root layout to avoid a flash) and persisted to
 * localStorage. Self-contained — no global provider needed.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("xclsv-theme", next);
    } catch {
      /* private mode / blocked storage — fall back to in-memory only */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition-colors hover:bg-overlay hover:text-foreground",
        className,
      )}
    >
      {/* Render the icon only after mount so SSR (dark) doesn't mismatch. */}
      {mounted && theme === "dark" ? <SunIcon /> : null}
      {mounted && theme === "light" ? <MoonIcon /> : null}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
