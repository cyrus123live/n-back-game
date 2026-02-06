# Unreel Product Roadmap — Hook Model Improvements

Mission: Strengthen working memory for as many people as possible.

This roadmap applies Nir Eyal's Hook Model (Trigger → Action → Variable Reward → Investment) to identify and prioritize improvements that will increase user retention and habit formation.

---

## Current State Audit

| Hook Phase | Grade | Summary |
|---|---|---|
| **Trigger** | D | Zero external triggers. No push notifications, emails, or reminders. Internal triggers are weak — streak fire emoji and heatmap gaps provide mild pull but nothing compels return. |
| **Action** | A | Excellent. One-tap start, inline settings, daily challenge card, tutorial for new users. Minimal friction. |
| **Variable Reward** | B- | Good mastery rewards (Rewards of Self: scores, XP, levels, achievements). Decent hunt rewards (combo XP, achievement unlocks). Zero social rewards (Rewards of Tribe). |
| **Investment** | B | Solid data investment (session history, streaks, XP). Programs create commitment. But investment doesn't reliably load the next trigger — users must self-initiate return. |

**Overall: C+** — Strong core loop, but users who close the browser have no reason to come back except willpower.

---

## Phase 1: Close the Trigger Gap (P0)

The single biggest weakness. Without external triggers, the entire Hook cycle depends on users remembering to return. Every other improvement is less effective without this. Start with the cheapest wins, then build toward push infrastructure.

### 1.1 Streak Danger Indicator
**Priority:** P0 | **Complexity:** S | **Impact:** Medium

Visual countdown on dashboard: "Streak expires in 6h 23m". Changes color as deadline approaches (green → yellow → red). Creates urgency without requiring any infrastructure.

Requires: Frontend-only. Add countdown timer to CompactStatsCard or Navbar streak display.

### 1.2 Post-Session "Tomorrow" Hook
**Priority:** P0 | **Complexity:** S | **Impact:** Medium-High

After completing a session, show a forward-looking message:
- "Come back tomorrow to keep your 8-day streak alive"
- "Tomorrow's daily challenge: 4-back with 3 stimuli — ready?"
- "2 more sessions until your next achievement"
- "Your program continues with Day 9 tomorrow"

Loads the next trigger by giving the user a specific reason to return. Two small features (1.1 + 1.2) can ship in a day and immediately improve retention before the heavier infrastructure work begins.

Requires: Logic to select most relevant "tomorrow" message, display on ResultsScreen after save.

### 1.3 PWA / Add to Home Screen
**Priority:** P0 | **Complexity:** M | **Impact:** High

Full Progressive Web App support — manifest.json, service worker, install prompt. Getting the app icon on a user's home screen is the most powerful owned trigger. The icon itself is a daily reminder. Also enables offline play (see 1.5).

Requires: Web app manifest, service worker for offline shell, install prompt UX, app icons at multiple sizes.

### 1.4 Browser Push Notifications
**Priority:** P0 | **Complexity:** L | **Impact:** High

Add Web Push API support (service worker + VAPID keys). Notification types:
- **Streak at risk** — Evening reminder if user hasn't played today ("Your 12-day streak expires at midnight!")
- **Daily challenge available** — Morning notification with challenge preview
- **Program nudge** — "Day 8 of Beginner Foundation is waiting for you"
- **Win-back** — After 3+ days inactive ("Your brain misses you. Quick 2-back session?")

Depends on PWA service worker from 1.3. Ship push as a follow-up once the service worker foundation is in place.

Requires: Service worker registration, push subscription storage in DB (new `PushSubscription` model), notification permission prompt UX, server-side push sending (web-push npm package), opt-in settings.

### 1.5 Offline Play
**Priority:** P1 | **Complexity:** M | **Impact:** Medium

Since PWA (1.3) already introduces a service worker, extend it to cache the app shell and game assets for offline use. N-back is a self-contained game — it doesn't need a network connection to play. Sessions sync to the server when connectivity returns.

This removes a real friction point: training on a subway, plane, or anywhere with spotty signal. Every session that would have been skipped due to connectivity is a retained user.

Requires: Service worker cache strategy (app shell + static assets), offline session queue in IndexedDB or localStorage, sync-on-reconnect logic, conflict resolution for XP/streaks.

