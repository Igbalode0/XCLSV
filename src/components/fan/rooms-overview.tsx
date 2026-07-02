"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, VerifiedIcon } from "@/components/shell/icons";
import { gradientFor } from "./artwork";
import type { RoomSummary } from "@/server/rooms";

/**
 * The multi-room home: every artist who invited this listener, and ONLY
 * them. Each card opens that artist's private room. No discovery, no
 * directory — a new room only ever appears through a new invitation.
 */
export function RoomsOverview({
  rooms,
  listenerName,
}: {
  rooms: RoomSummary[];
  listenerName: string;
}) {
  const firstName = listenerName.trim().split(/\s+/)[0] || listenerName;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="py-2">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Your private access
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Your rooms
        </h1>
        <p className="mt-3 max-w-md text-muted">
          Welcome back, {firstName}. {rooms.length} artists trust you with their
          unreleased work — choose a room to step inside.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, i) => (
          <motion.div
            key={room.artistId}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/listen/${room.artistId}`}
              className="glass group flex h-full flex-col rounded-3xl border border-line p-5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition-colors hover:bg-overlay"
            >
              <div
                className="relative h-28 overflow-hidden rounded-2xl"
                style={{ backgroundImage: gradientFor(room.handle) }}
              >
                {room.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={room.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="truncate font-display text-xl tracking-tight text-foreground">
                  {room.name}
                </span>
                {room.verified ? (
                  <VerifiedIcon className="h-4.5 w-4.5 shrink-0 text-[rgb(var(--rp-rgb))]" />
                ) : null}
              </div>
              <p className="tnum text-sm text-muted">@{room.handle}</p>

              {room.genres.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {room.genres.map((g) => (
                    <Badge key={g} tone="neutral">
                      {g}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="tnum text-xs text-muted">
                  {room.trackCount} tracks · {room.upcomingCount} upcoming
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground">
                  Enter <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-10 pb-2 text-center text-xs text-faint">
        A new room appears here the moment another artist invites you.
      </p>
    </div>
  );
}
