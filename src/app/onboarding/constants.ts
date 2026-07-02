/**
 * Onboarding constants + pure helpers. Shared by client step components, the
 * server actions, and the server page. Keep it free of server-only / React
 * imports so it is safe to import from anywhere.
 */
import type { IntentChoice, NotificationPrefs } from "./types";

/** Wizard step indices. Welcome + Complete bookend the six data steps. */
export const STEP = {
  WELCOME: 0,
  PURPOSE: 1,
  USERNAME: 2,
  PROFILE: 3,
  GENRES: 4,
  SOCIALS: 5,
  NOTIFICATIONS: 6,
  COMPLETE: 7,
} as const;

export type StepIndex = (typeof STEP)[keyof typeof STEP];

/** The six data-collection steps that the progress indicator tracks. */
export const FIRST_DATA_STEP = STEP.PURPOSE;
export const LAST_DATA_STEP = STEP.NOTIFICATIONS;
export const DATA_STEP_COUNT = LAST_DATA_STEP - FIRST_DATA_STEP + 1;

/** Header copy for the data steps (Welcome + Complete render their own). */
export const STEP_META: Record<number, { eyebrow: string; title: string; subtitle: string }> = {
  [STEP.PURPOSE]: {
    eyebrow: "Your intent",
    title: "What brings you to XCLSV?",
    subtitle: "This shapes your space. You can always add the other side later.",
  },
  [STEP.USERNAME]: {
    eyebrow: "Your identity",
    title: "Claim your handle",
    subtitle: "It's how you're known here — on every listen, comment, and release.",
  },
  [STEP.PROFILE]: {
    eyebrow: "Your face",
    title: "Add a photo",
    subtitle: "Optional, but a face makes the room feel real.",
  },
  [STEP.GENRES]: {
    eyebrow: "Your taste",
    title: "Pick your sound",
    subtitle: "Tune what you create — or what you discover.",
  },
  [STEP.SOCIALS]: {
    eyebrow: "Your links",
    title: "Connect your world",
    subtitle: "All optional. Add the places people already find you.",
  },
  [STEP.NOTIFICATIONS]: {
    eyebrow: "Your signal",
    title: "Stay in the loop",
    subtitle: "Only the moments that matter. Change these anytime in Settings.",
  },
};

export interface IntentOption {
  value: IntentChoice;
  title: string;
  description: string;
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    value: "RELEASE",
    title: "I'm here to release music",
    description: "Test unreleased tracks privately and read how they really land.",
  },
  {
    value: "DISCOVER",
    title: "I was invited by an artist",
    description:
      "Redeem an artist's invitation to hear their unreleased work and shape it with your feedback.",
  },
  {
    value: "BOTH",
    title: "I want to do both",
    description: "Release your own work and support the artists you believe in.",
  },
];

/** A curated, opinionated genre set. Order is intentional, not alphabetical. */
export const GENRES: string[] = [
  "Pop",
  "Hip-Hop",
  "R&B",
  "Afrobeats",
  "Amapiano",
  "Drill",
  "Trap",
  "House",
  "Techno",
  "Garage",
  "Drum & Bass",
  "Electronic",
  "Indie",
  "Rock",
  "Alternative",
  "Soul",
  "Funk",
  "Jazz",
  "Gospel",
  "Latin",
  "Reggaeton",
  "Dancehall",
  "K-Pop",
  "Country",
  "Lo-fi",
  "Ambient",
  "Classical",
  "Experimental",
];

export const MAX_GENRES = 8;

export interface SocialPlatform {
  key: keyof import("./types").SocialLinks;
  label: string;
  prefix: string; // shown inside the input as a hint
  placeholder: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "instagram", label: "Instagram", prefix: "instagram.com/", placeholder: "yourhandle" },
  { key: "spotify", label: "Spotify", prefix: "open.spotify.com/artist/", placeholder: "artist id or link" },
  { key: "tiktok", label: "TikTok", prefix: "tiktok.com/@", placeholder: "yourhandle" },
  { key: "youtube", label: "YouTube", prefix: "youtube.com/@", placeholder: "yourchannel" },
  { key: "x", label: "X", prefix: "x.com/", placeholder: "yourhandle" },
  { key: "website", label: "Website", prefix: "https://", placeholder: "yourdomain.com" },
];

export type NotificationAudience = "artist" | "fan" | "all";

export interface NotificationOption {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
  audience: NotificationAudience;
}

/** Category toggles, filtered by intent at render time. `email` is the channel. */
export const NOTIFICATION_OPTIONS: NotificationOption[] = [
  {
    key: "newFeedback",
    label: "New feedback",
    description: "When listeners rate or comment on your tracks.",
    audience: "artist",
  },
  {
    key: "newListener",
    label: "New listeners",
    description: "When someone new opens one of your private listens.",
    audience: "artist",
  },
  {
    key: "newSong",
    label: "New drops",
    description: "When an artist you follow releases something private.",
    audience: "fan",
  },
  {
    key: "releaseCountdown",
    label: "Release countdowns",
    description: "Reminders before a track goes public everywhere.",
    audience: "all",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "Occasional, low-volume news about XCLSV.",
    audience: "all",
  },
];

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  newFeedback: true,
  newListener: true,
  newSong: true,
  releaseCountdown: true,
  productUpdates: false,
  email: true,
};

// ── Username rules (shared by the live check and final commit) ───────────────

/** 3–20 chars, lowercase letters / numbers / underscore. */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

/** Handles that would collide with routes or impersonate the platform. */
export const RESERVED_USERNAMES = new Set<string>([
  "admin",
  "api",
  "app",
  "auth",
  "continue",
  "onboarding",
  "studio",
  "listen",
  "settings",
  "sign-in",
  "sign-up",
  "invite",
  "pricing",
  "faq",
  "support",
  "help",
  "about",
  "xclsv",
  "official",
  "root",
  "me",
  "you",
  "new",
]);

/** Lowercase + trim to the canonical handle form. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Strip a typed username down to allowed characters as the user types. */
export function sanitizeUsernameInput(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
}
