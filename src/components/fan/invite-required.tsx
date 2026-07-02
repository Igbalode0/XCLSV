"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { SignOutButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EqBars } from "@/components/ui/eq-bars";
import { redeemInviteCode } from "@/app/invite/actions";

/**
 * The closed door. A signed-in account with no artist binding sees nothing —
 * no catalog, no artists, no listeners — until an invitation opens their room.
 * Accepts the raw code or the full invite link, pasted straight from the
 * artist's message.
 */
export function InviteRequired({ displayName }: { displayName: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim() || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await redeemInviteCode(code);
      if (result?.error) setError(result.error);
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

      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center"
        >
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/[0.1] shadow-glow">
            <EqBars bars={4} playing={false} className="h-6" />
          </span>

          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent">
            Invite only
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-tight">
            Your room isn&rsquo;t open yet
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            XCLSV access begins with an artist. Paste the invitation code or
            link they sent you and step inside.
          </p>

          <form onSubmit={submit} className="glass mt-7 rounded-lg border border-line p-5 text-left shadow-elev">
            <label htmlFor="invite-code" className="text-xs uppercase tracking-wider text-faint">
              Invitation code or link
            </label>
            <Input
              id="invite-code"
              className="mt-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="xclsv.app/invite/…"
              autoComplete="off"
              spellCheck={false}
              invalid={Boolean(error)}
              disabled={pending}
            />
            {error ? (
              <p className="mt-3 text-sm text-signal-bad" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="mt-4 w-full" disabled={!code.trim() || pending}>
              {pending ? (
                <>
                  <EqBars className="h-4" /> Unlocking…
                </>
              ) : (
                "Unlock my access"
              )}
            </Button>
          </form>

          <p className="mt-6 text-xs text-faint">
            Signed in as {displayName} ·{" "}
            <SignOutButton redirectUrl="/">
              <button type="button" className="underline underline-offset-2 hover:text-foreground">
                Sign out
              </button>
            </SignOutButton>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
