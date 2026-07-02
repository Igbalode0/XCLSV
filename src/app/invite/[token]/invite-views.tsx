import { VerifiedIcon } from "@/components/shell/icons";
import type { InviteArtist } from "@/server/invitations";

/** Presentational pieces of the invite landing, shared with the dev preview. */

export function InviteHeader({ artist }: { artist: InviteArtist }) {
  const initial = artist.name.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <div className="text-center">
      <span className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-2xl border border-line-strong bg-elevated shadow-glow">
        {artist.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-3xl text-muted">{initial}</span>
        )}
      </span>

      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-accent">
        Private invitation
      </p>
      <h1 className="mt-3 flex items-center justify-center gap-2 font-display text-4xl tracking-tight">
        {artist.name}
        {artist.verified ? (
          <VerifiedIcon className="h-6 w-6 text-[rgb(var(--rp-rgb))]" />
        ) : null}
      </h1>
      <p className="tnum mt-1 text-muted">@{artist.handle}</p>
      <p className="mx-auto mt-4 max-w-md text-muted">
        wants you to hear their unreleased music before the world does — and to
        help shape it with your honest listening.
      </p>
    </div>
  );
}

export function DeadInvite({
  state,
  artist,
}: {
  state: "expired" | "claimed" | "invalid";
  artist: InviteArtist | null;
}) {
  const copy = {
    expired: {
      title: "This invitation has expired",
      body: `Invitations are time-limited to keep the room private. Ask ${artist?.name ?? "the artist"} to send you a fresh one.`,
    },
    claimed: {
      title: "This invitation was already used",
      body: "Each invitation opens the door once. If it was you, just sign in — your access is already set up.",
    },
    invalid: {
      title: "This invitation isn't valid",
      body: "The link may be incomplete or mistyped. Check it against the one the artist sent you.",
    },
  }[state];

  return (
    <div className="glass rounded-lg border border-line p-8 text-center shadow-elev">
      <p className="text-xs uppercase tracking-[0.2em] text-faint">Invitation</p>
      <h1 className="mt-3 font-display text-2xl tracking-tight">{copy.title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted">{copy.body}</p>
      {state === "claimed" ? (
        <a
          href="/sign-in"
          className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-on-accent shadow-glow transition-all hover:bg-accent-hi"
        >
          Sign in
        </a>
      ) : null}
    </div>
  );
}
