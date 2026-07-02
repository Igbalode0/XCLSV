"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EqBars } from "@/components/ui/eq-bars";
import type { IntentChoice } from "../types";
import { ArrowRightIcon } from "../icons";

interface Props {
  intent: IntentChoice;
  displayName: string;
  onEnter: () => void;
}

/** Step 7 — the divergent send-off. Artists are pointed at their first upload
 * (Phase 5); fans toward discovery / redeeming an invite (Phase 7). */
export function CompleteStep({ intent, displayName, onEnter }: Props) {
  const isArtist = intent === "RELEASE" || intent === "BOTH";
  const firstName = displayName.trim().split(" ")[0] ?? "";

  return (
    <div className="flex flex-col items-center text-center">
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
        className="grid h-20 w-20 place-items-center rounded-2xl bg-accent/[0.12] shadow-glow"
      >
        <EqBars bars={4} className="h-7" />
      </motion.span>

      <h1 className="mt-7 font-display text-3xl tracking-tight">
        You&apos;re in{firstName ? `, ${firstName}` : ""}.
      </h1>

      <p className="mt-3 max-w-sm text-muted">
        {isArtist
          ? "Your studio is ready. Upload your first track and start reading how it really lands — before you release it anywhere."
          : "Your room is ready. Discover unreleased music and help shape it with the artists who let you in first."}
      </p>

      <div className="mt-8 w-full max-w-xs">
        <Button size="lg" className="w-full" onClick={onEnter}>
          {isArtist ? "Enter the studio" : "Start listening"}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-4 text-xs text-faint">
        {isArtist
          ? "Next: upload your first song."
          : "Next: follow artists or redeem an invitation code."}
      </p>
    </div>
  );
}
