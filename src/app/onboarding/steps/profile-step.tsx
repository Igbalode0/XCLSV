"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { EqBars } from "@/components/ui/eq-bars";
import { uploadAvatar } from "../actions";
import type { OnboardingDraft } from "../types";
import { CameraIcon } from "../icons";

interface Props {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}

/** Step 3 — optional photo (uploaded via the trusted server action) plus an
 * editable display name, pre-filled from the Clerk identity. */
export function ProfileStep({ draft, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { url } = await uploadAvatar(formData);
      update({ avatarUrl: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const initial = draft.displayName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="group relative h-28 w-28 overflow-hidden rounded-full border border-line-strong bg-elevated"
        aria-label="Upload a profile photo"
      >
        {draft.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={draft.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center font-display text-3xl text-muted">
            {initial}
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-canvas/60 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? <EqBars /> : <CameraIcon className="h-6 w-6 text-foreground" />}
        </span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />

      <div className="w-full">
        <label htmlFor="displayName" className="text-sm text-muted">
          Display name
        </label>
        <div className="mt-1.5">
          <Input
            id="displayName"
            value={draft.displayName}
            onChange={(e) => update({ displayName: e.target.value })}
            placeholder="Your name"
            maxLength={50}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-accent transition-colors hover:text-accent-hi"
        >
          {draft.avatarUrl ? "Change photo" : "Upload photo"}
        </button>
        {error ? (
          <span className="text-signal-bad">{error}</span>
        ) : (
          <span className="text-faint">JPG or PNG · under 4MB</span>
        )}
      </div>
    </div>
  );
}
