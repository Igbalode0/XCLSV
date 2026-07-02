"use client";

import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  GearIcon,
  HeartIcon,
  HomeIcon,
  NoteIcon,
  UserIcon,
  UsersIcon,
} from "./icons";

/**
 * Listener navigation. Deliberately private: no Discover, no public feed, no
 * messages, no browsing — only the listener's own rooms, invites, library,
 * feedback, and account. Everything here is scoped to artists who invited
 * this listener.
 */
const NAV = [
  { label: "Home", Icon: HomeIcon, active: true },
  { label: "My Invites", Icon: UsersIcon },
  { label: "Library", Icon: NoteIcon },
  { label: "Reviews", Icon: HeartIcon },
  { label: "Profile", Icon: UserIcon },
  { label: "Settings", Icon: GearIcon },
];

export function Sidebar({
  user,
  accessLabel,
}: {
  user: { displayName: string; avatarUrl: string | null };
  /** Pre-formatted access line, e.g. "Kenzo’s room" or "3 private rooms". */
  accessLabel?: string;
}) {
  const initial = user.displayName.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <aside className="sticky top-0 hidden h-dvh shrink-0 flex-col gap-7 px-5 py-6 lg:flex lg:w-64">
      <div className="px-2">
        <Logo href="/listen" />
      </div>

      {accessLabel ? (
        <div className="rounded-2xl border border-line bg-overlay px-4 py-3">
          <p className="text-[11px] uppercase tracking-wide text-faint">
            Private access
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
            {accessLabel}
          </p>
        </div>
      ) : null}

      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ label, Icon, active }) => (
          <button
            key={label}
            type="button"
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm transition-colors",
              active
                ? "glass border border-line text-foreground shadow-elev"
                : "text-muted hover:bg-overlay hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="mt-auto flex items-center gap-3 rounded-2xl border border-line bg-overlay px-3 py-2.5 text-left transition-colors hover:bg-overlay-strong"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-elevated font-display text-sm text-muted">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {user.displayName}
          </span>
          <span className="block text-xs text-faint">Invited listener</span>
        </span>
        <ChevronRight className="h-4 w-4 text-faint" />
      </button>
    </aside>
  );
}
