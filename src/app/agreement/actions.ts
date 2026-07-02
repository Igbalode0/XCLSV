"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { recordAgreementAcceptance } from "@/server/agreement";
import { INVITE_COOKIE } from "@/server/invitations";

export interface AgreementActionState {
  error: string;
}

/**
 * Accept the current agreement version: store user id + version + timestamp +
 * IP (where the proxy provides one), then open the rooms.
 */
export async function acceptAgreement(): Promise<AgreementActionState | void> {
  const user = await requireUser();

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ipAddress =
    forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;

  try {
    await recordAgreementAcceptance(user.id, ipAddress);
  } catch {
    return { error: "We couldn't record your acceptance — please try again." };
  }
  redirect("/listen");
}

/**
 * Declining revokes the pending invitation session server-side (the parked
 * invite token, if any); the client then signs the user out of Clerk and
 * returns them to the landing page. Nothing is stored — they can accept a
 * fresh invitation later.
 */
export async function declineAgreement(): Promise<void> {
  await requireUser(); // only meaningful for a signed-in listener
  (await cookies()).delete(INVITE_COOKIE);
}
