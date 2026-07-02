import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { hasAcceptedCurrentAgreement } from "@/server/agreement";

/**
 * The canonical "who is acting" context. Every protected screen reads identity
 * through this one function, so future capabilities — Organizations, Manager /
 * Label / Producer roles, Team Members — extend the SHAPE here (e.g. add
 * `organizations` + `activeOrgId`) without rewriting any caller.
 */
export interface SessionContext {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  isArtist: boolean;
  isFan: boolean;
  onboarded: boolean;
  /**
   * Invited Access: the artists whose rooms this listener may enter (union
   * of unrevoked RoomAccess). Empty means no fan access yet, or artist-only.
   */
  invitedArtistIds: string[];
  /** Whether the CURRENT Exclusive Listening Agreement version is accepted. */
  agreementAccepted: boolean;
  // Phase 10 will add: organizations, activeOrgId, orgRole.
}

export async function getSessionContext(): Promise<SessionContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    userId: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    isArtist: Boolean(user.artist),
    isFan: Boolean(user.fan),
    onboarded: Boolean(user.onboardedAt),
    invitedArtistIds: user.fan?.rooms.map((r) => r.artistId) ?? [],
    agreementAccepted: user.fan
      ? await hasAcceptedCurrentAgreement(user.id)
      : true, // the listener agreement only applies once fan access exists
  };
}

/** Where a fully-onboarded user should land, based on their profiles. */
export function homePathFor(ctx: SessionContext): string {
  if (ctx.isArtist) return "/studio"; // artist workspace (Phase 4)
  if (ctx.isFan) return "/listen"; // fan experience (Phase 7)
  return "/onboarding"; // onboarded but no profile — shouldn't happen; recover
}
