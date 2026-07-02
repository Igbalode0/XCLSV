"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EqBars } from "@/components/ui/eq-bars";
import { acceptInvite } from "../actions";

/**
 * One deliberate step: accept the invitation. Sign-up (or sign-in) follows,
 * then the mandatory Exclusive Listening Agreement — the room only opens
 * after both.
 */
export function AcceptCard({
  token,
  artistName,
}: {
  token: string;
  artistName: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvite(token);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass mt-8 rounded-lg border border-line p-6 text-center shadow-elev sm:p-8"
    >
      <p className="text-sm text-muted">
        This is a private invitation. Everything inside is unreleased and shared
        in confidence — you&rsquo;ll review the Exclusive Listening Agreement
        before the room opens.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-signal-bad" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        size="lg"
        className="mt-6 w-full"
        disabled={pending}
        onClick={submit}
      >
        {pending ? (
          <>
            <EqBars className="h-4" /> Opening the door…
          </>
        ) : (
          <>Accept {artistName}&rsquo;s invitation</>
        )}
      </Button>

      <p className="mt-4 text-xs text-faint">
        New here? You&rsquo;ll create your account next. Already a member? Just
        sign in — the room is added to your access.
      </p>
    </motion.div>
  );
}
