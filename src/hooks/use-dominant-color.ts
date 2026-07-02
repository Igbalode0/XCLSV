"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PALETTE, extractPalette } from "@/lib/color/extract";
import type { Palette } from "@/components/player/types";

/**
 * Resolve an adaptive palette from album artwork. Returns the brand fallback
 * until (and unless) a real artwork URL yields colors — so the UI is always
 * tinted by the song's own artwork. Reusable across player + analytics.
 */
export function useDominantColor(src: string | null): Palette {
  const [palette, setPalette] = useState<Palette>(DEFAULT_PALETTE);

  useEffect(() => {
    if (!src) {
      setPalette(DEFAULT_PALETTE);
      return;
    }
    let active = true;
    extractPalette(src)
      .then((p) => {
        if (active) setPalette(p);
      })
      .catch(() => {
        if (active) setPalette(DEFAULT_PALETTE);
      });
    return () => {
      active = false;
    };
  }, [src]);

  return palette;
}
