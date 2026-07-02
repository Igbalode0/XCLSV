"use client";

import { GENRES, MAX_GENRES } from "../constants";
import type { OnboardingDraft } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}

/** Step 4 — favorite/affiliated genres. Optional, capped, fast to skim. */
export function GenresStep({ draft, update }: Props) {
  const atMax = draft.genres.length >= MAX_GENRES;

  function toggle(genre: string) {
    if (draft.genres.includes(genre)) {
      update({ genres: draft.genres.filter((g) => g !== genre) });
    } else if (!atMax) {
      update({ genres: [...draft.genres, genre] });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((genre) => {
          const selected = draft.genres.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(genre)}
              disabled={!selected && atMax}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-all duration-150",
                selected
                  ? "border-accent bg-accent/[0.12] text-accent"
                  : "border-line text-muted hover:border-line-strong hover:text-foreground",
                !selected && atMax && "cursor-not-allowed opacity-40 hover:border-line hover:text-muted",
              )}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-faint">
        <span className="tnum">
          {draft.genres.length}/{MAX_GENRES}
        </span>{" "}
        selected{atMax ? " · max reached" : ""}
      </p>
    </div>
  );
}
