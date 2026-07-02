"use client";

import { EqBars } from "@/components/ui/eq-bars";

/**
 * Global error boundary for page routes: a server component throwing (most
 * likely an unreachable database) renders this branded screen instead of the
 * browser's bare 500 page. Route handlers (/continue) catch their own errors
 * and redirect to /unavailable.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(230,180,80,0.16), transparent 65%)" }}
      />

      <div className="relative w-full max-w-md text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-elevated">
          <EqBars bars={4} playing={false} className="h-6" />
        </span>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent">
          One moment
        </p>
        <h1 className="mt-3 font-display text-3xl tracking-tight">
          Something skipped
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-muted">
          We hit a problem loading this screen — usually a brief connection
          issue on our side. Nothing about your access has changed.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex h-12 items-center rounded-lg bg-accent px-7 text-base font-medium text-on-accent shadow-glow transition-all hover:bg-accent-hi"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
