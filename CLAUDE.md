# Unreel - N-Back Cognitive Training App

## Mission

Strengthen working memory for as many people as possible. Every design and engineering decision should serve that goal — make the training effective, accessible, and engaging enough that people actually stick with it.

## Quick Reference

- **Stack**: React 18 + TypeScript + Vite (frontend), Express + Prisma (backend), Tailwind CSS, Recharts, `vite-plugin-pwa`
- **Fonts**: Libre Franklin (headings, 700/800), Inter (body, 400/500/600) via Google Fonts
- **Design**: Light/dark theme with NYT Games-inspired warmth — CSS custom properties auto-switch via `.dark` class on `<html>`. Warm green (`#538d4e`) primary accent
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
- **Tutorial**: `lib/tutorialData.ts` - pre-scripted 8-trial 2-back walkthrough with position + color stimuli. Auto-shows on first visit (checks `localStorage['unreel-tutorial-seen']`)
- **State**: No state library; `App.tsx` manages view routing via `useState`, game state lives in `useGameLoop`
- **Components**: `components/game/` (gameplay), `components/dashboard/` (home + inline settings), `components/results/`, `components/history/` (charts, best-score-by-day, achievements grouped by category, session list), `components/layout/`, `components/tutorial/`, `components/programs/`, `components/pwa/` (install prompt), `components/icons/` (FlameIcon, TargetIcon, AchievementIcon, StimulusIcon SVG components)
- **Theme**: `lib/theme.ts` — `getPreferredTheme()`, `applyTheme()`, `toggleTheme()`, `getCurrentTheme()`. Persists to localStorage key `unreel-theme`. Falls back to `prefers-color-scheme` media query
- **Offline queue**: `lib/offlineQueue.ts` — stores failed session saves in localStorage (`unreel-offline-sessions`), syncs when back online

### Backend (`server/`)
- `index.ts` - Express entry, serves Vite build from `dist/client/` + API routes
- `routes/sessions.ts` - POST (save session + XP + streaks + achievements + personal best check), GET (paginated history), DELETE (remove session)
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

