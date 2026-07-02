/**
 * Onboarding wizard contracts. Pure types only — this module is imported by
 * both client step components and server actions, so it must stay free of any
 * server-only or React imports.
 */

export type IntentChoice = "RELEASE" | "DISCOVER" | "BOTH";

export interface SocialLinks {
  instagram?: string;
  spotify?: string;
  tiktok?: string;
  youtube?: string;
  x?: string;
  website?: string;
}

export interface NotificationPrefs {
  newFeedback: boolean; // artist: ratings + comments land
  newListener: boolean; // artist: someone new opens a private listen
  newSong: boolean; // fan: a followed artist drops something private
  releaseCountdown: boolean; // everyone: a track is about to go public
  productUpdates: boolean; // everyone: occasional XCLSV news
  email: boolean; // channel: also deliver as email
}

/**
 * The full working state of the wizard. Persisted to `User.onboardingDraft` as
 * the user advances so a refresh resumes exactly where they left off, and sent
 * whole to `completeOnboarding` at the end.
 */
export interface OnboardingDraft {
  step: number;
  intent: IntentChoice | null;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  genres: string[];
  socials: SocialLinks;
  notifications: NotificationPrefs;
}

/** Result of a live username availability check (server-authoritative). */
export type UsernameAvailability =
  | { status: "available" }
  | { status: "taken"; message: string }
  | { status: "invalid"; message: string };

/** Client-only username field states, supersetting the server result. */
export type UsernameStatus =
  | { status: "idle" }
  | { status: "checking" }
  | UsernameAvailability;
