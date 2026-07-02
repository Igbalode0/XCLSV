"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn, formatTimestamp } from "@/lib/utils";
import { REACTION_META, type Reaction } from "./types";

interface WaveformProps {
  peaks: number[];
  /** Replay intensity per peak, 0..1. Drives brightness + gold glow. */
  heat?: number[];
  /** Adaptive tint as "r, g, b". */
  primaryRgb: string;
  /** Live progress 0..1, read every frame (no React churn). */
  getProgress: () => number;
  durationMs: number;
  reactions?: Reaction[];
  onSeek: (fraction: number) => void;
  onMarkerClick?: (r: Reaction) => void;
  className?: string;
}

const GOLD: [number, number, number] = [243, 201, 105];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * The waveform IS the timeline. Rendered to canvas from real peaks: played
 * section bright in the artwork's color, remaining semi-transparent, replayed
 * sections warmed toward gold with a soft glow. Click/drag to seek; arrow keys
 * to scrub. Reaction markers float above, anchored to their moment.
 */
export function Waveform({
  peaks,
  heat,
  primaryRgb,
  getProgress,
  durationMs,
  reactions = [],
  onSeek,
  onMarkerClick,
  className,
}: WaveformProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      sizeRef.current = { w, h, dpr };
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rgb = primaryRgb.split(",").map((s) => parseInt(s.trim(), 10));
    const [pr, pg, pb] = [rgb[0] || 230, rgb[1] || 180, rgb[2] || 80];
    let raf = 0;

    const draw = () => {
      const { w, h, dpr } = sizeRef.current;
      if (w === 0) {
        raf = requestAnimationFrame(draw);
        return;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const n = peaks.length;
      const slot = w / n;
      const barW = Math.max(1.5, Math.min(slot * 0.6, 6));
      const mid = h / 2;
      const progress = Math.min(1, Math.max(0, getProgress()));
      const hover = hoverRef.current;

      for (let i = 0; i < n; i++) {
        const frac = (i + 0.5) / n;
        const heatV = heat ? heat[i] ?? 0 : 0;
        const played = frac <= progress;

        let swell = 0;
        if (hover !== null) {
          const d = Math.abs(frac - hover);
          if (d < 0.045) swell = (1 - d / 0.045) * 0.45;
        }

        const barH = Math.max(3, (peaks[i] ?? 0) * h * 0.84) * (1 + swell * 0.18);
        const x = i * slot + (slot - barW) / 2;
        const y = mid - barH / 2;

        // Blend the artwork color toward gold by replay heat.
        const t = Math.min(1, heatV) * 0.85;
        const r = Math.round(pr + (GOLD[0] - pr) * t);
        const g = Math.round(pg + (GOLD[1] - pg) * t);
        const b = Math.round(pb + (GOLD[2] - pb) * t);

        let alpha = played ? 0.95 : 0.22;
        if (!played && heatV > 0) alpha += heatV * 0.16;
        alpha += swell * 0.3;

        if (heatV > 0.55) {
          ctx.shadowColor = `rgba(${GOLD[0]}, ${GOLD[1]}, ${GOLD[2]}, ${0.55 * heatV})`;
          ctx.shadowBlur = 12 * heatV;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, alpha)})`;
        roundRect(ctx, x, y, barW, barH, barW / 2);
        ctx.fill();
      }

      // Playhead
      ctx.shadowBlur = 0;
      const px = progress * w;
      ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.9)`;
      ctx.fillRect(px - 0.75, 0, 1.5, h);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [peaks, heat, primaryRgb, getProgress]);

  const fractionFromX = useCallback((clientX: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return 0;
    const rect = wrap.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    onSeek(fractionFromX(e.clientX));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    hoverRef.current = fractionFromX(e.clientX);
    if (draggingRef.current) onSeek(hoverRef.current);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const onPointerLeave = () => {
    hoverRef.current = null;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = getProgress();
    const stepFrac = durationMs ? 5000 / durationMs : 0.02;
    if (e.key === "ArrowRight") {
      onSeek(Math.min(1, cur + stepFrac));
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      onSeek(Math.max(0, cur - stepFrac));
      e.preventDefault();
    } else if (e.key === "Home") {
      onSeek(0);
      e.preventDefault();
    } else if (e.key === "End") {
      onSeek(1);
      e.preventDefault();
    }
  };

  return (
    <div className={cn("relative h-28 sm:h-40", className)}>
      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek through the track"
        aria-valuemin={0}
        aria-valuemax={Math.round(durationMs / 1000) || 0}
        aria-valuenow={Math.round((getProgress() * durationMs) / 1000) || 0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        className="relative h-full w-full cursor-pointer touch-none select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--rp-rgb))]"
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      {/* Timestamped reaction markers — anchored to their moment. */}
      {reactions.map((r) => {
        const left = durationMs
          ? Math.min(99, Math.max(1, (r.timeMs / durationMs) * 100))
          : 0;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onMarkerClick?.(r)}
            className="group absolute -top-1 z-10 -translate-x-1/2"
            style={{ left: `${left}%` }}
            aria-label={`${REACTION_META[r.type].label} at ${formatTimestamp(r.timeMs)}${r.body ? `: ${r.body}` : ""}`}
            title={`${formatTimestamp(r.timeMs)} · ${r.body ?? REACTION_META[r.type].label}`}
          >
            <span className="grid h-7 w-7 place-items-center rounded-full border border-white/15 bg-black/35 text-[12px] shadow-sm backdrop-blur-md transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-110">
              {REACTION_META[r.type].emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
