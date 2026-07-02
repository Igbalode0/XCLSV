import type { Palette } from "@/components/player/types";

/** Brand fallback — warm champagne when there's no artwork to read. */
export const DEFAULT_PALETTE: Palette = {
  primary: "#e6b450",
  secondary: "#c98f57",
  primaryRgb: "230, 180, 80",
  isLight: false,
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Pull a dominant + secondary color out of album artwork by quantizing pixels
 * and ranking buckets by frequency × saturation (so we surface the vivid color,
 * not the muddy average). Near-black/white pixels are ignored.
 */
export async function extractPalette(src: string): Promise<Palette> {
  let img: HTMLImageElement;
  try {
    img = await loadImage(src);
  } catch {
    return DEFAULT_PALETTE;
  }

  const size = 44;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_PALETTE;
  ctx.drawImage(img, 0, 0, size, size);

  let pixels: Uint8ClampedArray;
  try {
    pixels = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return DEFAULT_PALETTE; // tainted canvas (cross-origin)
  }

  const buckets = new Map<
    number,
    { count: number; r: number; g: number; b: number; sat: number }
  >();

  for (let i = 0; i < pixels.length; i += 4) {
    if ((pixels[i + 3] ?? 0) < 200) continue;
    const r = pixels[i] ?? 0;
    const g = pixels[i + 1] ?? 0;
    const b = pixels[i + 2] ?? 0;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (lum < 0.08 || lum > 0.95) continue; // skip near black / white
    const sat = max === 0 ? 0 : (max - min) / max;

    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const e = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0, sat: 0 };
    e.count++;
    e.r += r;
    e.g += g;
    e.b += b;
    e.sat += sat;
    buckets.set(key, e);
  }

  if (buckets.size === 0) return DEFAULT_PALETTE;

  const ranked = [...buckets.values()]
    .map((e) => ({
      r: Math.round(e.r / e.count),
      g: Math.round(e.g / e.count),
      b: Math.round(e.b / e.count),
      score: e.count * (0.35 + e.sat / e.count),
    }))
    .sort((a, b) => b.score - a.score);

  const p = ranked[0];
  if (!p) return DEFAULT_PALETTE;
  const s = ranked[1] ?? p;
  const lum = (0.299 * p.r + 0.587 * p.g + 0.114 * p.b) / 255;

  return {
    primary: rgbToHex(p.r, p.g, p.b),
    secondary: rgbToHex(s.r, s.g, s.b),
    primaryRgb: `${p.r}, ${p.g}, ${p.b}`,
    isLight: lum > 0.62,
  };
}
