import { AppShell } from "@/components/shell/app-shell";
import {
  RoomExperience,
  type RoomData,
} from "@/components/fan/room-experience";

/** DEV PREVIEW — the private listening room with mock data (see ../page.tsx). */

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

const MOCK: RoomData = {
  artist: {
    name: "Kenzo",
    handle: "kenzo",
    verified: true,
    avatarUrl: null,
    genres: ["R&B", "Soul", "Alternative"],
  },
  stats: { tracks: 4, upcoming: 2, listens: 23, feedback: 7 },
  tracks: [
    { id: "t1", title: "Let You Go", genre: "R&B", durationMs: 178_000, plays: 46, comments: 12, addedAt: daysAgo(2) },
    { id: "t2", title: "Midnight Drive", genre: "Alt R&B", durationMs: 200_000, plays: 31, comments: 8, addedAt: daysAgo(9) },
    { id: "t3", title: "Cold Water (No Autotune)", genre: "Soul", durationMs: 218_000, plays: 19, comments: 5, addedAt: daysAgo(16) },
    { id: "t4", title: "Afterglow", genre: "R&B", durationMs: 185_000, plays: 12, comments: 2, addedAt: daysAgo(31) },
  ],
  upcoming: [
    { id: "u1", title: "Different Now", genre: "R&B", releaseDate: daysAhead(6) },
    { id: "u2", title: "No Signal", genre: "Alt R&B", releaseDate: daysAhead(19) },
  ],
};

export default function PreviewRoom() {
  return (
    <AppShell user={{ displayName: "Avery", avatarUrl: null }} accessLabel="Kenzo’s room">
      <RoomExperience data={MOCK} listenerName="Avery" />
    </AppShell>
  );
}
