import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasAcceptedCurrentAgreement } from "@/server/agreement";
import { AgreementView } from "./agreement-view";

/**
 * The mandatory listener gate. Every path into the fan experience funnels
 * through here until the CURRENT agreement version is accepted — `/continue`
 * and `/listen` both redirect to this page, so it cannot be skipped by
 * navigating directly. Artists without listener access never see it.
 */
export default async function AgreementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (await hasAcceptedCurrentAgreement(user.id)) redirect("/listen");

  return <AgreementView />;
}
