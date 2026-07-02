import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getSessionContext,
  homePathFor,
  type SessionContext,
} from "@/server/session";
import { INVITE_COOKIE, redeemInvitation } from "@/server/invitations";

/**
 * The post-authentication chokepoint. Clerk redirects here after sign-in /
 * sign-up; we resolve the user (provisioning the base row on first sight) and
 * send them to onboarding or their home. Keeping this in ONE place means the
 * routing rule never drifts across entry points.
 *
 * Invited Access: a pending invite token (parked in a short-lived cookie
 * before sign-up) is redeemed here, opening the inviting artist's room. The
 * cookie is single-shot: consumed on every outcome.
 *
 * Listener gate: nobody reaches /listen through here without having accepted
 * the CURRENT Exclusive Listening Agreement — they are routed to /agreement
 * first. (/listen enforces the same rule for direct navigation.)
 */
export async function GET(request: Request) {
  try {
    const ctx = await getSessionContext();

    if (!ctx) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const pendingInvite = (await cookies()).get(INVITE_COOKIE)?.value;
    if (pendingInvite) {
      const result = await redeemInvitation(ctx.userId, pendingInvite);
      // They just accepted an invitation, so the room (behind the agreement
      // gate) is the destination — even for accounts that are also artists.
      // Redemption may have just provisioned fan access, so re-resolve.
      const fresh = result.ok ? await getSessionContext() : null;
      const destination = fresh
        ? fresh.agreementAccepted
          ? "/listen"
          : "/agreement"
        : destinationFor(ctx);
      const response = NextResponse.redirect(new URL(destination, request.url));
      response.cookies.delete(INVITE_COOKIE);
      return response;
    }

    return NextResponse.redirect(new URL(destinationFor(ctx), request.url));
  } catch {
    // Backing services (usually the database) unreachable — show the branded
    // outage screen instead of a bare 500. The session itself is intact.
    return NextResponse.redirect(new URL("/unavailable", request.url));
  }
}

function destinationFor(ctx: SessionContext): string {
  if (!ctx.onboarded) return "/onboarding";
  const home = homePathFor(ctx);
  // Listeners must pass the agreement gate before any room opens.
  if (home === "/listen" && !ctx.agreementAccepted) return "/agreement";
  return home;
}

// Defensive: if the client router ends up POSTing here (e.g. a server action
// fired while the address bar shows /continue), route it exactly like GET
// instead of returning 405 and stranding the user.
export { GET as POST };