Session has optional adaptive fields: `adaptive`, `startingLevel`, `endingLevel`, `levelChanges`. UserProfile has `lastPlayedDate` (String, YYYY-MM-DD in user's local timezone) for reliable streak comparison alongside `lastPlayedAt` (DateTime). TrainingProgram tracks enrollment, `currentDay`, `status` (active/completed/abandoned), and `completedSessions` (JSON array of session IDs).

## Design System

### Theme: Light + Dark, Warm, Restrained (NYT Games-inspired)

Dark mode uses CSS custom properties defined in `src/index.css` (`:root` and `.dark` blocks). Tailwind semantic tokens reference `var(--color-*)` so all components auto-switch. Toggle via `.dark` class on `<html>`, managed by `src/lib/theme.ts`.

**Color Palette** (Light / Dark):
| Role | Light | Dark |
|------|-------|------|
| Page background (`surface`) | `#fafaf8` | `#1a1917` |
| Card background (`card`) | `#ffffff` | `#242321` |
| Card border (`card-border`) | `#e5e2d9` | `#3a3835` |
| Secondary surface | `#f5f5f0` | `#2a2927` |
| Primary accent | `#538d4e` (same both) | |
| Text primary | `#1a1a1a` | `#e8e6e3` |
| Text secondary | `#3a3a3a` | `#b8b5b0` |
| Text muted | `#787774` | `#8a8884` |

**Stimulus Colors** (softened, not neon): Position `#577fb5`, Color `#4a9ea8`, Shape `#8b6eae`, Number `#c4a035`, Audio `#b85c4e`

**Error-as-guidance feedback pattern**: Correct → green flash + tone, Miss/False alarm → gray flash (`flash-miss`), no error sound. Low scores use gray text, never red.

**Score color thresholds**: >=90% green (`#538d4e`), >=70% gold (`#c4a035`), >=50% amber (`#c47a3e`), <50% gray (text-muted)

**Animations**: `fade-in` (0.2s opacity), `fade-in-up` (0.25s translate+opacity), `bounce-in` (softened, scale 0.95→1), `shake` (3px). Removed: `glow`, `pulse-fast`, all `edge-glow-*` effects.

**Cards**: `bg-card border border-card-border rounded-2xl p-8 shadow-sm` (no glassmorphism)

**Buttons**: Primary = green bg + white text + `active:scale-[0.98]`. Secondary = outline style (transparent bg, warm gray border)

**Semantic Tailwind tokens** (defined in `tailwind.config.js`, backed by CSS variables): `surface`, `card`, `card-border`, `secondary-surface`, `text-primary`, `text-secondary`, `text-muted`, `primary-50` through `primary-950`. Tailwind `darkMode: 'class'` is configured but most dark mode works through CSS variable switching, not `dark:` prefixes

**Icons**: All decorative emojis replaced with SVG icon components in `components/icons/`. `AchievementDef.icon` field removed — achievements render category-based SVG icons via `<AchievementIcon category={...}>`. `StimulusIcon` renders per-type SVGs (grid, droplet, shapes, hash, speaker) used in match buttons

**Dashboard greeting**: Time-of-day based — "Good morning" (<12), "Good afternoon" (<17), "Good evening" (else). Subtitle: "Ready to train?" (new users) / "Welcome back" (returning)

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
- Dashboard has inline settings (no separate settings screen) — N-level picker (2 rows of 5, levels 1-10), mode selector (Mono/Dual/Triple/Quad presets), collapsible Advanced section (trials, interval, adaptive)
- History tab only visible to signed-in users (wrapped in `<SignedIn>` in Navbar)
- Programs screen shows sign-up prompt for unauthenticated users, with greyed-out preview of available programs
- Default mode is Dual (`['position', 'color']`). Mode presets: Mono (position), Dual (position+color), Triple (+shape), Quad (+number). Audio stimulus not in any preset
- GameGrid renders a single centered square when `position` is not in `activeStimuli`
- ResultsScreen propagates `newStreak` back to App.tsx via `onStreakUpdate` callback so the Navbar streak counter updates immediately after session save. App.tsx also passes `currentStreak` down to Dashboard so the CompactStatsCard always reflects the latest value (handles race condition where user navigates back before save completes)
- ResultsScreen shows animated XP level bar for signed-in users: bar fills from old progress to new progress with 1-second animation. Server returns `totalXp` in session save response to enable client-side threshold calculation
- ResultsScreen shows personal best celebration card (yellow border, `animate-fade-in-up`) when `isPersonalBest` is true. Server checks via `Session.findFirst` at the effective N-level excluding current session. First session at any N-level is always a personal best. Confetti fires for personal best (60 particles) in addition to level-up (80) and high score (40)
- ResultsScreen accuracy-by-type shows percentage + colored bar + hit/miss/false-alarm counts. Max combo widget removed. Save status only shown for `queued` and `error` states (no "Saving..."/"Session saved")
- ResultsScreen shows a "tomorrow hook" message after save — priority chain: program continuation > streak >=7 > streak 2-6 > achievement proximity (within 3 days of milestone) > personal best callback > generic fallback. `getLocalDate()` is exported from `lib/api.ts` for streak danger comparisons
- All API calls use `cache: 'no-store'` to prevent browser caching of stale profile/stats data
- CompactStatsCard combines level/rank, streak, total sessions, XP bar, 12-week activity heatmap, and streak danger indicator into one card. Streak danger shows a countdown banner with warm tinted backgrounds (`bg-[#f0f7ef]` >=8h, `bg-[#faf6e8]` 4-8h, `bg-[#faf0ee]` <4h) when `currentStreak > 0` and the user hasn't played today (compares `lastPlayedDate` vs `getLocalDate()`)
- History screen shows best-score-by-day chart (not average), avg-by-type, achievements grouped by category, and session list
- `server/lib/dates.ts` uses `formatToParts()` with `en-US` locale (not `en-CA`) because `node:20-alpine` ships with `small-icu` which only includes `en-US` — other locales silently fall back to wrong date formats
- Streak dates use client-provided `localDate` (YYYY-MM-DD) instead of server-side timezone conversion. The client sends `getLocalDate()` in both `saveSession` POST body and `getProfile` query params. Server stores `lastPlayedDate` (String) alongside `lastPlayedAt` (DateTime) for reliable date comparison — avoids Alpine small-icu timezone fallback causing UTC day boundary mismatches
- PWA service worker (`sw.js`) is generated at build time by `vite-plugin-pwa` (Workbox). Server serves `sw.js` with `Cache-Control: no-cache` so browsers always check for updates
- API routes use `NetworkOnly` caching strategy — never served from SW cache. Clerk requires network for auth
- Offline session queue lives in localStorage (`unreel-offline-sessions`). When `saveSession` fails due to network error, session is queued. App syncs on page load and on `online` event. Queued sessions skip XP bar, achievements, confetti, and streak updates on ResultsScreen
- Install prompt (`beforeinstallprompt`) only fires on Android/desktop Chrome — not available on iOS. Dismiss flag stored in `localStorage['unreel-install-dismissed']`. Hidden when app is already installed (checks `display-mode: standalone`)
- Dark mode theme is applied before React renders (`main.tsx` calls `applyTheme(getPreferredTheme())` synchronously) to prevent flash-of-wrong-theme. System preference listener only fires when no manual `unreel-theme` localStorage entry exists
- Navbar has sun/moon toggle button for theme switching. Sun shown in dark mode, moon in light mode
- `AchievementDef` no longer has an `icon` field — all achievement icons are rendered via `<AchievementIcon category={...}>` which selects from 6 category-based SVGs (sessions=play, streaks=flame, performance=target, combo=lightning, level=arrow-up, modes=grid)
- Match buttons use `StimulusIcon` + key hint, equal-width (`flex-1`) in a single row — no left/right hand split or divider. No per-button feedback; only grid flash feedback
- `ComboCounter` always renders a fixed `h-10` container (never returns `null`) to prevent layout jitter when combo activates
- Game screen has `px-4` horizontal padding for mobile
- Tutorial completion is an overlay dialog (same style as `TutorialOverlay` steps), not a separate full-screen view
- Tutorial uses `pressedRef` (useRef) alongside `pressedThisTrial` state to avoid stale closure in timer-fired `advanceToNextTrial` — the ref is always current, the state drives UI
- CSS variable opacity limitation: Tailwind's `/50` opacity modifier doesn't work with `var()` values — use full-opacity semantic tokens instead (e.g., `bg-secondary-surface` not `bg-card/50`)
- Programs "Available Programs" section does not show "Currently active" label (active program only shown on Dashboard via `ProgramCard`)

## Git

- Remote: `git@github.com:cyrus123live/n-back-game.git`
- Branch: `main`
- Always commit and push when asked

## Workflow

- After every set of changes, update this CLAUDE.md file to reflect the current state of the codebase, then commit and push
