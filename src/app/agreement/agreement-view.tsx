"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useClerk } from "@clerk/nextjs";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { EqBars } from "@/components/ui/eq-bars";
import { cn } from "@/lib/utils";
import {
  AGREEMENT_CLOSING,
  AGREEMENT_CONFIRMATION,
  AGREEMENT_INTRO,
  AGREEMENT_SUBTITLE,
  AGREEMENT_TERMS,
  AGREEMENT_TITLE,
  AGREEMENT_VERSION,
} from "@/lib/agreement";
import { acceptAgreement, declineAgreement } from "./actions";

/**
 * The full-screen listener gate. There is no way past it except Accept or
 * Decline: no close button, no skip, no navigation. Decline signs the user
 * out and returns them to the landing page.
 *
 * `preview` renders the identical screen but routes both buttons back to the
 * dev preview index instead of touching the account.
 */
export function AgreementView({ preview = false }: { preview?: boolean }) {
  const router = useRouter();
  const { signOut } = useClerk();

  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const accept = () => {
    if (preview) {
      router.push("/preview");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await acceptAgreement();
      if (result?.error) setError(result.error);
    });
  };

  const decline = () => {
    if (preview) {
      router.push("/preview");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await declineAgreement();
      } finally {
        await signOut({ redirectUrl: "/" });
      }
    });
  };

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(230,180,80,0.16), transparent 65%)" }}
      />

      <header className="relative flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo href={null} />
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-start justify-center px-6 py-8 sm:items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-2xl"
        >
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-accent">
              Before you enter
            </p>
            <h1 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              {AGREEMENT_TITLE}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-muted">{AGREEMENT_SUBTITLE}</p>
          </div>

          <div className="glass mt-7 rounded-lg border border-line p-6 shadow-elev sm:p-8">
            <p className="text-sm text-muted">{AGREEMENT_INTRO}</p>

            <ul className="mt-5 space-y-3.5">
              {AGREEMENT_TERMS.map((term) => (
                <li key={term} className="flex gap-3.5">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    aria-hidden
                  />
                  <p className="text-sm leading-relaxed text-foreground">{term}</p>
                </li>
              ))}
            </ul>

            <p className="mt-5 font-display text-base text-foreground">
              {AGREEMENT_CLOSING}
            </p>

            <button
              type="button"
              role="checkbox"
              aria-checked={confirmed}
              disabled={pending}
              onClick={() => setConfirmed((c) => !c)}
              className="mt-7 flex w-full items-center gap-3.5 rounded-md border border-line bg-overlay px-4 py-3.5 text-left transition-colors hover:bg-overlay-strong disabled:opacity-50"
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-colors",
                  confirmed
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line-strong bg-field",
                )}
                aria-hidden
              >
                {confirmed ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                ) : null}
              </span>
              <span className="text-sm text-foreground">{AGREEMENT_CONFIRMATION}</span>
            </button>

            {error ? (
              <p className="mt-4 text-sm text-signal-bad" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                size="lg"
                onClick={decline}
                disabled={pending}
                className="sm:min-w-36"
              >
                Decline
              </Button>
              <Button
                size="lg"
                onClick={accept}
                disabled={!confirmed || pending}
                className="sm:min-w-44"
              >
                {pending ? (
                  <>
                    <EqBars className="h-4" /> One moment…
                  </>
                ) : (
                  "Accept"
                )}
              </Button>
            </div>
          </div>

          <p className="tnum mt-5 text-center text-xs text-faint">
            Agreement version {AGREEMENT_VERSION} · declining signs you out
          </p>
        </motion.div>
      </main>
    </div>
  );
}
