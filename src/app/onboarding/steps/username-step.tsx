"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { EqBars } from "@/components/ui/eq-bars";
import { sanitizeUsernameInput } from "../constants";
import { checkUsername } from "../actions";
import type { OnboardingDraft, UsernameStatus } from "../types";
import { CheckIcon, CloseIcon } from "../icons";
import { cn } from "@/lib/utils";

interface Props {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  status: UsernameStatus;
  onStatus: (status: UsernameStatus) => void;
}

/** Step 2 — claim a universal handle with a debounced, server-checked
 * availability indicator. The same handle seeds the artist's public page. */
export function UsernameStep({ draft, update, status, onStatus }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const value = draft.username;
    if (!value) {
      onStatus({ status: "idle" });
      return;
    }
    onStatus({ status: "checking" });
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        onStatus(await checkUsername(value));
      } catch {
        onStatus({ status: "invalid", message: "Couldn't check that handle — try again." });
      }
    }, 400);
    return () => clearTimeout(timer.current);
  }, [draft.username, onStatus]);

  const invalid = status.status === "taken" || status.status === "invalid";

  return (
    <div>
      <Input
        value={draft.username}
        onChange={(e) => update({ username: sanitizeUsernameInput(e.target.value) })}
        prefix="@"
        placeholder="yourhandle"
        invalid={invalid}
        autoFocus
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Username"
        suffix={<StatusIcon status={status} />}
      />
      <StatusLine status={status} username={draft.username} />
    </div>
  );
}

function StatusIcon({ status }: { status: UsernameStatus }) {
  switch (status.status) {
    case "checking":
      return <EqBars className="h-3.5" bars={3} />;
    case "available":
      return <CheckIcon className="h-4 w-4 text-signal-good" />;
    case "taken":
    case "invalid":
      return <CloseIcon className="h-4 w-4 text-signal-bad" />;
    default:
      return null;
  }
}

function StatusLine({ status, username }: { status: UsernameStatus; username: string }) {
  if (status.status === "available") {
    return (
      <p className="mt-2 text-xs text-signal-good">
        <span className="tnum">@{username}</span> is yours — your page lives at{" "}
        <span className="text-faint">xclsv.app/@{username}</span>
      </p>
    );
  }
  if (status.status === "taken" || status.status === "invalid") {
    return <p className="mt-2 text-xs text-signal-bad">{status.message}</p>;
  }
  return (
    <p className={cn("mt-2 text-xs text-faint")}>
      Lowercase letters, numbers and underscores. This is how you&apos;re known on XCLSV.
    </p>
  );
}