---

## Phase 2: Social Layer (P1)

The app has zero social features. This is an entire missing class of variable reward. Humans are deeply motivated by social validation and comparison. Social features also drive organic growth — every share is free acquisition.

### 2.1 Daily Challenge Leaderboard
**Priority:** P1 | **Complexity:** M | **Impact:** High

Show today's top scores for the daily challenge. Anonymous by default (display Clerk username or "Player #1234"). Seeing other people's scores creates competition and social proof ("847 players completed today's challenge").

Requires: New API endpoint for leaderboard data, leaderboard UI component on dashboard/daily challenge card, privacy settings.

### 2.2 Share Results Card
**Priority:** P1 | **Complexity:** S | **Impact:** Medium-High

"Share" button on ResultsScreen that generates a shareable image/card (score, N-level, streak, achievement). Uses Canvas API or html-to-image. Share via Web Share API (mobile) or copy-to-clipboard (desktop).

This doubles as a growth mechanism — friends seeing shared results discover the app. Every share is a relationship trigger and a free acquisition channel.

Requires: Card generation (canvas or html-to-image), Web Share API integration, share button on results screen.

### 2.3 Friend Challenges
**Priority:** P1 | **Complexity:** M-L | **Impact:** High

Challenge a friend to beat your score on a specific configuration. Send challenge link, friend plays same settings, compare results. Creates relationship triggers (notifications when friend completes challenge).

This is the highest-ceiling growth feature on the roadmap. A challenge link is a personalized invitation that carries social obligation to respond. Scope it to v1: shareable link + comparison page. Skip real-time notifications for now.

Requires: Challenge model in DB, shareable challenge links, comparison UI. V2: notifications when friend completes.

### 2.4 Community Stats Banner
**Priority:** P2 | **Complexity:** S | **Impact:** Low-Medium

Dashboard banner: "1,247 sessions completed today" or "342 players training right now." Social proof that others are using the app. Simple server aggregate query.

Requires: New API endpoint for aggregate stats, banner component on dashboard.

---

## Phase 3: Enhanced Variable Rewards (P1)

Strengthen the existing reward mechanisms and add new sources of unpredictability.

### 3.1 Personal Best Celebrations
**Priority:** P1 | **Complexity:** S | **Impact:** Medium

Track and celebrate new personal records. "New personal best at 3-back!" with special animation/confetti. Compare current session to best-ever at same N-level. Show on ResultsScreen.

Requires: Query best score per N-level from session history, comparison logic in ResultsScreen, celebration UI.

### 3.2 Post-Session Insights (Variable)
**Priority:** P1 | **Complexity:** M | **Impact:** Medium

Rotating, context-aware insights on the results screen. Different each session:
- "Your audio accuracy improved 18% over the last week"
- "You've trained 3 days in a row — consistency builds working memory"
- "Your position accuracy is your strongest — try adding more stimuli"
- "You're now in the top 20% of 3-back players"
- "12 more sessions until Marathon Runner achievement"

The variability keeps the results screen interesting instead of formulaic.

