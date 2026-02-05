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
- **Game engine**: `hooks/useGameLoop.ts` (timer, trial progression, combo, adaptive between-session evaluation), `hooks/useKeyboard.ts` (a/s/d/j/l key mapping), `hooks/useAudio.ts` (SpeechSynthesis + Web Audio tones via module-level singleton AudioContext)
- **Sequence logic**: `lib/sequence.ts` generates stimuli with ~33% match rate, forces match/non-match per type
- **Scoring**: `lib/scoring.ts` - per-type accuracy, XP = nLevel * 10 * accuracy * combo multiplier
- **Programs**: `lib/programs.ts` - 3 training program templates (beginner/intermediate/advanced, 20 sessions each) with score-gated progression (70% to advance, 90% to skip ahead)
- **Tutorial**: `lib/tutorialData.ts` - pre-scripted 8-trial 2-back walkthrough sequence and step definitions
- **State**: No state library; `App.tsx` manages view routing via `useState`, game state lives in `useGameLoop`
- **Components**: `components/game/` (gameplay), `components/dashboard/` (home + inline settings), `components/results/`, `components/history/` (charts, avg-by-type, achievements, session list), `components/layout/`, `components/tutorial/`, `components/programs/`

### Backend (`server/`)
- `index.ts` - Express entry, serves Vite build from `dist/client/` + API routes
- `routes/sessions.ts` - POST (save session + XP + streaks + achievements), GET (paginated history), DELETE (remove session)
- `routes/programs.ts` - GET (list programs), POST `/enroll`, POST `/:id/complete-session` (score-gated), DELETE `/:id` (abandon)
- `routes/stats.ts` - GET `/api/profile`, `/api/stats`, `/api/achievements`, `/api/daily-challenge`
- `lib/programs.ts` - Template validation, phase boundaries for skip target computation
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

Schema in `prisma/schema.prisma`: `UserProfile`, `Session`, `UserAchievement`, `TrainingProgram`. Migrations live in `prisma/migrations/`. The Docker CMD runs `prisma migrate deploy` before starting the server.

Session has optional adaptive fields: `adaptive`, `startingLevel`, `endingLevel`, `levelChanges`. TrainingProgram tracks enrollment, `currentDay`, `status` (active/completed/abandoned), and `completedSessions` (JSON array of session IDs).

## Gotchas

- Clerk components (`SignedIn`, `SignedOut`, etc.) require `ClerkProvider` ancestor - app throws on startup without the publishable key
- `VITE_` env vars are baked in at build time, not runtime - changes require a rebuild
- Audio letters are stored uppercase in `lib/constants.ts` but lowercased before passing to SpeechSynthesis to avoid "Capital B" speech
- The daily challenge is seeded deterministically from the date string
- AudioContext requires user interaction to unlock (autoplay policy) - `useAudio.ts` uses a module-level singleton with global unlock on first click/touch/keydown
- Match buttons are toggleable - pressing again before trial ends un-selects the response (`respondMatch` returns `boolean` indicating toggle state)
- Adaptive difficulty is between-session only (evaluates at end, recommends next level: >=85% up, <=50% down)
- Training program progression is score-gated (70% to advance, 90%+ to skip to next phase). Phase boundaries defined in `server/lib/programs.ts` as `TEMPLATE_PHASES`
- Express `req.params.id` can be `string | string[]` - cast with `as string` in route handlers
- Dashboard has inline settings (no separate settings screen) — N-level picker, stimuli toggles, collapsible Advanced section (trials, interval, adaptive)
- Default stimuli are `['position', 'color']`
- GameGrid renders a single centered square when `position` is not in `activeStimuli`
- ResultsScreen propagates `newStreak` back to App.tsx via `onStreakUpdate` callback so the Navbar streak counter updates immediately after session save. App.tsx also passes `currentStreak` down to Dashboard so the CompactStatsCard always reflects the latest value (handles race condition where user navigates back before save completes)
- All API calls use `cache: 'no-store'` to prevent browser caching of stale profile/stats data
- CompactStatsCard combines level/rank, streak, total sessions, XP bar, and 12-week activity heatmap into one card
- History screen shows chart, avg-by-type, achievements, and session list

## Git

- Remote: `git@github.com:cyrus123live/n-back-game.git`
- Branch: `main`
- Always commit and push when asked

## Workflow

- After every set of changes, update this CLAUDE.md file to reflect the current state of the codebase, then commit and push
