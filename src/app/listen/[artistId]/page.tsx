import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasAcceptedCurrentAgreement } from "@/server/agreement";
import { loadRoom } from "@/server/rooms";
import { AppShell } from "@/components/shell/app-shell";
import { ArtistDashboard } from "@/components/fan/artist-dashboard";
import { ChevronLeft } from "@/components/shell/icons";

/**
 * One artist's room. Only reachable with an unrevoked RoomAccess row for
 * this artist — anything else bounces back to the listener home. Same
 * agreement gate as /listen: no acceptance, no room.
 */
export default async function RoomPage({
  params,
}: {
  params: Promise<{ artistId: string }>;
}) {
  const { artistId } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.fan) redirect("/listen");

  const rooms = user.fan.rooms;
  if (!rooms.some((room) => room.artistId === artistId)) redirect("/listen");

  if (!(await hasAcceptedCurrentAgreement(user.id))) redirect("/agreement");

  const data = await loadRoom(artistId, user.fan.id);

  return (
    <AppShell
      user={{ displayName: user.displayName, avatarUrl: user.avatarUrl }}
      accessLabel={`${data.artist.name}’s room`}
    >
      {rooms.length > 1 ? (
        <div className="mx-auto max-w-6xl pb-4">
          <Link
            href="/listen"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> All rooms
          </Link>
        </div>
      ) : null}
      <ArtistDashboard data={data} listenerName={user.displayName} />
    </AppShell>
  );
}
