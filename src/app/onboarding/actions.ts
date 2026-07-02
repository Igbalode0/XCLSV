"use server";

import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  RESERVED_USERNAMES,
  USERNAME_PATTERN,
  normalizeUsername,
} from "./constants";
import type {
  OnboardingDraft,
  SocialLinks,
  UsernameAvailability,
} from "./types";

const AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET ?? "avatars";
const MAX_AVATAR_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * Server-authoritative username check. The same rules run again at commit, so
 * this is purely for live UX — never the security boundary.
 */
export async function checkUsername(
  raw: string,
): Promise<UsernameAvailability> {
  const user = await requireUser();
  const username = normalizeUsername(raw);

  if (!USERNAME_PATTERN.test(username)) {
    return {
      status: "invalid",
      message: "3–20 characters — letters, numbers and underscores only.",
    };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { status: "taken", message: "That handle is reserved." };
  }
  return (await isHandleFree(username, user.id))
    ? { status: "available" }
    : { status: "taken", message: "That handle is already taken." };
}

/**
 * Persist partial wizard state so a refresh resumes where the user left off.
 * Best-effort: a failed draft save must never block the user from continuing,
 * so callers fire-and-forget and we simply swallow transient errors here.
 */
export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  const user = await requireUser();
  await db.user.update({
    where: { id: user.id },
    data: { onboardingDraft: draft as unknown as Prisma.InputJsonValue },
  });
}

/**
 * Upload the user's own avatar to a PUBLIC bucket via the service-role client
 * (a trusted write of their own data). Returns the public URL. Optional in the
 * flow — the UI keeps the existing photo and lets the user skip on failure.
 */
export async function uploadAvatar(
  formData: FormData,
): Promise<{ url: string }> {
  const user = await requireUser();
  const file = formData.get("file");

  if (!(file instanceof File)) throw new Error("No image was provided.");
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_AVATAR_BYTES) throw new Error("Image must be under 4MB.");

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (error) throw new Error("Upload failed — you can skip this for now.");

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}

/**
 * Commit onboarding: set identity fields, provision the chosen profile(s), and
 * clear the draft — atomically. Mirrors the intent → capability rule: the
 * intent decides which profiles exist, and the universal username seeds the
 * artist's public handle. Returns where the now-onboarded user should land.
 */
export async function completeOnboarding(
  draft: OnboardingDraft,
): Promise<{ redirectTo: string }> {
  const user = await requireUser();

  const username = normalizeUsername(draft.username);
  if (!USERNAME_PATTERN.test(username) || RESERVED_USERNAMES.has(username)) {
    throw new Error("Please choose a valid handle.");
  }
  if (!draft.intent) {
    throw new Error("Choose how you'll use XCLSV.");
  }
  if (!(await isHandleFree(username, user.id))) {
    throw new Error("That handle was just taken — please pick another.");
  }

  const wantsArtist = draft.intent === "RELEASE" || draft.intent === "BOTH";
  const wantsFan = draft.intent === "DISCOVER" || draft.intent === "BOTH";
  const displayName = draft.displayName.trim() || user.displayName;
  const socials = cleanSocials(draft.socials);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        username,
        displayName,
        avatarUrl: draft.avatarUrl ?? user.avatarUrl,
        intent: draft.intent!,
        genres: draft.genres.slice(0, 12),
        socials:
          Object.keys(socials).length > 0
            ? (socials as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        notificationPrefs: draft.notifications as unknown as Prisma.InputJsonValue,
        onboardedAt: new Date(),
        onboardingDraft: Prisma.DbNull,
      },
    });

    if (wantsArtist) {
      // Idempotent: re-running onboarding must not throw on an existing profile.
      await tx.artistProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id, handle: username },
      });
    }
    if (wantsFan) {
      await tx.fanProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
      });
    }
  });

  // Mirrors homePathFor: artists land in the studio, pure fans in the listen room.
  return { redirectTo: wantsArtist ? "/studio" : "/listen" };
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** A handle is free if no other user owns it AND no other artist uses it. */
async function isHandleFree(username: string, selfId: string): Promise<boolean> {
  const [userClash, handleClash] = await Promise.all([
    db.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" }, NOT: { id: selfId } },
      select: { id: true },
    }),
    db.artistProfile.findFirst({
      where: { handle: { equals: username, mode: "insensitive" }, NOT: { userId: selfId } },
      select: { id: true },
    }),
  ]);
  return !userClash && !handleClash;
}

/** Trim values and drop empty links so we never persist blank strings. */
function cleanSocials(socials: SocialLinks): SocialLinks {
  const out: SocialLinks = {};
  for (const [key, value] of Object.entries(socials)) {
    const trimmed = value?.trim();
    if (trimmed) out[key as keyof SocialLinks] = trimmed;
  }
  return out;
}
