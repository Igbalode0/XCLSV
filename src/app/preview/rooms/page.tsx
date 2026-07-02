import { AppShell } from "@/components/shell/app-shell";
import { RoomsOverview } from "@/components/fan/rooms-overview";
import type { RoomSummary } from "@/server/rooms";

/** DEV PREVIEW — the multi-room home with mock data (see ../page.tsx). */

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const ROOMS: RoomSummary[] = [
  {
    artistId: "demo-kenzo",
    name: "Kenzo",
    handle: "kenzo",
    verified: true,
    avatarUrl: null,
    genres: ["R&B", "Soul"],
    trackCount: 4,
    upcomingCount: 2,
    grantedAt: daysAgo(31),
  },
  {
    artistId: "demo-luna",
    name: "Luna Rae",
    handle: "lunarae",
    verified: false,
    avatarUrl: null,
    genres: ["Pop", "Alternative"],
    trackCount: 2,
    upcomingCount: 1,
    grantedAt: daysAgo(3),
  },
];

export default function PreviewRooms() {
  return (
    <AppShell
      user={{ displayName: "Avery", avatarUrl: null }}
      accessLabel="2 private rooms"
    >
      <RoomsOverview rooms={ROOMS} listenerName="Avery" />
    </AppShell>
  );
}
