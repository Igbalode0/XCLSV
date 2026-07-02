import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AcceptCard } from "@/app/invite/[token]/accept-card";
import { InviteHeader } from "@/app/invite/[token]/invite-views";

/**
 * DEV PREVIEW — the invite landing with a mock artist (see ../page.tsx).
 * Accepting really does park the token and hand off to /sign-up, so the
 * transition can be reviewed too.
 */
export default function PreviewInvite() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(230,180,80,0.16), transparent 65%)" }}
      />

      <header className="relative flex items-center justify-between px-6 py-5 sm:px-8">
        <Logo href={null} />
        <ThemeToggle />
      </header>

      <main className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <InviteHeader
            artist={{ name: "Kenzo", handle: "kenzo", verified: true, avatarUrl: null }}
          />
          <AcceptCard token="preview-token" artistName="Kenzo" />
        </div>
      </main>
    </div>
  );
}
