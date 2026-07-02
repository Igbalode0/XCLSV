"use client";

import { INTENT_OPTIONS } from "../constants";
import type { OnboardingDraft } from "../types";
import { CheckIcon } from "../icons";
import { cn } from "@/lib/utils";

interface Props {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}

/** Step 1 — intent decides which profiles get provisioned (not identity). */
export function PurposeStep({ draft, update }: Props) {
  return (
    <div className="grid gap-3" role="radiogroup" aria-label="How you'll use XCLSV">
      {INTENT_OPTIONS.map((option) => {
        const selected = draft.intent === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => update({ intent: option.value })}
            className={cn(
              "rounded-lg border p-4 text-left transition-all duration-200",
              selected
                ? "border-accent bg-accent/[0.07] shadow-glow"
                : "border-line bg-overlay hover:border-line-strong hover:bg-overlay-strong",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-base text-foreground">{option.title}</p>
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                  selected
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line-strong text-transparent",
                )}
              >
                <CheckIcon className="h-3 w-3" />
              </span>
            </div>
            <p className="mt-1.5 text-sm text-muted">{option.description}</p>
          </button>
        );
      })}
    </div>
  );
}
