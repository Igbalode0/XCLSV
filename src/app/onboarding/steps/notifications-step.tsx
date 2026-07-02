"use client";

import { Switch } from "@/components/ui/switch";
import { NOTIFICATION_OPTIONS } from "../constants";
import type { NotificationPrefs, OnboardingDraft } from "../types";

interface Props {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
}

/** Step 6 — notification opt-ins, scoped to the chosen intent, plus the email
 * channel. Sensible defaults are pre-set; this is just confirmation. */
export function NotificationsStep({ draft, update }: Props) {
  const { intent } = draft;

  const visible = NOTIFICATION_OPTIONS.filter(
    (option) =>
      option.audience === "all" ||
      intent === "BOTH" ||
      (intent === "RELEASE" && option.audience === "artist") ||
      (intent === "DISCOVER" && option.audience === "fan"),
  );

  function setPref(key: keyof NotificationPrefs, value: boolean) {
    update({ notifications: { ...draft.notifications, [key]: value } });
  }

  return (
    <div className="grid gap-1">
      {visible.map((option) => (
        <PrefRow
          key={option.key}
          id={`notif-${option.key}`}
          label={option.label}
          description={option.description}
          checked={draft.notifications[option.key]}
          onChange={(v) => setPref(option.key, v)}
        />
      ))}

      <div className="my-2 h-px bg-line" />

      <PrefRow
        id="notif-email"
        label="Email me too"
        description="Also deliver these to your inbox, not just in-app."
        checked={draft.notifications.email}
        onChange={(v) => setPref("email", v)}
      />
    </div>
  );
}

interface PrefRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

function PrefRow({ id, label, description, checked, onChange }: PrefRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md px-1 py-2.5">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm text-foreground">
          {label}
        </p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={`${id}-label`}
      />
    </div>
  );
}
