"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EqBars } from "@/components/ui/eq-bars";
import { useDominantColor } from "@/hooks/use-dominant-color";
import {
  bufferToWavBlob,
  createDemoBuffer,
  decodeAudio,
  extractPeaks,
} from "@/lib/audio/peaks";
import { formatTimestamp } from "@/lib/utils";
import { Player, type PlayerHandle } from "./player";
import { MomentsPanel, BottomSheet } from "./moments-panel";
import type { Reaction, ReactionType } from "./types";

const BUCKETS = 200;

const SEED: Reaction[] = [
  { id: "s1", type: "favorite", timeMs: 6800, author: "mara" },
  { id: "s2", type: "comment", timeMs: 11200, body: "This hook is insane.", author: "deji" },
  { id: "s3", type: "fire", timeMs: 13800, author: "lex" },
  { id: "s4", type: "comment", timeMs: 15400, body: "This drop starts here.", author: "mara" },
  { id: "s5", type: "best", timeMs: 18200, author: "sam" },
];

/** Synthesize a believable replay heatmap: hot through the drop, peak mid-song. */
function makeHeat(n: number): number[] {
  const heat = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const f = i / n;
    let v = 0;
    if (f > 0.4 && f < 0.68) v = 0.5 + 0.45 * Math.sin(((f - 0.4) / 0.28) * Math.PI);
    if (Math.abs(f - 0.5) < 0.02) v = Math.max(v, 0.95);
    if (Math.abs(f - 0.3) < 0.015) v = Math.max(v, 0.6);
    heat[i] = Math.min(1, v);
  }
  return heat;
}

interface ListeningRoomProps {
  title: string;
  artistName: string;
}

