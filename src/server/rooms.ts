import "server-only";
import { db } from "@/lib/db";
import type { RoomData } from "@/components/fan/room-experience";

/**
 * Fan-side reads, always scoped to the listener's unrevoked RoomAccess rows.
 * There is deliberately no "all artists" query anywhere on the fan side.
 *
 * Track metadata is read server-side through Prisma, already scoped by the
 * session's room access; the audio itself only ever moves via short-TTL
 * signed URLs once playback is wired in Phase 6 (invariants 4 + 5).
 */

export interface RoomSummary {
  artistId: string;
  name: string;
  handle: string;
  verified: boolean;
  avatarUrl: string | null;
  genres: string[];
  trackCount: number;
  upcomingCount: number;
  grantedAt: string; // ISO
}

/** The artists who invited this listener — nothing else, ever. */
export async function listRooms(fanId: string): Promise<RoomSummary[]> {
  const accesses = await db.roomAccess.findMany({
    where: { fanId, revokedAt: null },
    orderBy: { grantedAt: "asc" },
    include: {
      artist: {
        include: {
          user: { select: { displayName: true, avatarUrl: true, genres: true } },
          songs: { select: { status: true } },
        },
      },
    },
  });

  return accesses.map((access) => ({
    artistId: access.artistId,
    name: access.artist.user.displayName,
    handle: access.artist.handle,
    verified: access.artist.verified,
    avatarUrl: access.artist.user.avatarUrl,
    genres: access.artist.user.genres.slice(0, 3),
    trackCount: access.artist.songs.filter((s) => s.status === "PRIVATE").length,
    upcomingCount: access.artist.songs.filter((s) => s.status === "SCHEDULED").length,
    grantedAt: access.grantedAt.toISOString(),
  }));
}

/** True while the listener's access to this artist's room is unrevoked. */
export async function hasRoomAccess(
  fanId: string,
  artistId: string,
): Promise<boolean> {
  const access = await db.roomAccess.findUnique({
    where: { fanId_artistId: { fanId, artistId } },
    select: { revokedAt: true },
  });
  return Boolean(access) && access!.revokedAt === null;
}

/**
 * Everything one room shows, in one scoped read. A song with no SongAccess
 * rows is shared with all of the artist's invited listeners; once grants
 * exist (Phase 5 groups), only matching listeners see it.
 */
export async function loadRoom(
  artistId: string,
  fanId: string,
): Promise<RoomData> {
  const [artist, songs, upcoming, listens, comments, ratings] =
    await Promise.all([
      db.artistProfile.findUniqueOrThrow({
        where: { id: artistId },
        include: {
          user: { select: { displayName: true, avatarUrl: true, genres: true } },
        },
      }),
      db.song.findMany({
        where: {
          artistId,
          status: "PRIVATE",
          OR: [
            { access: { none: {} } },
            { access: { some: { fanId } } },
            { access: { some: { group: { members: { some: { fanId } } } } } },
          ],
        },
        include: {
          versions: {
            where: { isPrimary: true },
            take: 1,
            select: { durationMs: true, _count: { select: { sessions: true } } },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.song.findMany({
        where: { artistId, status: "SCHEDULED" },
        select: { id: true, title: true, genre: true, releaseDate: true },
        orderBy: [{ releaseDate: "asc" }, { createdAt: "asc" }],
      }),
      db.listeningSession.count({
        where: { fanId, version: { song: { artistId } } },
      }),
      db.comment.count({ where: { fanId, song: { artistId } } }),
      db.rating.count({ where: { fanId, song: { artistId } } }),
    ]);

  return {
    artist: {
      name: artist.user.displayName,
      handle: artist.handle,
      verified: artist.verified,
      avatarUrl: artist.user.avatarUrl,
      genres: artist.user.genres.slice(0, 4),
    },
    stats: {
      tracks: songs.length,
      upcoming: upcoming.length,
      listens,
      feedback: comments + ratings,
    },
    tracks: songs.map((song) => ({
      id: song.id,
      title: song.title,
      genre: song.genre,
      durationMs: song.versions[0]?.durationMs ?? null,
      plays: song.versions[0]?._count.sessions ?? 0,
      comments: song._count.comments,
      addedAt: song.createdAt.toISOString(),
    })),
    upcoming: upcoming.map((song) => ({
      id: song.id,
      title: song.title,
      genre: song.genre,
      releaseDate: song.releaseDate?.toISOString() ?? null,
    })),
  };
}
