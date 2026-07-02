import { InviteRequired } from "@/components/fan/invite-required";

/** DEV PREVIEW — the locked "no invitation yet" state (see ../page.tsx). */
export default function PreviewLocked() {
  return <InviteRequired displayName="Avery" />;
}
