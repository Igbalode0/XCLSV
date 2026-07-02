/** Player + waveform shared contracts. Pure types — safe to import anywhere. */

export type ReactionType = "favorite" | "comment" | "fire" | "best";

export interface Reaction {
  id: string;
  type: ReactionType;
  /** Anchored to a moment in the track. */
  timeMs: number;
  body?: string; // for comments
  author?: string;
}

export const REACTION_META: Record<
  ReactionType,
  { emoji: string; label: string }
> = {
  favorite: { emoji: "❤️", label: "Favorite moment" },
  comment: { emoji: "💬", label: "Comment" },
  fire: { emoji: "🔥", label: "Replay hotspot" },
  best: { emoji: "⭐", label: "Best section" },
};

/** Adaptive palette extracted from album artwork (or the brand fallback). */
export interface Palette {
  primary: string; // hex
  secondary: string; // hex
  primaryRgb: string; // "r, g, b" — for rgba() glows + CSS vars
  isLight: boolean;
}
