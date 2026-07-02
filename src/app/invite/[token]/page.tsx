import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getInvitation } from "@/server/invitations";
import { AcceptCard } from "./accept-card";
import { DeadInvite, InviteHeader } from "./invite-views";

/**
 * Invited Access — the public front door. This page is the ONLY way into the
 * fan side of XCLSV: it presents who invited you and the private-listening
 * terms, and accepting hands off to sign-up (or straight into the room when
 * already signed in). No catalog, artist, or listener data leaks here beyond
 * the inviting artist's own identity.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvitation(token);

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* ambient amber glow — the room lit by the gear */}
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
          {invite.state === "valid" ? (
            <>
              <InviteHeader artist={invite.artist} />
              <AcceptCard token={token} artistName={invite.artist.name} />
            </>
          ) : (
            <DeadInvite
              state={invite.state}
              artist={"artist" in invite ? invite.artist : null}
            />
          )}
        </div>
      </main>
    </div>
  );
}
