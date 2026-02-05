# Unreel - N-Back Cognitive Training App

## Quick Reference

- **Stack**: React 18 + TypeScript + Vite (frontend), Express + Prisma (backend), Tailwind CSS, Recharts
- **Auth**: Clerk (`@clerk/clerk-react` frontend, `@clerk/express` backend)
- **DB**: PostgreSQL via Prisma ORM
- **Deploy**: Dockerized single container on Railway

## Commands

- `npm run dev` - Start Vite dev server + Express backend (requires `VITE_CLERK_PUBLISHABLE_KEY` in `.env`)
- `npm run build` - Build frontend to `dist/client/`, compile server to `dist/server/`
- `npx tsc --noEmit` - Type-check frontend
- `npx tsc -p tsconfig.server.json --noEmit` - Type-check server
- `npx prisma migrate dev` - Run migrations locally (needs local Postgres)
- `npx prisma generate` - Regenerate Prisma client after schema changes
- `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` - Generate migration SQL without local DB

## Architecture

### Frontend (`src/`)
- **Game engine**: `hooks/useGameLoop.ts` (timer, trial progression, combo), `hooks/useKeyboard.ts` (a/s/d/j/l key mapping), `hooks/useAudio.ts` (SpeechSynthesis + tones)
- **Sequence logic**: `lib/sequence.ts` generates stimuli with ~33% match rate, forces match/non-match per type
- **Scoring**: `lib/scoring.ts` - per-type accuracy, XP = nLevel * 10 * accuracy * combo multiplier
- **State**: No state library; `App.tsx` manages view routing via `useState`, game state lives in `useGameLoop`
- **Components**: `components/game/` (gameplay), `components/dashboard/` (home), `components/settings/`, `components/results/`, `components/history/`, `components/layout/`

### Backend (`server/`)
- `index.ts` - Express entry, serves Vite build from `dist/client/` + API routes
- `routes/sessions.ts` - POST (save session + XP + streaks + achievements), GET (paginated history)
- `routes/stats.ts` - GET `/api/profile`, `/api/stats`, `/api/achievements`, `/api/daily-challenge`
- `db.ts` - Prisma client singleton

### Key Mappings
| Key | Stimulus |
|-----|----------|
| a | Position |
| s | Color |
| d | Shape |
| j | Number |
| l | Audio |

## Environment Variables

Required:
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key (must be available at build time for Vite)
- `CLERK_SECRET_KEY` - Clerk secret key (server runtime)
- `DATABASE_URL` - PostgreSQL connection string

The Dockerfile uses `ARG VITE_CLERK_PUBLISHABLE_KEY` to pass it into the Docker build step.

## Database

Schema in `prisma/schema.prisma`: `UserProfile`, `Session`, `UserAchievement`. Migrations live in `prisma/migrations/`. The Docker CMD runs `prisma migrate deploy` before starting the server.

## Gotchas

- Clerk components (`SignedIn`, `SignedOut`, etc.) require `ClerkProvider` ancestor - app throws on startup without the publishable key
- `VITE_` env vars are baked in at build time, not runtime - changes require a rebuild
- Audio letters are stored uppercase in `lib/constants.ts` but lowercased before passing to SpeechSynthesis to avoid "Capital B" speech
- The daily challenge is seeded deterministically from the date string

## Git

- Remote: `git@github.com:cyrus123live/n-back-game.git`
- Branch: `main`
- Always commit and push when asked
