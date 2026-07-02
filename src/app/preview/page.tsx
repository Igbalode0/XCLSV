import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ChevronRight } from "@/components/shell/icons";

/**
 * DEV PREVIEW — not a product surface. Renders the Invited Access screens with
 * mock data and no database so the flow can be reviewed on machines where
 * Postgres is unreachable. Delete this folder (and its `/preview(.*)` entry in
 * `src/middleware.ts`) before launch.
 */
const SCREENS = [
  {
    href: "/preview/invite",
    title: "Invite landing",
    body: "What a listener sees when they open an artist's invitation link. Accepting hands off to sign-up.",
  },
  {
    href: "/preview/agreement",
    title: "Exclusive Listening Agreement",
    body: "The mandatory full-screen gate after sign-in. Accept opens the rooms; Decline signs the listener out.",
  },
  {
    href: "/preview/dashboard",
    title: "Listener dashboard — one room",
    body: "A single artist's room: stats, shared tracks, and upcoming releases. Nothing else.",
  },
  {
    href: "/preview/rooms",
    title: "Listener dashboard — several rooms",
    body: "The same listener after a second artist invites them: only invited artists, ever.",
  },
  {
    href: "/preview/locked",
    title: "Locked state — no invitation yet",
    body: "A signed-in account with no room access. The door stays closed until a code is redeemed.",
  },
];

export default function PreviewIndex() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="relative flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo href={null} />
        <ThemeToggle />
      </header>

      <main className="relative mx-auto w-full max-w-xl flex-1 px-6 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Dev preview</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight">Invited Access — screens</h1>
        <p className="mt-2 text-muted">
          Mock data, no database. The real flow starts at an artist&rsquo;s{" "}
          <span className="tnum">/invite/&lt;token&gt;</span> link.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {SCREENS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="glass group flex items-center gap-4 rounded-lg border border-line p-5 shadow-elev transition-colors hover:bg-overlay"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg tracking-tight text-foreground">
                  {s.title}
                </span>
                <span className="mt-1 block text-sm text-muted">{s.body}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-faint transition-colors group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
