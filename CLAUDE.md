# XCLSV — Claude Code working context

> Read this first. It defines what XCLSV is, the invariants you must not break,
> the conventions to follow, and exactly where to resume. Keep this file updated
> at the end of each phase.

## What XCLSV is

A premium **pre-release music intelligence** platform. Artists privately release
unreleased tracks to selected supporters, gather real listening intelligence and
structured feedback, and perfect each song **before** it goes public on Spotify /
Apple Music / YouTube Music. It is NOT a streaming service — it exists *before*
streaming. Tagline: "Release smarter before releasing everywhere."

Success metric: how much better an artist's public release becomes because they
tested it on XCLSV first.

## How to work in this repo

Act as a founding engineer + product designer, not a code generator.

- Production-ready, maintainable, reusable code. Strict TypeScript. No placeholders.
- Server Components by default; add `"use client"` only when needed.
- Mobile-first, fully responsive, accessible (keyboard focus, reduced motion).
- Build **one phase at a time**. At the start of each phase state: what, why it
  matters to artists + fans, which files change, how it integrates. Don't rush ahead.
- Challenge weak ideas with reasoning; propose better alternatives. Every feature
  must make an artist more confident about releasing — if it doesn't, cut it.

## Stack

Next.js (App Router) · React 19 · TypeScript (strict) · TailwindCSS **v4**
(CSS-first tokens — there is intentionally NO `tailwind.config.ts`) ·
Framer Motion · Recharts · Supabase (Postgres + Storage + RLS) ·
Prisma (schema + migrations) · Clerk (auth, bridged into Supabase RLS).

## Architecture invariants (do not break)

1. **Identity ≠ capability.** `User` is who you are; `ArtistProfile` / `FanProfile`
   (and future org memberships) are what you can do. One account can hold both.
2. **One session resolver.** Every protected screen reads identity via
   `getSessionContext()` (`src/server/session.ts`). Future Organizations / Manager
   / Label / Producer / Team-Member context extends `SessionContext` there — never
   in callers.
3. **One post-auth gate.** Clerk redirects to `/continue` (`src/app/continue/route.ts`),
   which provisions the base user and routes to `/onboarding`, `/studio`, or `/listen`.
4. **Prisma owns migrations + trusted writes** (direct connection, bypasses RLS).
   Any **fan-facing read of private content** goes through the Supabase client
   carrying the Clerk JWT (`src/lib/supabase/server.ts`), so RLS enforces access.
5. **Private audio is served only via short-TTL signed URLs**
   (`src/lib/supabase/storage.ts`), minted after access is verified. A leaked
   unreleased track is an extinction event — treat privacy as core, not polish.
6. **Analytics are event-sourced.** `ListeningSession` + `PlaybackEvent` are the
   raw signal; heatmaps, skip points, retention, replay, and the confidence score
   are derived. The client event taxonomy (`src/lib/events.ts`) must stay in
   lockstep with the `PlaybackEventType` enum in `prisma/schema.prisma`.
7. **Confidence model is swappable; its inputs are not.** Capture `ConfidenceSignals`
   (`src/types`) from day one so historical snapshots stay comparable.
8. **The fan side is invite-only and room-scoped.** An artist's invitation is
   the only door in; redeeming it creates a `RoomAccess` row (fan ↔ artist,
   soft-revocable) and the listener's world is the union of their unrevoked
   rooms — Artist A invites you, you see A; B invites you later, you see A + B.
   `src/server/invitations.ts` is the one redemption path and
   `src/server/rooms.ts` the one fan-side read path. NO cross-artist surfaces:
   no discovery, no search, no public profiles, no visible listeners, no
   messaging.
9. **The Exclusive Listening Agreement is a mandatory versioned gate.** Before
   any room or audio: `/agreement` (checked in `/continue` AND in the /listen
   pages). Acceptances are stored per user per version (`AgreementAcceptance`:
   timestamp, IP, version — `src/lib/agreement.ts` holds `AGREEMENT_VERSION`);
   bumping the version re-gates everyone. Decline = sign out + revoke the
   pending invite session + back to the landing page.
10. **Playback sessions are forensic-ready.** `ListeningSession` already stores
   the unique session id + fanId + versionId + deviceId + timestamps per
   stream, so future audio watermarking keys on existing rows — do not add a
   parallel tracking table.

## Design system (tokens live in `src/styles/globals.css`)

Dark-first. Warm champagne-amber accent (`#E6B450`) — the glow of analog studio
gear — against layered cool charcoal. Never the default acid-green-on-black.

- Surfaces: `canvas #0A0B0D` → `surface #111317` → `elevated #16181D` (never pure black)
- Text: `foreground #F5F4F2` / `muted #9A968F` / `faint #6B6863` (never pure white)
- Accent: `#E6B450`, hover `#F3C969`. Data: amber / violet `#8B8CF0` / teal `#57C9C6`.
  Semantic: good `#57C97E`, bad `#E87B6E`.
- Type: Space Grotesk (display), Geist Sans (UI), Geist Mono (ALL numbers — use
  the `.tnum` class for counts, durations, scores, m:ss timestamps).
- Radii generous (8/12/16/24). Glass via the `.glass` class. Signature motif:
  `<EqBars />` (loading / now-playing / brand mark).

Conventions: use tokens via Tailwind utilities (`bg-accent`, `text-muted`,
`rounded-lg`, `font-display`) — not raw hex. Merge classes with `cn()`
(`src/lib/utils`). Build variants with `cva`. Spend boldness in one place per screen.

## Folder map