export function ListeningRoom({ title: initialTitle, artistName }: ListeningRoomProps) {
  const [title, setTitle] = useState(initialTitle);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [durationMs, setDurationMs] = useState(0);
  const [heat, setHeat] = useState<number[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const palette = useDominantColor(artworkUrl);
  const playerRef = useRef<PlayerHandle>(null);
  const audioUrlRef = useRef<string | null>(null);
  const artUrlRef = useRef<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const artInputRef = useRef<HTMLInputElement>(null);

  // Bootstrap with a synthesized-but-real track so the waveform is alive on load.
  useEffect(() => {
    try {
      const buffer = createDemoBuffer(24);
      const p = extractPeaks(buffer, BUCKETS);
      const url = URL.createObjectURL(bufferToWavBlob(buffer));
      audioUrlRef.current = url;
      setPeaks(p);
      setDurationMs(Math.round(buffer.duration * 1000));
      setHeat(makeHeat(p.length));
      setReactions(SEED);
      setAudioSrc(url);
    } catch {
      // Audio unavailable — still render the room shell.
    } finally {
      setReady(true);
    }
    return () => {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (artUrlRef.current) URL.revokeObjectURL(artUrlRef.current);
    };
  }, []);

  async function onAudioFile(file: File) {
    setError(null);
    try {
      const audioBuffer = await decodeAudio(await file.arrayBuffer());
      const p = extractPeaks(audioBuffer, BUCKETS);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      const url = URL.createObjectURL(file);
      audioUrlRef.current = url;
      setPeaks(p);
      setDurationMs(Math.round(audioBuffer.duration * 1000));
      setHeat(makeHeat(p.length));
      setReactions([]);
      setTitle(file.name.replace(/\.[^.]+$/, ""));
      setAudioSrc(url);
    } catch {
      setError("Couldn't read that audio file — try an mp3 or wav.");
    }
  }

  function onArtworkFile(file: File) {
    if (artUrlRef.current) URL.revokeObjectURL(artUrlRef.current);
    const url = URL.createObjectURL(file);
    artUrlRef.current = url;
    setArtworkUrl(url);
  }

  function addReaction(type: ReactionType, body?: string) {
    const ms = playerRef.current?.getCurrentMs() ?? currentMs;
    setReactions((rs) => [
      ...rs,
      { id: crypto.randomUUID(), type, timeMs: Math.round(ms), body, author: "you" },
    ]);
  }

  const seek = (ms: number) => playerRef.current?.seekToMs(ms);
  const currentLabel = formatTimestamp(currentMs);
  const spaceRgb = palette.primaryRgb.split(",").map((s) => s.trim()).join(" ");
  const rootStyle = { "--rp-rgb": spaceRgb } as React.CSSProperties;

  const panel = (
    <MomentsPanel
      reactions={reactions}
      currentLabel={currentLabel}
      onSeek={seek}
      onAdd={addReaction}
      className="h-full"
    />
  );

  return (
    <div className="relative min-h-dvh overflow-hidden" style={rootStyle}>
      {/* Adaptive lighting — the room is lit by the artwork. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {artworkUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artworkUrl}
            alt=""
            className="absolute inset-0 h-full w-full scale-125 object-cover opacity-25 blur-[90px]"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 25% -5%, rgb(var(--rp-rgb) / 0.20), transparent 70%), radial-gradient(45% 45% at 95% 15%, rgb(var(--rp-rgb) / 0.12), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 bg-canvas/55" />
      </div>

      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo href="/studio" />
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-8 px-5 pb-44 pt-2 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:gap-10 lg:pb-16">
        <section>
          {/* Unreleased framing */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-overlay px-3 py-1 text-xs text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(var(--rp-rgb))] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--rp-rgb))]" />
              </span>
              Unreleased · Private listen
            </span>
            <span className="text-xs text-faint">Heard by your circle before anyone</span>
          </div>

          {/* Hero — artwork + meta */}
          <div className="mt-5 flex items-center gap-5">
            <button
              type="button"
              onClick={() => artInputRef.current?.click()}
              className="group relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line-strong bg-elevated shadow-[0_10px_40px_rgba(0,0,0,0.4)] sm:h-28 sm:w-28"
              aria-label="Set album artwork"
            >
              {artworkUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={artworkUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-center text-[10px] uppercase tracking-wider text-faint">
                  Add
                  <br />
                  artwork
                </span>
              )}
              <span className="absolute inset-0 grid place-items-center bg-canvas/50 text-[10px] uppercase tracking-wider text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                Change
              </span>
            </button>

            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl tracking-tight sm:text-3xl">
                {title}
              </h1>
              <p className="mt-0.5 text-muted">{artistName}</p>
              <p className="mt-1 text-xs text-faint">Public release — not scheduled</p>
            </div>
          </div>

          {/* The player — waveform centerpiece */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass mt-8 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-7"
          >
            {ready && peaks.length > 0 ? (
              <Player
                ref={playerRef}
                src={audioSrc}
                peaks={peaks}
                heat={heat}
                primaryRgb={palette.primaryRgb}
                durationMs={durationMs}
                reactions={reactions}
                onMarkerClick={(r) => seek(r.timeMs)}
                onTimeChange={setCurrentMs}
              />
            ) : (
              <div className="grid h-40 place-items-center">
                <EqBars bars={5} />
              </div>
            )}
          </motion.div>

          {/* Load your own */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-faint">
            <span>Want your own waveform?</span>
            <button
              type="button"
              onClick={() => audioInputRef.current?.click()}
              className="text-[rgb(var(--rp-rgb))] hover:underline"
            >
              Load a track
            </button>
            <button
              type="button"
              onClick={() => artInputRef.current?.click()}
              className="text-[rgb(var(--rp-rgb))] hover:underline"
            >
              Load artwork
            </button>
            {error ? <span className="text-signal-bad">{error}</span> : null}
          </div>

          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onAudioFile(f);
              e.target.value = "";
            }}
          />
          <input
            ref={artInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onArtworkFile(f);
              e.target.value = "";
            }}
          />
        </section>

        {/* Moments — desktop column */}
        <aside className="hidden lg:block">
          <div className="glass sticky top-6 rounded-3xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            {panel}
          </div>
        </aside>
      </main>

      {/* Moments — mobile bottom sheet */}
      <div className="lg:hidden">
        <BottomSheet>{panel}</BottomSheet>
      </div>
    </div>
  );
}
