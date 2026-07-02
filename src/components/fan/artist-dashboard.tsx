"use client";

import { motion } from "framer-motion";
import { useGlobalPlayer } from "@/components/player/player-context";
import { Card, CardLabel, CardValue } from "@/components/ui/card";
import { EqBars } from "@/components/ui/eq-bars";
import { Badge } from "@/components/ui/badge";
import { PlayGlyph, VerifiedIcon } from "@/components/shell/icons";

/** Serializable props from the server page — dates travel as ISO strings. */
export interface DashboardData {
  artist: {
    name: string;
    handle: string;
    verified: boolean;
    avatarUrl: string | null;
    genres: string[];
  };
  stats: {
    tracks: number;
    upcoming: number;
    listens: number;
    feedback: number;
  };
  tracks: DashboardTrack[];
  upcoming: DashboardUpcoming[];
}

export interface DashboardTrack {
  id: string;
  title: string;
  genre: string | null;
  durationMs: number | null;
  plays: number;
  comments: number;
  addedAt: string;
}

export interface DashboardUpcoming {
  id: string;
  title: string;
  genre: string | null;
  releaseDate: string | null;
}

/**
 * The fan's entire XCLSV: one artist's private room. Hero states whose room
 * this is, stats stay personal-or-aggregate (never other listeners' identities),
 * then the shared catalog and what's coming next. Boldness is spent on the
 * hero; everything below is quiet glass.
 */