```
src/
  app/
    (auth)/        sign-in, sign-up, auth split-screen layout
    continue/      post-auth gate (redeems pending invite cookie, then routes)
    invite/        [token]/ public invite landing · actions.ts
    agreement/     mandatory Exclusive Listening Agreement gate (versioned)
    onboarding/    intent-driven wizard (artists; invited listeners skip it)
    listen/        listener home (rooms union) · [artistId]/ one artist's room
    preview/       DEV ONLY mock-data screen previews — delete before launch
    studio/        artist home (Phase 4 first cut)
    layout.tsx     ClerkProvider + fonts + tokens
  components/  ui/ · brand/ · auth/ · shell/ (sidebar, topbar, player bar)
               player/ · fan/ (artist-dashboard, rooms-overview, invite-required)
  lib/         db · auth · events · utils · clerk-appearance · supabase/ · audio/
               color/ · agreement.ts (AGREEMENT_VERSION + copy)
  server/      session.ts (getSessionContext, homePathFor)
               invitations.ts (getInvitation, redeemInvitation — the only door in)
               rooms.ts (listRooms, loadRoom — the only fan-side read path)
               agreement.ts (hasAcceptedCurrentAgreement, recordAgreementAcceptance)
  types/  · styles/globals.css
prisma/schema.prisma   (~17 models; event-sourced analytics core)
```

## Setup

```bash
npm install
cp .env.example .env.local        # fill Supabase + Clerk keys
npx prisma migrate dev --name init
npm run dev
```

In dashboards: create a **private** Supabase bucket `private-audio`; create a Clerk
JWT template named `supabase`; enable Google + Apple providers in Clerk.

## Build plan & status

1. Foundation — ✅ tokens, schema, lib clients, UI primitives
2. Authentication — ✅ themed Clerk, split-screen shell, route protection, `/continue` gate
3. Onboarding — ✅ intent wizard (resumable draft, live handle check)
3.5. Invited Access — ✅ invite landing, one-shot redemption at `/continue`,
   multi-room listener dashboard (`/listen` + `/listen/[artistId]`), mandatory
   versioned Exclusive Listening Agreement gate (`/agreement`), watermark-ready
   `ListeningSession` (Discover feed deleted)
4. **Artist Dashboard — ⬅ RESUME HERE** (identity shell exists; needs invitation
   management: create/send invite links, see invited supporters)
5. Song Upload
6. Private Listening (player + event instrumentation)
7. Comments & Ratings (timestamped feedback)
8. Analytics (heatmap, retention, skip points)
9. AI Insights (Release Confidence Score)
10. Teams & Organizations
11. Billing
12. Polish & Launch

## Phase 3.5 — Invited Access (how the fan flow works now)

The listener journey, end to end:

1. Artist sends `…/invite/<token>` (an `Invitation` row; single-use, expiring).
2. Public landing (`/invite/[token]`) shows who invited you; accepting parks
   the token in the `xclsv_invite` httpOnly cookie (30 min) for signed-out
   visitors and hands off to Clerk sign-up. Signed-in visitors redeem
   immediately.
3. `/continue` redeems the pending token (one transaction: FanProfile if
   needed, `RoomAccess` upsert — re-opens a revoked room on a fresh invite —
   group join, invitation marked used, `onboardedAt` + intent; invited
   listeners never see the onboarding wizard) and deletes the cookie.
4. The **Exclusive Listening Agreement** (`/agreement`) gates everything:
   `/continue` and both /listen pages redirect there until the CURRENT
   version is accepted (rows in `AgreementAcceptance` with timestamp + IP).
   Decline signs the listener out and returns to the landing page.
5. `/listen` shows the union of unrevoked rooms: exactly one room renders the
   artist dashboard directly; several render the rooms overview, each opening
   `/listen/[artistId]` (guarded by `RoomAccess`). A listener with no rooms
   sees the "room isn't open yet" screen with a code-redemption form — never
   a catalog. A song with no `SongAccess` rows is visible to all of the
   artist's invited listeners; grants narrow it.

Migrations: both migration folders under `prisma/migrations/` were applied to
the live Supabase project via the MCP connector (Postgres wire is blocked on
the dev machine's network). When Prisma can reach the DB, baseline with
`npx prisma migrate resolve --applied <folder>` for each — do NOT re-run them.

Note: track *metadata* on the fan side is read via `src/server/rooms.ts`
(Prisma, scoped by RoomAccess); invariant 4 (RLS-enforced reads) applies to
private *content* — audio stays behind signed URLs when Phase 6 wires real
playback, and each stream keys to its `ListeningSession` id for future
watermarking.

## Environment limits seen so far

- `npm install` has been run; `npx tsc --noEmit` passes and is the fast check.
- **`next build` fails on this machine with `EISDIR: … readlink` errors because
  `D:` is FAT32 (no symlinks).** It is NOT a code bug — `npx next build
  --turbopack` compiles + type/lint-checks clean and only dies at page-data
  collection. Full builds need the project on an NTFS volume.
- **This network drops the Postgres wire protocol to Supabase** (Prisma P1001
  even with correct credentials; TCP connects, protocol dies). Dev therefore
  runs against a LOCAL database: `npm run db:local` starts embedded Postgres 18
  on 127.0.0.1:55432 (data in `%LOCALAPPDATA%\xclsv\pgdata`, NTFS); .env.local
  points at it, with the Supabase URLs kept commented for later. The machine
  has no system VC++ runtime — the script auto-restores stashed DLLs into the
  postgres binaries after npm reinstalls. Supabase schema/data changes go
  through the Supabase MCP connector (HTTPS works); keep local + remote in
  lockstep by applying every `prisma/migrations/*` folder to both.
