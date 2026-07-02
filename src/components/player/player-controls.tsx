"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleLoop: () => void;
  onToggleShuffle: () => void;
  /** Single-exclusive-track: next/shuffle are present for the form but inert. */
  canNext?: boolean;
  canShuffle?: boolean;
}

/**
 * The floating oval island. Glass capsule, soft blur, the play control tinted by
 * the artwork's adaptive color. Lives independently beneath the waveform.
 */
export function PlayerControls({
  isPlaying,
  isLooping,
  isShuffle,
  onPlayPause,
  onPrev,
  onNext,
  onToggleLoop,
  onToggleShuffle,
  canNext = false,
  canShuffle = false,
}: PlayerControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="glass mx-auto flex w-fit items-center gap-1 rounded-full border border-white/10 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:gap-2 sm:p-2"
    >
      <IconButton
        label="Shuffle"
        onClick={onToggleShuffle}
        active={isShuffle}
        disabled={!canShuffle}
        title={canShuffle ? "Shuffle" : "Single exclusive track"}
      >
        <ShuffleIcon />
      </IconButton>

      <IconButton label="Restart" onClick={onPrev}>
        <PrevIcon />
      </IconButton>

      <motion.button
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.04 }}
        className="grid h-14 w-14 place-items-center rounded-full text-on-accent sm:h-16 sm:w-16"
        style={{
          background: "rgb(var(--rp-rgb))",
          boxShadow: "0 8px 30px rgb(var(--rp-rgb) / 0.45)",
        }}
      >
        {isPlaying ? <PauseIcon big /> : <PlayIcon big />}
      </motion.button>

      <IconButton
        label="Next"
        onClick={onNext}
        disabled={!canNext}
        title={canNext ? "Next" : "Single exclusive track"}
      >
        <NextIcon />
      </IconButton>

      <IconButton label="Repeat" onClick={onToggleLoop} active={isLooping} title="Repeat">
        <RepeatIcon />
      </IconButton>
    </motion.div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  active,
  disabled,
  title,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={title ?? label}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      whileHover={disabled ? undefined : { scale: 1.1 }}
      className={cn(
        "grid h-11 w-11 place-items-center rounded-full transition-colors",
        disabled
          ? "text-faint/40"
          : active
            ? "text-[rgb(var(--rp-rgb))]"
            : "text-muted hover:bg-overlay hover:text-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}

/* ── icons ──────────────────────────────────────────────────────────────── */

function PlayIcon({ big }: { big?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={big ? "h-6 w-6 translate-x-0.5" : "h-5 w-5"} aria-hidden>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" />
    </svg>
  );
}
function PauseIcon({ big }: { big?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={big ? "h-6 w-6" : "h-5 w-5"} aria-hidden>
      <rect x="6" y="4.5" width="4" height="15" rx="1.5" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.5" />
    </svg>
  );
}
function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <rect x="5" y="5" width="2.5" height="14" rx="1" />
      <path d="M20 6.2v11.6a1 1 0 0 1-1.55.83l-8.7-5.8a1 1 0 0 1 0-1.66l8.7-5.8A1 1 0 0 1 20 6.2z" />
    </svg>
  );
}
function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <rect x="16.5" y="5" width="2.5" height="14" rx="1" />
      <path d="M4 6.2v11.6a1 1 0 0 0 1.55.83l8.7-5.8a1 1 0 0 0 0-1.66l-8.7-5.8A1 1 0 0 0 4 6.2z" />
    </svg>
  );
}
function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}
function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