Requires: Insight generation logic (compare to history, calculate trends), insight pool with templates, selection algorithm (rotate, don't repeat).

### 3.3 Hidden/Secret Achievements
**Priority:** P2 | **Complexity:** S | **Impact:** Low-Medium

Add 5-10 secret achievements that show as "???" in the achievement grid until unlocked. Examples:
- "Night Owl" — Complete a session after midnight
- "Speed Demon" — Score 90%+ with 1.5s interval
- "Comeback Kid" — Score 90%+ after scoring below 50% previous session
- "Versatile" — Play every N-level from 2 to 5

Creates Reward of the Hunt — users discover achievements through exploration.

Requires: New achievement definitions, hidden flag in achievement display, unlock logic.

### 3.4 Bonus XP Events
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

Time-limited XP multipliers. "Weekend Warrior: 2x XP all weekend" or "Happy Hour: 3x XP for the next 2 hours." Creates urgency and variable reward timing.

Requires: Event schedule system (could be simple cron-based or date-driven), XP multiplier application, event banner on dashboard.

---

## Phase 4: Training Effectiveness (P1)

The mission is to strengthen working memory. Retention features are worthless if the training itself isn't effective enough to produce results users can feel. These items directly improve training quality.

### 4.1 Plateau Detection & Guidance
**Priority:** P1 | **Complexity:** M | **Impact:** High

The current adaptive system only evaluates between sessions (>=85% up, <=50% down). A user stuck at 3-back for 10+ sessions with no improvement has no feedback and no path forward — this is a silent churn risk.

Add plateau detection: if accuracy has been flat (±5%) for 5+ sessions at the same N-level, surface guidance:
- "You've been steady at 3-back. Try focusing on just your weakest stimulus type"
- "Consider dropping to 2-back with more stimuli to build a stronger foundation"
- "Try a shorter interval to increase challenge without raising N-level"

This turns a frustration point into a coaching moment.

Requires: Trend analysis on recent session history, guidance template pool, display on dashboard or results screen. Optionally feed into adaptive recommendations.

### 4.2 Goal Setting
**Priority:** P1 | **Complexity:** M | **Impact:** High

Let users set goals: "Train 5 times this week", "Reach 3-back this month", "Get 90%+ accuracy on dual 3-back." Display progress toward goals on dashboard. Incomplete goals create internal triggers (Zeigarnik effect — unfinished tasks nag at you).

Requires: Goal model in DB (or localStorage for simple version), goal-setting UI in dashboard/settings, progress tracking display.

### 4.3 Science-Backed Motivation
**Priority:** P2 | **Complexity:** S | **Impact:** Low-Medium

Brief, rotating "Did you know?" cards on the dashboard referencing working memory research. "Working memory training has been shown to improve fluid intelligence (Jaeggi et al., 2008)." Builds conviction that the training is worthwhile and reinforces the "mental fitness" framing.

Requires: Content curation, rotating card component on dashboard.

---

## Phase 5: Onboarding & Retention (P2)

Convert more new users into habitual users and win back lapsed ones.

### 5.1 Program Recommendation
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

After first session or tutorial, recommend a training program based on performance. "Based on your score, we recommend Beginner Foundation." Reduces decision paralysis and increases program enrollment (investment).

Requires: Recommendation logic, prompt UI on results screen for first session.

### 5.2 Weekly Progress Summary
**Priority:** P2 | **Complexity:** M | **Impact:** Medium

End-of-week summary screen (or notification): sessions completed, accuracy trend, streak status, achievements earned, XP gained. Reinforces investment and triggers reflection. Show on first visit after Sunday.

Requires: Summary computation logic, summary UI (modal or dedicated view), trigger timing.

### 5.3 Win-Back Flow
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

Special welcome-back experience for lapsed users (7+ days inactive):
- "Welcome back! A lot has happened..."
- Lower the bar: suggest an easy session (2-back, fewer stimuli)
- Highlight what they've missed (new daily challenges, XP they could have earned)
- Don't guilt-trip — encourage

Requires: Lapsed-user detection (compare lastPlayedAt), welcome-back UI on dashboard, easy-start suggestion logic.

### 5.4 Goal-Setting Onboarding Flow
**Priority:** P2 | **Complexity:** M | **Impact:** Medium

After tutorial completion, ask: "What's your goal?" Options like "Sharpen my focus," "Improve my memory," "Challenge myself daily." Personalizes the experience and creates commitment (consistency principle).

Requires: Onboarding flow screens, goal storage, personalized dashboard messaging.

### 5.5 Email Digest
**Priority:** P2 | **Complexity:** L | **Impact:** Medium

Weekly progress summary email. A second external trigger channel for users who don't enable push notifications.

Requires: Email collection (Clerk has email), email service integration (Resend/SendGrid), unsubscribe handling, and email templates.

---

## Phase 6: Polish & Deepen (P3)

Lower-certainty or higher-complexity items. Build these after validating that Phases 1-5 are moving retention metrics.

### 6.1 Session Scheduling / Training Plan
**Priority:** P3 | **Complexity:** M | **Impact:** Medium

Let users declare which days they plan to train (e.g., Mon/Wed/Fri/Sat). Show "Training day!" badge on scheduled days. Feed into push notification timing. Creates pre-commitment.

Requires: Schedule storage (profile field), schedule UI in settings, notification integration.

### 6.2 Pre/Post Mood Check (Micro-Journal)
**Priority:** P3 | **Complexity:** M | **Impact:** Medium

Optional 1-tap mood check before and after sessions (5-point emoji scale). Over time, shows users that training improves their mood/focus. Builds the internal trigger: "I feel foggy → I should do N-back." Also creates valuable personal data (investment).

Requires: Mood tracking UI, storage (session fields or separate model), mood trend visualization in history.

### 6.3 Profile Customization / Cosmetics
**Priority:** P3 | **Complexity:** L | **Impact:** Medium

Unlock visual customizations through play: grid color themes, background patterns, achievement badges displayed on profile. IKEA effect — users value what they've customized. Increases switching cost.

Requires: Theme/cosmetic system, unlock conditions, profile display, theme application to game UI.

### 6.4 Progressive Feature Discovery
**Priority:** P3 | **Complexity:** M | **Impact:** Low

Don't show all features on day one. Reveal achievements after session 3, programs after session 5, advanced settings after reaching 3-back. Prevents overwhelm and creates "new feature" surprises (variable reward).

Requires: Feature gating logic based on session count/level, progressive UI reveals.

---

## Implementation Priority Matrix

| Priority | Items | Rationale |
|---|---|---|
| **P0 — Do First** | 1.1 Streak Danger, 1.2 Tomorrow Hook, 1.3 PWA, 1.4 Push Notifications | Closes the critical external trigger gap. Ship 1.1 + 1.2 immediately (both S complexity), then build PWA + push infrastructure. |
| **P1 — High Impact** | 1.5 Offline Play, 2.1 Leaderboard, 2.2 Share Results, 2.3 Friend Challenges, 3.1 Personal Bests, 3.2 Post-Session Insights, 4.1 Plateau Detection, 4.2 Goal Setting | Adds social layer + growth loop, strengthens variable rewards, improves training effectiveness, and creates investment → trigger loops. |
| **P2 — Medium Impact** | 2.4 Community Stats, 3.3 Hidden Achievements, 3.4 Bonus XP, 4.3 Science Cards, 5.1 Program Rec, 5.2 Weekly Summary, 5.3 Win-Back, 5.4 Goal Onboarding, 5.5 Email Digest | Polishes and deepens each Hook phase. |
| **P3 — Nice to Have** | 6.1 Scheduling, 6.2 Mood Tracking, 6.3 Cosmetics, 6.4 Progressive Discovery | Higher complexity or lower certainty of impact. Build after validating earlier phases. |

---

## Suggested Ship Order

The priority matrix groups by impact tier, but within each tier the order matters. Here's a concrete sequence optimized for cumulative value:

**Sprint 1 — Quick wins (S complexity, immediate retention lift)**
1. Streak Danger Indicator (1.1)
2. Post-Session Tomorrow Hook (1.2)
3. Personal Best Celebrations (3.1)

**Sprint 2 — PWA foundation**
4. PWA / Add to Home Screen (1.3)
5. Offline Play (1.5)

**Sprint 3 — Social + growth**
6. Share Results Card (2.2)
7. Daily Challenge Leaderboard (2.1)
8. Friend Challenges v1 (2.3)

**Sprint 4 — Push notifications**
9. Browser Push Notifications (1.4)

**Sprint 5 — Training depth**
10. Plateau Detection & Guidance (4.1)
11. Post-Session Insights (3.2)
12. Goal Setting (4.2)

**Then:** P2 items based on what metrics show after Sprints 1-5.

---

## Removed Items

The following items from the original roadmap were cut:

- **Daily Login Reward** — Giving XP for opening the app without training dilutes the meaning of the progression system and conflicts with the mission. XP should represent actual cognitive work. The streak already rewards daily consistency.
- **Framing as Mental Fitness Routine (copy rewrite)** — Internal triggers form organically after weeks of use. A copy audit is low-effort but also low-impact; the language will evolve naturally as the product matures. Not worth a dedicated initiative.

---

## Complexity Key

- **S (Small):** Frontend-only or minimal backend change. 1-2 files.
- **M (Medium):** Frontend + backend changes. New API endpoints or DB fields.
- **L (Large):** New infrastructure (service workers, push servers, email services). Multiple new models/endpoints.
