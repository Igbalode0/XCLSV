import "server-only";
import { db } from "@/lib/db";
import { AGREEMENT_VERSION } from "@/lib/agreement";

/**
 * Server side of the listener agreement gate. Acceptance is stored one row
 * per user per version, so publishing a new AGREEMENT_VERSION automatically
 * re-gates every listener. `User.termsAcceptedAt` is kept as a convenience
 * mirror of the latest acceptance.
 */

export async function hasAcceptedCurrentAgreement(
  userId: string,
): Promise<boolean> {
  const row = await db.agreementAcceptance.findUnique({
    where: { userId_version: { userId, version: AGREEMENT_VERSION } },
    select: { id: true },
  });
  return Boolean(row);
}

export async function recordAgreementAcceptance(
  userId: string,
  ipAddress: string | null,
): Promise<void> {
  const now = new Date();
  await db.$transaction([
    db.agreementAcceptance.upsert({
      where: { userId_version: { userId, version: AGREEMENT_VERSION } },
      update: {},
      create: { userId, version: AGREEMENT_VERSION, ipAddress },
    }),
    db.user.update({
      where: { id: userId },
      data: { termsAcceptedAt: now },
    }),
  ]);
}
