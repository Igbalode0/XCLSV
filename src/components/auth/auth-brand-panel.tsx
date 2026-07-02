"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";

/**
 * Left-hand brand panel of the auth split-screen. Boldness is spent in one
 * place — the ambient amber glow + the confident line — and everything else
 * stays quiet, so it feels like an invitation, not a marketing page.
 */
export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12">
      {/* ambient glow — the room lit by the gear */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[36rem] w-[36rem] rounded-full opacity-50 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(230,180,80,0.22), transparent 65%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative"
      >
        <Logo playing href={null} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        className="relative max-w-md"
      >
        <p className="font-display text-4xl leading-[1.1] tracking-tight text-foreground">
          The room before
          <br />
          the release.
        </p>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Share unreleased work with the few who matter. Read how they really
          listen. Walk into every public release already knowing it lands.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
        className="relative text-xs uppercase tracking-[0.2em] text-faint"
      >
        Invitation-grade music intelligence
      </motion.p>
    </div>
  );
}
