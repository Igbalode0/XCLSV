import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { EqBars } from "@/components/ui/eq-bars";
import { Card, CardLabel, CardValue } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SOCIAL_PLATFORMS } from "@/app/onboarding/constants";

/**
 * Phase 4 — Artist Studio (first cut). The home an artist lands on after
 * onboarding. For now it surfaces their identity (the profile they just built)
 * and the empty analytics shells that Phases 5–9 will fill once songs exist.
 */
export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!user.onboardedAt) redirect("/onboarding");
  if (!user.artist) redirect("/listen"); // fan-only account

  const socials = (user.socials ?? {}) as Record<string, string>;
  const socialLinks = SOCIAL_PLATFORMS.map((p) => ({
    label: p.label,
    value: socials[p.key],
  })).filter((s) => Boolean(s.value));

  const initial = user.displayName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-canvas/70 px-6 py-3.5 backdrop-blur-md sm:px-8">
        <Logo href="/studio" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Studio</p>

        {/* Identity / profile */}
        <Card glow className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line-strong bg-elevated">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-3xl text-muted">{initial}</span>
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl tracking-tight">{user.displayName}</h1>
                {user.artist.verified ? <Badge tone="accent">Verified</Badge> : null}
              </div>
              <p className="tnum mt-0.5 text-muted">@{user.artist.handle}</p>
            </div>
          </div>

          {user.genres.length > 0 ? (
            <div className="flex flex-wrap gap-2 sm:ml-auto sm:max-w-xs sm:justify-end">
              {user.genres.map((g) => (
                <Badge key={g} tone="neutral">
                  {g}
                </Badge>
              ))}
            </div>
          ) : null}
        </Card>

        {socialLinks.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 px-1 text-sm text-muted">
            {socialLinks.map((s) => (
              <span key={s.label}>
                <span className="text-faint">{s.label}:</span> {s.value}
              </span>
            ))}
          </div>
        ) : null}

        {/* Analytics shells — populated once songs + listens exist (Phases 5–9) */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardLabel>Songs</CardLabel>
            <CardValue>0</CardValue>
          </Card>
          <Card>
            <CardLabel>Listeners</CardLabel>
            <CardValue>0</CardValue>
          </Card>
          <Card>
            <CardLabel>Avg. completion</CardLabel>
            <CardValue className="text-faint">—</CardValue>
          </Card>
          <Card>
            <CardLabel>Release confidence</CardLabel>
            <CardValue className="text-faint">—</CardValue>
          </Card>
        </div>

        {/* Empty songs state */}
        <div className="mt-8">
          <h2 className="font-display text-sm uppercase tracking-[0.2em] text-faint">
            Your songs
          </h2>
          <Card className="mt-4 flex flex-col items-center gap-4 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-elevated">
              <EqBars bars={4} playing={false} />
            </span>
            <div>
              <p className="font-display text-lg">No tracks yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted">
                Upload your first unreleased track to start gathering private
                listening intelligence before it goes public.
              </p>
            </div>
            <Button disabled title="Song upload arrives in Phase 5">
              Upload a song
            </Button>
            <p className="text-xs text-faint">Upload lands in Phase 5.</p>
          </Card>
        </div>
      </main>
    </div>
  );
}
