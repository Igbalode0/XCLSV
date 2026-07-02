"use client";

import { useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import { useGlobalPlayer } from "@/components/player/player-context";
import { Waveform } from "@/components/player/waveform";
import { EqBars } from "@/components/ui/eq-bars";
import { PauseGlyph, PlayGlyph, VerifiedIcon } from "@/components/shell/icons";
import { formatTimestamp } from "@/lib/utils";
import { gradientFor, tintFor } from "./artwork";

/** Serializable props from the server (dates travel as ISO strings). */
export interface RoomData {
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
  tracks: RoomTrack[];
  upcoming: RoomUpcoming[];
}

export interface RoomTrack {
  id: string;
  title: string;
  genre: string | null;
  durationMs: number | null;
  plays: number;
  comments: number;
  addedAt: string;
}

export interface RoomUpcoming {
  id: string;
  title: string;
  genre: string | null;
  releaseDate: string | null;
}

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Not a dashboard — a private listening room. The current track owns the
 * page: its palette lights the whole shell (via the player's shared tint),
 * the waveform is the hero and breathes before playback, and the transport
 * here drives the same engine as the bottom bar, so the player reads as one
 * piece of hardware. Everything else — the rest of the catalog, what's
 * coming — stays quiet underneath. No stat cards; every element earns its
 * place.
 */
export function RoomExperience({
  data,
  listenerName,
}: {
  data: RoomData;
  listenerName: string;
}) {
  const gp = useGlobalPlayer();
  const { artist, tracks, upcoming, stats } = data;

  // The track that owns the page: whatever is playing from this room,
  // otherwise the artist's latest drop.
  const current = tracks.find((t) => t.id === gp.track?.id) ?? tracks[0] ?? null;
  const tint = tintFor(current?.id ?? artist.handle);

  // Re-light the room (and the whole shell) from the current artwork.
  useEffect(() => {
    gp.setTint(tint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tint]);

  const isCurrentPlaying = gp.isPlaying && gp.track?.id === current?.id;

  const playTrack = (t: RoomTrack) => {
    if (gp.track?.id === t.id) gp.toggle();
    else gp.play({ id: t.id, title: t.title, artist: artist.name });
  };

  const firstName = listenerName.trim().split(/\s+/)[0] || listenerName;
  // NOTE: never branch these values on useReducedMotion() — it is null on the
  // server and set on the client, which desyncs SSR HTML from hydration. The
  // <MotionConfig reducedMotion="user"> wrapper disables movement instead.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative">
      {/* Living background — slow drifting light in the track's color. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[8%] top-[-12%] h-[34rem] w-[34rem] rounded-full blur-[130px]"
          style={{ background: "rgb(var(--rp-rgb) / 0.16)" }}
          animate={{ x: [0, 70, -30, 0], y: [0, 40, 15, 0] }}
          transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[2%] top-[22%] h-[26rem] w-[26rem] rounded-full blur-[120px]"
          style={{ background: "rgb(var(--rp-rgb) / 0.10)" }}
          animate={{ x: [0, -60, 25, 0], y: [0, -30, 45, 0] }}
          transition={{ duration: 44, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* The release owns the page */}
        <motion.section {...rise(0)} className="pt-4 sm:pt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-overlay px-3 py-1 text-xs text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[rgb(var(--rp-rgb))] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[rgb(var(--rp-rgb))]" />
              </span>
              Unreleased · Private listen
            </span>
            <span className="text-xs text-faint">
              Shared in confidence with you, {firstName}
            </span>
          </div>

          {current ? (
            <>
              <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                {current.title}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-lg text-muted">
                {artist.name}
                {artist.verified ? (
                  <VerifiedIcon className="h-5 w-5 shrink-0 text-[rgb(var(--rp-rgb))]" />
                ) : null}
                {current.genre ? (
                  <span className="text-sm text-faint">· {current.genre}</span>
                ) : null}
              </p>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
                {artist.name}
              </h1>
              <p className="mt-4 max-w-md text-muted">
                Nothing in the room yet — you&rsquo;ll be among the first to hear
                it the moment {artist.name} shares a track.
              </p>
            </>
          )}
        </motion.section>

        {/* The instrument — waveform hero driven by the one shared engine */}
        {current ? (
          <motion.section
            {...rise(0.12)}
            className="glass mt-8 rounded-3xl border border-line p-5 shadow-[0_24px_70px_rgba(0,0,0,0.35)] sm:p-7"
          >
            <motion.div
              animate={
                isCurrentPlaying || !gp.ready
                  ? { scaleY: 1 }
                  : { scaleY: [1, 1.06, 1] }
              }
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "center" }}
            >
              {gp.ready && gp.peaks.length > 0 ? (
                <Waveform
                  peaks={gp.peaks}
                  heat={gp.heat}
                  primaryRgb={tint}
                  getProgress={() => (gp.track?.id === current.id ? gp.getProgress() : 0)}
                  durationMs={gp.durationMs}
                  onSeek={(f) => {
                    if (gp.track?.id !== current.id) {
                      gp.play({ id: current.id, title: current.title, artist: artist.name });
                    }
                    gp.seekFraction(f);
                  }}
                  className="h-32 sm:h-44"
                />
              ) : (
                <div className="grid h-32 place-items-center sm:h-44">
                  <EqBars bars={5} />
                </div>
              )}
            </motion.div>

            <div className="mt-4 flex items-center gap-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.93 }}
                onClick={() => playTrack(current)}
                aria-label={isCurrentPlaying ? `Pause ${current.title}` : `Play ${current.title}`}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-on-accent transition-shadow"
                style={{
                  background: "rgb(var(--rp-rgb))",
                  boxShadow: "0 10px 34px rgb(var(--rp-rgb) / 0.45)",
                }}
              >
                {isCurrentPlaying ? (
                  <PauseGlyph className="h-6 w-6" />
                ) : (
                  <PlayGlyph className="h-6 w-6 translate-x-0.5" />
                )}
              </motion.button>

              <span className="tnum text-sm text-muted">
                {gp.track?.id === current.id ? formatTimestamp(gp.currentMs) : "0:00"}
                <span className="text-faint">
                  {" "}/ {formatTimestamp(current.durationMs ?? gp.durationMs)}
                </span>
              </span>

              <span className="ml-auto hidden text-xs text-faint sm:block">
                Every listen shapes the final release
              </span>
            </div>
          </motion.section>
        ) : null}

        {/* One quiet line instead of a stat grid */}
        <motion.p {...rise(0.2)} className="mt-5 px-1 text-xs text-faint">
          <span className="tnum">{stats.tracks}</span> tracks shared ·{" "}
          <span className="tnum">{stats.upcoming}</span> on the way · only
          invited listeners can see this room
        </motion.p>

        {/* The rest of the room */}
        {tracks.length > 1 || (tracks.length === 1 && current?.id !== tracks[0]?.id) ? (
          <motion.section {...rise(0.28)} className="mt-10">
            <h2 className="px-1 font-display text-sm uppercase tracking-[0.2em] text-faint">
              In the room
            </h2>
            <div className="mt-3 divide-y divide-line">
              {tracks.map((t) => {
                const isRow = gp.track?.id === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => playTrack(t)}
                    className="group flex w-full items-center gap-4 rounded-xl px-1.5 py-3 text-left transition-colors hover:bg-overlay"
                  >
                    <span
                      className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg"
                      style={{ backgroundImage: gradientFor(t.id) }}
                    >
                      <span className="absolute inset-0 grid place-items-center bg-black/30 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {isRow && gp.isPlaying ? (
                          <PauseGlyph className="h-3.5 w-3.5" />
                        ) : (
                          <PlayGlyph className="h-3.5 w-3.5 translate-x-px" />
                        )}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <span className="truncate">{t.title}</span>
                        {isRow && gp.isPlaying ? <EqBars className="h-3" /> : null}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {t.genre ?? "Unreleased"}
                      </span>
                    </span>
                    <span className="tnum shrink-0 text-xs text-faint">
                      {t.durationMs != null ? formatTimestamp(t.durationMs) : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        ) : null}

        {upcoming.length > 0 ? (
          <motion.section {...rise(0.36)} className="mt-10 pb-4">
            <h2 className="px-1 font-display text-sm uppercase tracking-[0.2em] text-faint">
              On the way
            </h2>
            <div className="mt-3 space-y-1">
              {upcoming.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-1.5 py-2.5">
                  <span
                    className="h-9 w-9 shrink-0 rounded-lg opacity-70"
                    style={{ backgroundImage: gradientFor(u.id) }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{u.title}</span>
                    <span className="block text-xs text-muted">
                      {u.genre ?? "Unreleased"}
                    </span>
                  </span>
                  <span className="tnum shrink-0 text-xs text-faint">
                    {u.releaseDate ? untilLabel(u.releaseDate) : "date TBA"}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        ) : null}
      </div>
    </div>
    </MotionConfig>
  );
}

function untilLabel(iso: string): string {
  const days = Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
