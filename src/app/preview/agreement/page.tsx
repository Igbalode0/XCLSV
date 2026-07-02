import { AgreementView } from "@/app/agreement/agreement-view";

/**
 * DEV PREVIEW — the mandatory Exclusive Listening Agreement gate (see
 * ../page.tsx). Both buttons route back to the preview index instead of
 * touching the account.
 */
export default function PreviewAgreement() {
  return <AgreementView preview />;
}
