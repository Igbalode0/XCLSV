 "use client";

import { Input } from "@/components/ui/input";
import { SOCIAL_PLATFORMS } from "../constants";
import type { OnboardingDraft } from "../types";

interface Props {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}

/** Step 5 — optional public links. All fields skippable. */
export function SocialsStep({ draft, update }: Props) {
  return (
    <div className="grid gap-3">
      {SOCIAL_PLATFORMS.map((platform) => (
        <div key={platform.key}>
          <label htmlFor={`social-${platform.key}`} className="text-xs text-muted">
            {platform.label}
          </label>
          <div className="mt-1">
            <Input
              id={`social-${platform.key}`}
              value={draft.socials[platform.key] ?? ""}
              onChange={(e) =>
                update({ socials: { ...draft.socials, [platform.key]: e.target.value } })
              }
              prefix={platform.prefix}
              placeholder={platform.placeholder}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
