"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { bufferToWavBlob, createDemoBuffer, extractPeaks } from "@/lib/audio/peaks";

export interface Track {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
}

interface GlobalPlayerContext {
  track: Track | null;
  isPlaying: boolean;
  durationMs: number;
  currentMs: number;
  peaks: number[];
  heat: number[];
  ready: boolean;
  /** Adaptive tint as "r, g, b" — mirrors into the `--rp-rgb` CSS variable so
   * the whole shell (ambient light, transport, accents) follows the music. */
  tintRgb: string;
  setTint: (rgb: string) => void;
  play: (track?: Track) => void;
  pause: () => void;
  toggle: () => void;
  seekFraction: (f: number) => void;
  seekToMs: (ms: number) => void;
  getProgress: () => number;
}

const Ctx = createContext<GlobalPlayerContext | null>(null);

export function useGlobalPlayer(): GlobalPlayerContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGlobalPlayer must be used within <PlayerProvider>");
  return c;
}

function makeHeat(n: number): number[] {
  const heat = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const f = i / n;
    let v = 0;
    if (f > 0.4 && f < 0.68) v = 0.5 + 0.45 * Math.sin(((f - 0.4) / 0.28) * Math.PI);
    if (Math.abs(f - 0.5) < 0.025) v = Math.max(v, 0.95);
    heat[i] = Math.min(1, v);
  }
  return heat;
}

/**
 * One persistent audio engine for the whole app. Any release card calls
 * `play(track)`; the global bar reflects it and renders the live waveform.
 * Uses the synthesized demo buffer so it works with zero backend today; in
 * Phase 6 `setTrack` will swap to a per-release signed URL + precomputed peaks.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const urlRef = useRef<string | null>(null);

  const [track, setTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [currentMs, setCurrentMs] = useState(0);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [heat, setHeat] = useState<number[]>([]);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tintRgb, setTint] = useState("230, 180, 80");

  // One place mirrors the tint into CSS so every `rgb(var(--rp-rgb))` in the
  // shell re-lights with the currently playing artwork's color.
  useEffect(() => {
    document.documentElement.style.setProperty("--rp-rgb", tintRgb);
    return () => {
      document.documentElement.style.removeProperty("--rp-rgb");
    };
  }, [tintRgb]);

  useEffect(() => {
    try {
      const buf = createDemoBuffer(24);
      const p = extractPeaks(buf, 160);
      const url = URL.createObjectURL(bufferToWavBlob(buf));
      urlRef.current = url;
      setPeaks(p);
      setHeat(makeHeat(p.length));
      setSrc(url);
      setDurationMs(Math.round(buf.duration * 1000));
    } catch {
      /* audio unavailable — bar still renders */
    } finally {
      setReady(true);
    }
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const getProgress = () => {
    const a = audioRef.current;
    if (!a || !a.duration || !isFinite(a.duration)) return 0;
    return a.currentTime / a.duration;
  };
  const seekFraction = (f: number) => {
    const a = audioRef.current;
    if (a && a.duration && isFinite(a.duration)) {
      a.currentTime = f * a.duration;
      setCurrentMs(a.currentTime * 1000);
    }
  };
  const seekToMs = (ms: number) => {
    const a = audioRef.current;
    if (a) {
      a.currentTime = ms / 1000;
      setCurrentMs(ms);
    }
  };
  const play = (t?: Track) => {
    if (t) setTrack(t);
    void audioRef.current?.play();
  };
  const pause = () => audioRef.current?.pause();
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  return (
    <Ctx.Provider
      value={{
        track,
        isPlaying,
        durationMs,
        currentMs,
        peaks,
        heat,
        ready,
        tintRgb,
        setTint,
        play,
        pause,
        toggle,
        seekFraction,
        seekToMs,
        getProgress,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={src ?? undefined}
        preload="metadata"
        loop
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (isFinite(d)) setDurationMs(d * 1000);
        }}
        onTimeUpdate={(e) => setCurrentMs(e.currentTarget.currentTime * 1000)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </Ctx.Provider>
  );
}
