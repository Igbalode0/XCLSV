import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasAcceptedCurrentAgreement } from "@/server/agreement";
import { listRooms, loadRoom } from "@/server/rooms";
import { AppShell } from "@/components/shell/app-shell";
import { ArtistDashboard } from "@/components/fan/artist-dashboard";
import { RoomsOverview } from "@/components/fan/rooms-overview";
import { InviteRequired } from "@/components/fan/invite-required";

/**
 * The listener home. What it shows is EXACTLY the artists who invited this
 * listener — one room renders directly, several render as a room list — and
 * nothing else: no discovery, no directory, no other listeners.
 *
 * Order of gates: signed in → fan access exists → CURRENT agreement accepted.
 * The agreement gate cannot be skipped by navigating here directly.
 */
export default async function ListenPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  if (!user.fan) {
    if (user.artist) redirect("/studio"); // artist-only account
    if (!user.onboardedAt) redirect("/onboarding");
    // Onboarded without fan access — recover via invitation.
    return <InviteRequired displayName={user.displayName} />;
  }

  const rooms = user.fan.rooms; // unrevoked only (filtered in getCurrentUser)
  if (rooms.length === 0) {
    return <InviteRequired displayName={user.displayName} />;
  }

  if (!(await hasAcceptedCurrentAgreement(user.id))) redirect("/agreement");

  const shellUser = { displayName: user.displayName, avatarUrl: user.avatarUrl };

  if (rooms.length === 1) {
    const data = await loadRoom(rooms[0]!.artistId, user.fan.id);
    return (
      <AppShell user={shellUser} accessLabel={`${data.artist.name}’s room`}>
        <ArtistDashboard data={data} listenerName={user.displayName} />
      </AppShell>
    );
  }

  const summaries = await listRooms(user.fan.id);
  return (
    <AppShell user={shellUser} accessLabel={`${summaries.length} private rooms`}>
      <RoomsOverview rooms={summaries} listenerName={user.displayName} />
    </AppShell>
  );
}
