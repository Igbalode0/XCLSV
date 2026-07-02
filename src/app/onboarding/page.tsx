import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingFlow } from "./onboarding-flow";
import { DEFAULT_NOTIFICATIONS, STEP } from "./constants";
import type { IntentChoice, OnboardingDraft } from "./types";

/**
 * Phase 3 — Onboarding. The post-auth gate (`/continue`) sends un-onboarded
 * users here. We resolve the user (lazily provisioned in getCurrentUser),
 * bounce anyone already onboarded to their home, then hydrate the wizard with
 * any saved draft so a refresh resumes exactly where they left off.
 */
export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.onboardedAt) redirect(user.artist ? "/studio" : "/listen");

  const initialDraft = buildInitialDraft(user);
  return <OnboardingFlow initialDraft={initialDraft} />;
}

/** Merge any persisted draft over defaults derived from the user's identity. */
function buildInitialDraft(user: {
  intent: string | null;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  genres: string[];
  onboardingDraft: unknown;
}): OnboardingDraft {
  const defaults: OnboardingDraft = {
    step: STEP.WELCOME,
    intent: (user.intent as IntentChoice | null) ?? null,
    username: user.username ?? "",
    displayName: user.displayName ?? "",
    avatarUrl: user.avatarUrl ?? null,
    genres: user.genres ?? [],
    socials: {},
    notifications: DEFAULT_NOTIFICATIONS,
  };

  const saved =
    user.onboardingDraft && typeof user.onboardingDraft === "object"
      ? (user.onboardingDraft as Partial<OnboardingDraft>)
      : null;

  return saved ? { ...defaults, ...saved } : defaults;
}
