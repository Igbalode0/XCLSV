import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

/**
 * Resolve the current Clerk session into our User row, lazily provisioning it
 * on first sight so we never need a separate sync webhook for the basics.
 * Returns null when signed out.
 *
 * `artist` / `fan` are included so callers can branch on role without a second
 * query. A user may have neither (just signed up), one, or both.
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  // Fan rooms (unrevoked only) ride along so callers can scope the listener
  // experience without a second query.
  const include = {
    artist: true,
    fan: { include: { rooms: { where: { revokedAt: null } } } },
  } as const;

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
    include,
  });
  if (existing) return existing;

  const clerk = await currentUser();
  if (!clerk) return null;

  return db.user.create({
    data: {
      clerkId: userId,
      email: clerk.emailAddresses[0]?.emailAddress ?? "",
      displayName:
        clerk.firstName ||
        clerk.username ||
        clerk.emailAddresses[0]?.emailAddress ||
        "New member",
      avatarUrl: clerk.imageUrl,
    },
    include,
  });
}

/** Throwing variant for routes/actions that require an authenticated user. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
