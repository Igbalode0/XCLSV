export type Role = "ARTIST" | "FAN";

/**
 * The five normalized (0–1) signals behind the Release Confidence Score.
 * The scoring formula is swappable; this contract is stable, so historical
 * snapshots stay comparable when the real model replaces the placeholder.
 */
export interface ConfidenceSignals {
  /** Average listen completion. */
  completion: number;
  /** Normalized replay intensity. */
  replay: number;
  /** Normalized average rating. */
  rating: number;
  /** Comment sentiment (placeholder heuristic until AI lands). */
  sentiment: number;
  /** Listener return rate + listen depth. */
  engagement: number;
}

export interface ReleaseConfidenceResult {
  /** 0–100. */
  score: number;
  summary: string;
  signals: ConfidenceSignals;
}

/** A point on a retention curve: % of listeners still playing at a given ms. */
export interface RetentionPoint {
  positionMs: number;
  retained: number; // 0–1
}

/** A heatmap / skip-point bucket across the song timeline. */
export interface TimelineBucket {
  positionMs: number;
  plays: number;
  skips: number;
  replays: number;
}
