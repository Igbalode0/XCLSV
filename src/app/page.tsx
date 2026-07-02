import { redirect } from "next/navigation";

/**
 * Bare-root entry. There's no marketing landing yet (Phase 1 territory), so we
 * send visitors to the public sign-in. Clerk bounces already-signed-in users
 * onward to `/continue` (the post-auth gate) via its fallback redirect, so this
 * one hop handles both states. Replace with the real landing when marketing lands.
 */
export default function RootPage() {
  redirect("/sign-in");
}
