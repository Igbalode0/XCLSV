# XCLSV

> Release smarter before releasing everywhere.

Premium pre-release music intelligence. Artists privately release unreleased
tracks to selected supporters, gather real listening intelligence, and perfect
each song before it goes public on Spotify, Apple Music, and YouTube Music.

XCLSV is not a streaming platform. It exists **before** Spotify.

---

## Stack

- **Next.js (App Router)** · React 19 · TypeScript (strict)
- **TailwindCSS v4** (CSS-first tokens) · Framer Motion · Recharts
- **Supabase** (Postgres + Storage + RLS) · **Prisma** (schema + migrations)
- **Clerk** (auth), bridged into Supabase RLS via a JWT template

## Architecture decisions

1. **Clerk owns identity, the database owns access.** Prisma talks to Postgres
   on a direct connection (migrations + trusted writes) and bypasses RLS. So any
   fan-facing read of private content goes through the Supabase client carrying
   the Clerk JWT (`src/lib/supabase/server.ts`), and RLS decides who may read
   what. Defense in depth — because a leaked unreleased track is fatal here.
2. **Private audio is served only via short-TTL signed URLs**
   (`src/lib/supabase/storage.ts`), minted per request after access is verified.
   The client never sees a raw storage path.
3. **Analytics are event-sourced.** `ListeningSession` + `PlaybackEvent` are the
   raw signal; heatmaps, skip points, retention, replay rate, and the Release
   Confidence Score are all derived. The event contract lives in
   `src/lib/events.ts` and mirrors the Prisma enum.
4. **The confidence model is swappable; its inputs are not.** `ConfidenceSignals`
   (`src/types`) is captured from day one so the future AI model has clean,
   comparable history.

## Design system

Dark-first, with a warm champagne-amber accent (`#E6B450`) — the glow of analog
studio gear against layered cool charcoal — never the default acid-green-on-black.
Space Grotesk (display) · Geist Sans (UI) · Geist Mono (all numbers, tabular).
Signature motif: the `EqBars` equalizer used for loading, now-playing, and brand.
All tokens live in `src/styles/globals.css`.

## Getting started

```bash
npm install
cp .env.example .env.local        # fill in Supabase + Clerk credentials
npx prisma migrate dev --name init
npm run dev
```

Then, in the dashboards:

1. Create a **private** Supabase Storage bucket named `private-audio`.
2. Create a Clerk JWT template named `supabase`.
3. Enable RLS on fan-readable tables (policies land alongside Phase 7).

## Structure

```
src/
  app/          route groups: (marketing) (auth) (artist) (fan) · api/
  components/   ui/ · charts/ · player/ · analytics/
  features/     songs/ · feedback/ · fans/ · confidence/
  lib/          db · supabase/ · auth · events · utils
  server/       data-access layer + server actions
  types/  · styles/
prisma/schema.prisma
```