export function ArtistDashboard({
  data,
  listenerName,
}: {
  data: DashboardData;
  listenerName: string;
}) {
  const gp = useGlobalPlayer();
  const { artist, stats, tracks, upcoming } = data;

  const playTrack = (t: DashboardTrack) =>
    gp.play({ id: t.id, title: t.title, artist: artist.name });

  const firstName = listenerName.trim().split(/\s+/)[0] || listenerName;
  const latest = tracks[0];

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero — whose room you're in */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="glass grid gap-6 rounded-3xl border border-line p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-8 lg:grid-cols-[1.6fr_1fr]"
      >
        <div className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-overlay px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted">
            Your private access
          </span>

          <h1 className="mt-4 flex items-center gap-2.5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {artist.name}
            {artist.verified ? (
              <VerifiedIcon className="h-7 w-7 shrink-0 text-[rgb(var(--rp-rgb))]" />
            ) : null}
          </h1>
          <p className="tnum mt-1 text-muted">@{artist.handle}</p>

          <p className="mt-4 max-w-md text-muted">
            Welcome back, {firstName}. Everything in this room is unreleased —
            you&rsquo;re hearing it before the world does, and your listening
            shapes what it becomes.
          </p>

          {artist.genres.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {artist.genres.map((g) => (
                <Badge key={g} tone="neutral">
                  {g}
                </Badge>
              ))}
            </div>
          ) : null}

          {latest ? (
            <div className="mt-auto flex items-center gap-3 pt-6">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => playTrack(latest)}
                aria-label={`Play ${latest.title}`}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foreground text-canvas shadow-lg"
              >
                <PlayGlyph className="h-5 w-5 translate-x-0.5" />
              </motion.button>
              <div>
                <p className="text-xs uppercase tracking-wide text-faint">Latest drop</p>
                <p className="font-display text-lg tracking-tight">{latest.title}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div
          className="relative min-h-48 overflow-hidden rounded-2xl"
          style={{ backgroundImage: gradientFor(artist.handle) }}
        >
          {artist.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artist.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center">
              <EqBars bars={5} className="h-10 opacity-70" />
            </span>
          )}
        </div>
      </motion.section>

      {/* Stats — the fan's own signal, plus the size of the room */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardLabel>Tracks shared with you</CardLabel>
          <CardValue>{stats.tracks}</CardValue>
        </Card>
        <Card>
          <CardLabel>Upcoming releases</CardLabel>
          <CardValue>{stats.upcoming}</CardValue>
        </Card>
        <Card>
          <CardLabel>Your listens</CardLabel>
          <CardValue>{stats.listens}</CardValue>
        </Card>
        <Card>
          <CardLabel>Feedback you&rsquo;ve left</CardLabel>
          <CardValue>{stats.feedback}</CardValue>
        </Card>
      </div>

      {/* Shared catalog */}
      <section className="mt-8">
        <h2 className="px-1 font-display text-sm uppercase tracking-[0.2em] text-faint">
          Shared with you
        </h2>

        {tracks.length === 0 ? (
          <EmptyState
            title="Nothing in the room yet"
            body={`${artist.name} hasn't shared a track with you yet — you'll be among the first to hear it when they do.`}
          />
        ) : (
          <div className="glass mt-4 rounded-3xl border border-line p-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
            <div className="divide-y divide-line">
              {tracks.map((t) => (
                <TrackRow key={t.id} track={t} onPlay={() => playTrack(t)} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Upcoming */}
      <section className="mt-8">
        <h2 className="px-1 font-display text-sm uppercase tracking-[0.2em] text-faint">
          Up next from {artist.name}
        </h2>

        {upcoming.length === 0 ? (
          <EmptyState
            title="No scheduled releases"
            body="When a track gets a release date, the countdown appears here first."
          />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((u) => (
              <UpcomingCard key={u.id} release={u} />
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 pb-2 text-center text-xs text-faint">
        This room is private — only supporters {artist.name} invited can see it.
      </p>
    </div>
  );
}

function TrackRow({
  track,
  onPlay,
}: {
  track: DashboardTrack;
  onPlay: () => void;
}) {
  const gp = useGlobalPlayer();
  const isCurrent = gp.track?.id === track.id;

  return (
    <div className="group flex items-center gap-3.5 px-1.5 py-3">
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play ${track.title}`}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl"
        style={{ backgroundImage: gradientFor(track.id) }}
      >
        <span className="absolute inset-0 grid place-items-center bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <PlayGlyph className="h-4 w-4 translate-x-0.5" />
        </span>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {track.title}
          </span>
          {isCurrent && gp.isPlaying ? <EqBars className="h-3.5" /> : null}
        </div>
        <p className="truncate text-xs text-muted">
          {track.genre ?? "Unreleased"} · added {relativeDate(track.addedAt)}
        </p>
      </div>

      <div className="hidden items-center gap-5 text-xs text-muted sm:flex">
        <span className="tnum">{track.plays} plays</span>
        <span className="tnum">{track.comments} notes</span>
      </div>

      <span className="tnum w-10 shrink-0 text-right text-xs text-faint">
        {track.durationMs != null ? formatDuration(track.durationMs) : "—"}
      </span>
    </div>
  );
}

function UpcomingCard({ release }: { release: DashboardUpcoming }) {
  const days = release.releaseDate ? daysUntil(release.releaseDate) : null;

  return (
    <Card className="flex items-center gap-4">
      <span
        className="h-12 w-12 shrink-0 rounded-xl"
        style={{ backgroundImage: gradientFor(release.id) }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{release.title}</p>
        <p className="truncate text-xs text-muted">
          {release.releaseDate
            ? new Date(release.releaseDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            : "Date to be announced"}
        </p>
      </div>
      {days != null ? (
        <Badge tone="accent" className="tnum shrink-0">
          {days <= 0 ? "Today" : `in ${days}d`}
        </Badge>
      ) : null}
    </Card>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card className="mt-4 flex flex-col items-center gap-3 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-elevated">
        <EqBars bars={4} playing={false} />
      </span>
      <div>
        <p className="font-display text-lg">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      </div>
    </Card>
  );
}

// ── pure helpers ─────────────────────────────────────────────────────────────

/** Deterministic muted-gradient artwork until real cover art lands (Phase 5). */
export function gradientFor(seed: string): string {
  const pairs: Array<[string, string]> = [
    ["#b89a78", "#39465c"],
    ["#8f93b8", "#43406b"],
    ["#6f97a8", "#2c3b52"],
    ["#a88b6f", "#4a3b2f"],
    ["#9f8aa0", "#3e3a5a"],
    ["#8a8f72", "#3a4030"],
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  const [a, b] = pairs[Math.abs(hash) % pairs.length] ?? pairs[0]!;
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function daysUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1mo ago" : `${months}mo ago`;
}
