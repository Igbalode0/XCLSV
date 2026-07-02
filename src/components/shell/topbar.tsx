"use client";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BellIcon, SearchIcon } from "./icons";

export function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-5 py-4 sm:px-8">
      <div className="lg:hidden">
        <Logo href="/listen" />
      </div>

      <div className="glass mx-auto flex h-12 w-full max-w-2xl items-center gap-3 rounded-full border border-line px-5">
        <SearchIcon className="h-5 w-5 text-faint" />


      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="glass grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:text-foreground"
      >
        <BellIcon className="h-5 w-5" />
      </button>
      <ThemeToggle />
    </header>
  );
}
