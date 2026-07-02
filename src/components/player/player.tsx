"use client";

import * as React from "react";
import { Waveform } from "./waveform";
import { PlayerControls } from "./player-controls";
import { formatTimestamp } from "@/lib/utils";
import type { Reaction } from "./types";

export interface PlayerHandle {
  seekToMs: (ms: number) => void;
  getCurrentMs: () => number;
  play: () => void;
  pause: () => void;
}

interface PlayerProps {
  src: string | null;
  peaks: number[];
  heat?: number[];
  primaryRgb: string;
  /** Peak-derived duration; the audio's real duration overrides once known. */
  durationMs: number;
  reactions?: Reaction[];
  onMarkerClick?: (r: Reaction) => void;
  onTimeChange?: (ms: number) => void;
}

export const Player = React.forwardRef<PlayerHandle, PlayerProps>(function Player(
  { src, peaks, heat, primaryRgb, durationMs, reactions, onMarkerClick, onTimeChange },
  ref,
) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(false);
  const [isShuffle, setIsShuffle] = React.useState(false);
  const [currentMs, setCurrentMs] = React.useState(0);
  const [audioDurationMs, setAudioDurationMs] = React.useState(0);

  const effectiveDurationMs = audioDurationMs || durationMs;

  const getProgress = React.useCallback(() => {
    const a = audioRef.current;
    if (!a || !a.duration || !isFinite(a.duration)) return 0;
    return a.currentTime / a.duration;
  }, []);

  const seekToFraction = React.useCallback((fraction: number) => {
    const a = audioRef.current;
    if (!a || !a.duration || !isFinite(a.duration)) return;
    a.currentTime = fraction * a.duration;
    setCurrentMs(a.currentTime * 1000);
  }, []);

  React.useImperativeHandle(ref, () => ({
    seekToMs: (ms: number) => {
      const a = audioRef.current;
      if (!a) return;
      a.currentTime = ms / 1000;
      setCurrentMs(ms);
    },
    getCurrentMs: () => (audioRef.current ? audioRef.current.currentTime * 1000 : 0),
    play: () => void audioRef.current?.play(),
    pause: () => audioRef.current?.pause(),
  }));

  // Reset transport when the source changes.
  React.useEffect(() => {
    setIsPlaying(false);
    setCurrentMs(0);
    setAudioDurationMs(0);
  }, [src]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !src) return;
    if (a.paused) void a.play();
    else a.pause();
  };

  const toggleLoop = () => {
    const a = audioRef.current;
    const next = !isLooping;
    setIsLooping(next);
    if (a) a.loop = next;
  };

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        src={src ?? undefined}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (isFinite(d)) setAudioDurationMs(d * 1000);
        }}
        onTimeUpdate={(e) => {
          const ms = e.currentTarget.currentTime * 1000;
          setCurrentMs(ms);
          onTimeChange?.(ms);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <Waveform
        peaks={peaks}
        heat={heat}
        primaryRgb={primaryRgb}
        getProgress={getProgress}
        durationMs={effectiveDurationMs}
        reactions={reactions}
        onSeek={seekToFraction}
        onMarkerClick={onMarkerClick}
      />

      <div className="mt-2 flex items-center justify-between px-1 text-xs text-muted">
        <span className="tnum">{formatTimestamp(currentMs)}</span>
        <span className="tnum">{formatTimestamp(effectiveDurationMs)}</span>
      </div>

      <div className="mt-5">
        <PlayerControls
          isPlaying={isPlaying}
          isLooping={isLooping}
          isShuffle={isShuffle}
          onPlayPause={togglePlay}
          onPrev={() => seekToFraction(0)}
          onNext={() => {}}
          onToggleLoop={toggleLoop}
          onToggleShuffle={() => setIsShuffle((s) => !s)}
          canNext={false}
          canShuffle={false}
        />
      </div>
    </div>
  );
});
