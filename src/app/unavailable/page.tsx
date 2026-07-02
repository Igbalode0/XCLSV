import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EqBars } from "@/components/ui/eq-bars";

/**
 * Shown when the app itself is fine but its backing services (the database)
 * are unreachable — e.g. the post-auth gate couldn't resolve the account.
 * Deliberately touches NOTHING server-side so it can always render.
 */
export default function UnavailablePage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(230,180,80,0.16), transparent 65%)" }}
      />

      <header className="relative flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo href="/" />
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-elevated">
            <EqBars bars={4} playing={false} className="h-6" />
          </span>

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent">
            One moment
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight">
            The room is briefly offline
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            You&rsquo;re signed in, but we couldn&rsquo;t reach the XCLSV
            database just now. Your access and your music are safe — try again
            in a moment.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/continue"
              className="inline-flex h-12 items-center rounded-lg bg-accent px-7 text-base font-medium text-on-accent shadow-glow transition-all hover:bg-accent-hi"
            >
              Try again
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-lg border border-line-strong px-7 text-base font-medium text-foreground transition-colors hover:bg-overlay"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
