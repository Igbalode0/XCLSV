/**
 * Deterministic artwork + palette until real cover art lands (Phase 5).
 * Every track/artist seed maps to a stable muted gradient, and the same seed
 * yields the "r, g, b" tint that lights the room and the player around it.
 */

const PAIRS: Array<[string, string]> = [
  ["#b89a78", "#39465c"],
  ["#8f93b8", "#43406b"],
  ["#6f97a8", "#2c3b52"],
  ["#a88b6f", "#4a3b2f"],
  ["#9f8aa0", "#3e3a5a"],
  ["#8a8f72", "#3a4030"],
];

function pairFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return PAIRS[Math.abs(hash) % PAIRS.length] ?? PAIRS[0]!;
}

export function gradientFor(seed: string): string {
  const [a, b] = pairFor(seed);
  return `linear-gradient(135deg, ${a}, ${b})`;
}

/** The seed's dominant tint as "r, g, b" — feeds `--rp-rgb` and the waveform. */
export function tintFor(seed: string): string {
  const hex = pairFor(seed)[0].slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}
