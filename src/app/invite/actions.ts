"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/auth";
import { hasAcceptedCurrentAgreement } from "@/server/agreement";
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  redeemInvitation,
  type RedeemFailure,
} from "@/server/invitations";

export interface InviteActionState {
  error: string;
}

const REDEEM_ERRORS: Record<RedeemFailure, string> = {
  invalid: "That invitation isn't recognised — check the code and try again.",
  expired: "This invitation has expired. Ask the artist to send a fresh one.",
  claimed: "This invitation has already been used.",
};

/**
 * The moment the terms are accepted on the invite landing page. Signed-in
 * users are bound to the artist immediately; everyone else gets the token
 * parked in a short-lived cookie and completes sign-up — `/continue` finishes
 * the redemption so they land straight in the artist's room.
 */
export async function acceptInvite(
  token: string,
): Promise<InviteActionState | void> {
  const { userId } = await auth();

  if (!userId) {
    (await cookies()).set(INVITE_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: INVITE_COOKIE_MAX_AGE,
    });
    redirect("/sign-up");
  }

  const user = await requireUser();
  const result = await redeemInvitation(user.id, token);
  if (!result.ok) return { error: REDEEM_ERRORS[result.reason] };
  // Server-action redirects must target PAGES, never the /continue route
  // handler (the router would keep POSTing to it → 405). Apply the same
  // agreement-gate rule here directly.
  redirect(await postRedeemDestination(user.id));
}

/**
 * For signed-in users who arrived without an invitation: paste the code or
 * the full invite link and unlock the artist's room in place.
 */
export async function redeemInviteCode(
  raw: string,
): Promise<InviteActionState | void> {
  const user = await requireUser();

  const token = extractToken(raw);
  if (!token) return { error: "Paste the invitation code or link the artist sent you." };

  const result = await redeemInvitation(user.id, token);
  if (!result.ok) return { error: REDEEM_ERRORS[result.reason] };
  redirect(await postRedeemDestination(user.id));
}

/** The room just opened — agreement gate first unless already signed. */
async function postRedeemDestination(userId: string): Promise<string> {
  return (await hasAcceptedCurrentAgreement(userId)) ? "/listen" : "/agreement";
}

/** Accepts a bare token or a full …/invite/<token> link. */
function extractToken(raw: string): string {
  const trimmed = raw.trim();
  const fromLink = trimmed.match(/\/invite\/([A-Za-z0-9_-]+)/);
  return (fromLink?.[1] ?? trimmed).trim();
}
