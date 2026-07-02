"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGlobalPlayer } from "@/components/player/player-context";
import { Waveform } from "@/components/player/waveform";
import { EqBars } from "@/components/ui/eq-bars";
import { formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  HeartIcon,
  NextGlyph,
  PauseGlyph,
  PlayGlyph,
  PrevGlyph,
  RepeatGlyph,
  ShuffleGlyph,
  SlidersIcon,
  VolumeIcon,
} from "./icons";

/** The persistent bottom player. Reuses the real waveform engine as its
 * scrubber, so the same visual identity follows you across the whole app. */
export function GlobalPlayerBar() {
  const gp = useGlobalPlayer();
  const [liked, setLiked] = useState(false);
  const t = gp.track;
  const title = t?.title ?? "Pick a release to listen";
  const artist = t?.artist ?? "Nothing playing";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="glass pointer-events-auto mx-auto flex max-w-7xl items-center gap-3 rounded-3xl border border-line px-3 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.22)] sm:gap-5 sm:px-5 sm:py-3"
      >
        {/* Now playing */}
        <div className="flex min-w-0 items-center gap-3 sm:w-60">
          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-elevated">
            <EqBars bars={4} playing={gp.isPlaying} className="h-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{title}</span>
            <span className="block truncate text-xs text-muted">{artist}</span>
          </span>
          <button
            type="button"
            onClick={() => setLiked((v) => !v)}
            aria-label="Favorite"
            aria-pressed={liked}
            className={cn(
              "hidden h-9 w-9 shrink-0 place-items-center rounded-full transition-colors sm:grid",
              liked ? "text-signal-bad" : "text-faint hover:text-foreground",
            )}
          >
            <HeartIcon filled={liked} className="h-5 w-5" />
          </button>
        </div>

        {/* Transport + waveform */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button type="button" aria-label="Shuffle" className="hidden h-9 w-9 place-items-center rounded-full text-faint/50 sm:grid" title="Single exclusive track">
            <ShuffleGlyph className="h-[18px] w-[18px]" />
          </button>
          <button type="button" aria-label="Restart" onClick={() => gp.seekFraction(0)} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:text-foreground">
            <PrevGlyph className="h-[18px] w-[18px]" />
          </button>

          <motion.button
            type="button"
            onClick={gp.toggle}
            aria-label={gp.isPlaying ? "Pause" : "Play"}
            whileTap={{ scale: 0.92 }}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-on-accent"
            style={{ background: "rgb(var(--rp-rgb))", boxShadow: "0 6px 20px rgb(var(--rp-rgb) / 0.4)" }}
          >
            {gp.isPlaying ? <PauseGlyph className="h-5 w-5" /> : <PlayGlyph className="h-5 w-5 translate-x-0.5" />}
          </motion.button>

          <button type="button" aria-label="Next" className="hidden h-9 w-9 place-items-center rounded-full text-faint/50 sm:grid" title="Single exclusive track">
            <NextGlyph className="h-[18px] w-[18px]" />
          </button>
          <button type="button" aria-label="Repeat" className="hidden h-9 w-9 place-items-center rounded-full text-[rgb(var(--rp-rgb))] sm:grid" title="Repeat (on)">
            <RepeatGlyph className="h-[18px] w-[18px]" />
          </button>

          <span className="tnum hidden shrink-0 text-xs text-faint sm:block">
            {formatTimestamp(gp.currentMs)}
          </span>
          {gp.ready && gp.peaks.length > 0 ? (
            <Waveform
              peaks={gp.peaks}
              heat={gp.heat}
              primaryRgb={gp.tintRgb}
              getProgress={gp.getProgress}
              durationMs={gp.durationMs}
              onSeek={gp.seekFraction}
              className="h-9 min-w-0 flex-1 sm:h-11"
            />
          ) : (
            <div className="h-9 flex-1 sm:h-11" />
          )}
          <span className="tnum hidden shrink-0 text-xs text-faint sm:block">
            {formatTimestamp(gp.durationMs)}
          </span>
        </div>

        {/* Volume */}
        <div className="hidden items-center gap-2.5 lg:flex lg:w-44">
          <VolumeIcon className="h-5 w-5 shrink-0 text-muted" />
          <div className="h-1 flex-1 rounded-full bg-track-off">
            <div className="h-1 w-2/3 rounded-full bg-foreground/55" />
          </div>
          <SlidersIcon className="h-5 w-5 shrink-0 text-muted" />
        </div>
      </motion.div>
    </div>
  );
}
