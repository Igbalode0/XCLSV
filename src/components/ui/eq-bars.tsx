"use client";

import { cn } from "@/lib/utils";

interface EqBarsProps {
  className?: string;
  bars?: number;
  /** When false, bars rest low (paused) instead of animating. */
  playing?: boolean;
}

/**
 * The XCLSV signature motif: an equalizer/waveform that recurs as the loading
 * state, the "now playing" indicator, and the brand mark. It ties every
 * surface back to the one thing the product is about — the timeline of a song.
 * Animation is driven by the `eq` keyframes in globals.css and is disabled
 * automatically under prefers-reduced-motion.
 */
export function EqBars({ className, bars = 4, playing = true }: EqBarsProps) {
  return (
    <span
      className={cn("inline-flex h-4 items-end gap-[3px]", className)}
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-accent"
          style={{
            height: playing ? undefined : "30%",
            animation: playing
              ? `eq 900ms ease-in-out ${i * 120}ms infinite`
              : "none",
          }}
        />
      ))}
    </span>
  );
}
