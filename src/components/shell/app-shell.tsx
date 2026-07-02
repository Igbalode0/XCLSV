"use client";

import type { ReactNode } from "react";
import { PlayerProvider } from "@/components/player/player-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { GlobalPlayerBar } from "./global-player-bar";

interface AppShellProps {
  user: { displayName: string; avatarUrl: string | null };
  /** The inviting artist's name — surfaces "whose room" in the sidebar. */
  accessLabel?: string;
  children: ReactNode;
}

/**
 * The persistent product frame: left sidebar nav, top search bar, scrollable
 * content, and the global player bar pinned to the bottom — all over a soft
 * ambient wash so the frosted panels read as floating glass.
 */
export function AppShell({ user, accessLabel, children }: AppShellProps) {
  return (
    <PlayerProvider>
      <div className="relative min-h-dvh overflow-x-hidden">
        {/* Ambient lighting behind the glass */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 12% 0%, rgb(var(--rp-rgb) / 0.10), transparent 60%), radial-gradient(50% 45% at 95% 8%, rgb(var(--rp-rgb) / 0.07), transparent 60%)",
          }}
        />

        <div className="relative flex min-h-dvh">
          <Sidebar user={user} accessLabel={accessLabel} />
          <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1 px-5 pb-36 pt-1 sm:px-8 lg:pb-32">{children}</main>
          </div>
        </div>

        <GlobalPlayerBar />
      </div>
    </PlayerProvider>
  );
}
