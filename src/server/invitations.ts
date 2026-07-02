import "server-only";
import { db } from "@/lib/db";

/**
 * Invited Access — the only door into the fan side of XCLSV.
 *
 * An artist's invitation token is the credential. Redeeming it provisions the
 * FanProfile (if needed) and opens that artist's room via a RoomAccess row.
 * A listener's dashboard is the union of their unrevoked rooms: Artist A
 * invites you, you see Artist A; Artist B later invites you too, you see both.
 * Never anything you weren't invited to — there is no public discovery.
 *
 * The Exclusive Listening Agreement is a separate, mandatory gate
 * (`/agreement`) checked before any room or audio is reachable.
 */

/** Carries a pending invite token across the Clerk sign-up round-trip. */
export const INVITE_COOKIE = "xclsv_invite";
export const INVITE_COOKIE_MAX_AGE = 60 * 30; // sign-up should take minutes, not days

export interface InviteArtist {
  name: string;
  handle: string;
  verified: boolean;
  avatarUrl: string | null;
}

/** What the public invite landing page needs to render each state. */
export type InviteLookup =
  | { state: "valid"; artist: InviteArtist; invitedEmail: string }
  | { state: "expired"; artist: InviteArtist }
  | { state: "claimed"; artist: InviteArtist }
  | { state: "invalid" };

export async function getInvitation(token: string): Promise<InviteLookup> {
  const invitation = await db.invitation.findUnique({
    where: { token },
    include: {
      artist: {
        include: { user: { select: { displayName: true, avatarUrl: true } } },
      },
    },
  });
  if (!invitation) return { state: "invalid" };

  const artist: InviteArtist = {
    name: invitation.artist.user.displayName,
    handle: invitation.artist.handle,
    verified: invitation.artist.verified,
    avatarUrl: invitation.artist.user.avatarUrl,
  };

  if (invitation.acceptedAt) return { state: "claimed", artist };
  if (invitation.expiresAt < new Date()) return { state: "expired", artist };
  return { state: "valid", artist, invitedEmail: invitation.email };
}

export type RedeemFailure = "invalid" | "expired" | "claimed";

export type RedeemResult =
  | { ok: true }
  | { ok: false; reason: RedeemFailure };

/**
 * Atomically redeem an invitation for a signed-in user: provision their
 * FanProfile, open (or re-open) the inviting artist's room, join the
 * invitation's group if it names one, and mark the invitation used.
 * Idempotent for the fan who already redeemed this token; single-use for
 * everyone else. A fresh invitation from an artist who previously revoked
 * access re-opens the room.
 */
export async function redeemInvitation(
  userId: string,
  rawToken: string,
): Promise<RedeemResult> {
  const token = rawToken.trim();
  if (!token) return { ok: false, reason: "invalid" };

  const [user, invitation] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: { fan: true, artist: true },
    }),
    db.invitation.findUnique({ where: { token } }),
  ]);
  if (!user || !invitation) return { ok: false, reason: "invalid" };

  const alreadyRedeemedByThisFan =
    invitation.fanId !== null && invitation.fanId === user.fan?.id;
  if (invitation.acceptedAt && !alreadyRedeemedByThisFan) {
    return { ok: false, reason: "claimed" };
  }
  if (!invitation.acceptedAt && invitation.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  await db.$transaction(async (tx) => {
    const fan =
      user.fan ??
      (await tx.fanProfile.create({ data: { userId: user.id } }));

    // Open the artist's room — or re-open it if it was revoked and the
    // artist chose to invite this listener again.
    await tx.roomAccess.upsert({
      where: { fanId_artistId: { fanId: fan.id, artistId: invitation.artistId } },
      update: { revokedAt: null, invitationId: invitation.id },
      create: {
        fanId: fan.id,
        artistId: invitation.artistId,
        invitationId: invitation.id,
      },
    });

    if (invitation.groupId) {
      await tx.groupMembership.upsert({
        where: { groupId_fanId: { groupId: invitation.groupId, fanId: fan.id } },
        update: {},
        create: { groupId: invitation.groupId, fanId: fan.id },
      });
    }

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: invitation.acceptedAt ?? new Date(), fanId: fan.id },
    });

    // Redeeming IS the fan's onboarding — the wizard is skipped. The
    // listening agreement is gated separately at /agreement.
    await tx.user.update({
      where: { id: user.id },
      data: {
        intent: user.artist ? "BOTH" : "DISCOVER",
        onboardedAt: user.onboardedAt ?? new Date(),
      },
    });
  });

  return { ok: true };
}
