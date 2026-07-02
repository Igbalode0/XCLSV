"use client";

/**
 * Playback event taxonomy — the raw signal behind every analytic on XCLSV.
 * Heatmaps, skip points, retention curves, replay rate, and the Release
 * Confidence Score are all DERIVED from these events.
 *
 * Keep this union in lockstep with the PlaybackEventType enum in schema.prisma.
 */
export type PlaybackEventType =
  | "PLAY"
  | "PAUSE"
  | "SEEK"
  | "SKIP"
  | "COMPLETE"
  | "REPLAY_SEGMENT";

export interface PlaybackEvent {
  sessionId: string;
  versionId: string;
  type: PlaybackEventType;
  /** Playhead position (ms) when the event fired. */
  positionMs: number;
  /** Destination position (ms), for SEEK. */
  toPositionMs?: number;
}

/**
 * Buffers playback events and flushes them in batches, so instrumentation
 * never competes with smooth audio playback or floods the network.
 *
 * Flushes on a timer, when the buffer fills, and reliably on page-hide via
 * sendBeacon (so we don't lose the crucial last events of a session).
 */
export class PlaybackTracker {
  private buffer: PlaybackEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly endpoint = "/api/events",
    private readonly flushMs = 5000,
    private readonly maxBuffer = 20,
  ) {}

  start() {
    this.timer ??= setInterval(() => this.flush(), this.flushMs);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onHide);
    }
  }

  track(event: PlaybackEvent) {
    this.buffer.push(event);
    if (this.buffer.length >= this.maxBuffer) this.flush();
  }

  flush(useBeacon = false) {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.buffer.length);
    const body = JSON.stringify({ events: batch });

    if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(this.endpoint, body);
      return;
    }
    void fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onHide);
    }
    this.flush(true);
  }

  private onHide = () => {
    if (document.visibilityState === "hidden") this.flush(true);
  };
}
