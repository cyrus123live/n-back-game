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

## Phase 1: External Triggers (P0 — Critical Gap)

The single biggest weakness. Without external triggers, the entire Hook cycle depends on users remembering to return. Every other improvement is less effective without this.

### 1.1 Browser Push Notifications
**Priority:** P0 | **Complexity:** L | **Impact:** High

Add Web Push API support (service worker + VAPID keys). Notification types:
- **Streak at risk** — Evening reminder if user hasn't played today ("Your 12-day streak expires at midnight!")
- **Daily challenge available** — Morning notification with challenge preview
- **Program nudge** — "Day 8 of Beginner Foundation is waiting for you"
- **Win-back** — After 3+ days inactive ("Your brain misses you. Quick 2-back session?")

Requires: Service worker registration, push subscription storage in DB (new `PushSubscription` model), notification permission prompt UX, server-side push sending (web-push npm package), opt-in settings.

### 1.2 PWA / Add to Home Screen
**Priority:** P0 | **Complexity:** M | **Impact:** High

Full Progressive Web App support — manifest.json, service worker, install prompt. Getting the app icon on a user's home screen is the most powerful owned trigger. The icon itself is a daily reminder.

Requires: Web app manifest, service worker for offline shell, install prompt UX, app icons at multiple sizes.

### 1.3 Streak Danger Indicator
**Priority:** P0 | **Complexity:** S | **Impact:** Medium

Visual countdown on dashboard: "Streak expires in 6h 23m". Changes color as deadline approaches (green → yellow → red). Creates urgency without requiring push notifications.

Requires: Frontend-only. Add countdown timer to CompactStatsCard or Navbar streak display.

### 1.4 Email Digest (Optional / Later)
**Priority:** P2 | **Complexity:** L | **Impact:** Medium

Weekly progress summary email. Requires email collection (Clerk has email), email service integration (Resend/SendGrid), unsubscribe handling, and email templates.

---

## Phase 2: Social Rewards — Rewards of the Tribe (P1)

The app has zero social features. This is an entire missing class of variable reward. Humans are deeply motivated by social validation and comparison.

### 2.1 Daily Challenge Leaderboard
**Priority:** P1 | **Complexity:** M | **Impact:** High

Show today's top scores for the daily challenge. Anonymous by default (display Clerk username or "Player #1234"). Seeing other people's scores creates competition and social proof ("847 players completed today's challenge").

Requires: New API endpoint for leaderboard data, leaderboard UI component on dashboard/daily challenge card, privacy settings.

### 2.2 Share Results Card
**Priority:** P1 | **Complexity:** S | **Impact:** Medium

"Share" button on ResultsScreen that generates a shareable image/card (score, N-level, streak, achievement). Uses Canvas API or html-to-image. Share via Web Share API (mobile) or copy-to-clipboard (desktop).

This doubles as a relationship trigger — friends seeing shared results discover the app.

Requires: Card generation (canvas or html-to-image), Web Share API integration, share button on results screen.

### 2.3 Community Stats Banner
**Priority:** P2 | **Complexity:** S | **Impact:** Low-Medium

Dashboard banner: "1,247 sessions completed today" or "342 players training right now." Social proof that others are using the app. Simple server aggregate query.

Requires: New API endpoint for aggregate stats, banner component on dashboard.

### 2.4 Friend Challenges
**Priority:** P3 | **Complexity:** L | **Impact:** High

Challenge a friend to beat your score on a specific configuration. Send challenge link, friend plays same settings, compare results. Creates relationship triggers (notifications when friend completes challenge).

Requires: Challenge model in DB, shareable challenge links, comparison UI, notifications.

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

### 3.5 Daily Login Reward
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

Escalating daily bonus just for opening the app (before playing). Day 1: 5 XP, Day 2: 10 XP... Day 7: 50 XP, then resets. Creates a micro-streak within the main streak. The variable escalation mimics slot machine psychology.

Requires: Track consecutive daily logins (separate from play streak), reward display on dashboard, XP grant.

---

## Phase 4: Investment → Next Trigger (P1)

Make each session plant the seed for the next return visit.

### 4.1 Goal Setting
**Priority:** P1 | **Complexity:** M | **Impact:** High

Let users set goals: "Train 5 times this week", "Reach 3-back this month", "Get 90%+ accuracy on dual 3-back." Display progress toward goals on dashboard. Incomplete goals create internal triggers (Zeigarnik effect — unfinished tasks nag at you).

Requires: Goal model in DB (or localStorage for simple version), goal-setting UI in dashboard/settings, progress tracking display.

### 4.2 Session Scheduling / Training Plan
**Priority:** P2 | **Complexity:** M | **Impact:** Medium

Let users declare which days they plan to train (e.g., Mon/Wed/Fri/Sat). Show "Training day!" badge on scheduled days. Feed into push notification timing. Creates pre-commitment.

Requires: Schedule storage (profile field), schedule UI in settings, notification integration.

### 4.3 Post-Session "Tomorrow" Hook
**Priority:** P1 | **Complexity:** S | **Impact:** Medium

After completing a session, show a forward-looking message:
- "Come back tomorrow to keep your 8-day streak alive"
- "Tomorrow's daily challenge: 4-back with 3 stimuli — ready?"
- "2 more sessions until your next achievement"
- "Your program continues with Day 9 tomorrow"

Loads the next trigger by giving the user a specific reason to return.

Requires: Logic to select most relevant "tomorrow" message, display on ResultsScreen after save.

### 4.4 Profile Customization / Cosmetics
**Priority:** P3 | **Complexity:** L | **Impact:** Medium

Unlock visual customizations through play: grid color themes, background patterns, achievement badges displayed on profile. IKEA effect — users value what they've customized. Increases switching cost.

Requires: Theme/cosmetic system, unlock conditions, profile display, theme application to game UI.

---

## Phase 5: Internal Trigger Formation (P2)

Help users build the mental association: "I feel [X] → I should train my brain."

### 5.1 Framing as Mental Fitness Routine
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

Reframe copy throughout the app. Not "play a game" but "train your brain." Not "score" but "performance." Not "session" but "workout." Consistent language that positions N-back as a daily mental health practice alongside meditation or exercise.

Requires: Copy audit and rewrite across dashboard, results, programs. No structural changes.

### 5.2 Pre/Post Mood Check (Micro-Journal)
**Priority:** P3 | **Complexity:** M | **Impact:** Medium

Optional 1-tap mood check before and after sessions (5-point emoji scale). Over time, shows users that training improves their mood/focus. Builds the internal trigger: "I feel foggy → I should do N-back." Also creates valuable personal data (investment).

Requires: Mood tracking UI, storage (session fields or separate model), mood trend visualization in history.

### 5.3 Science-Backed Motivation
**Priority:** P2 | **Complexity:** S | **Impact:** Low-Medium

Brief, rotating "Did you know?" cards on the dashboard referencing working memory research. "Working memory training has been shown to improve fluid intelligence (Jaeggi et al., 2008)." Builds conviction that the training is worthwhile.

Requires: Content curation, rotating card component on dashboard.

---

## Phase 6: Onboarding Improvements (P2)

Convert more new users into habitual users by building investment during the first session.

### 6.1 Goal-Setting Onboarding Flow
**Priority:** P2 | **Complexity:** M | **Impact:** Medium

After tutorial completion, ask: "What's your goal?" Options like "Sharpen my focus," "Improve my memory," "Challenge myself daily." Personalizes the experience and creates commitment (consistency principle).

Requires: Onboarding flow screens, goal storage, personalized dashboard messaging.

### 6.2 Program Recommendation
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

After first session or tutorial, recommend a training program based on performance. "Based on your score, we recommend Beginner Foundation." Reduces decision paralysis and increases program enrollment (investment).

Requires: Recommendation logic, prompt UI on results screen for first session.

### 6.3 Progressive Feature Discovery
**Priority:** P3 | **Complexity:** M | **Impact:** Low

Don't show all features on day one. Reveal achievements after session 3, programs after session 5, advanced settings after reaching 3-back. Prevents overwhelm and creates "new feature" surprises (variable reward).

Requires: Feature gating logic based on session count/level, progressive UI reveals.

---

## Phase 7: Retention & Win-Back (P1)

### 7.1 Weekly Progress Summary
**Priority:** P1 | **Complexity:** M | **Impact:** Medium

End-of-week summary screen (or notification): sessions completed, accuracy trend, streak status, achievements earned, XP gained. Reinforces investment and triggers reflection.

Requires: Summary computation logic, summary UI (modal or dedicated view), trigger timing (first visit after Sunday).

### 7.2 Win-Back Flow
**Priority:** P2 | **Complexity:** S | **Impact:** Medium

Special welcome-back experience for lapsed users (7+ days inactive):
- "Welcome back! A lot has happened..."
- Lower the bar: suggest an easy session (2-back, fewer stimuli)
- Highlight what they've missed (new daily challenges, XP they could have earned)
- Don't guilt-trip — encourage

Requires: Lapsed-user detection (compare lastPlayedAt), welcome-back UI on dashboard, easy-start suggestion logic.

---

## Implementation Priority Matrix

| Priority | Items | Rationale |
|---|---|---|
| **P0 — Do First** | 1.1 Push Notifications, 1.2 PWA, 1.3 Streak Danger | Closes the critical external trigger gap. Everything else is less effective without this. |
| **P1 — High Impact** | 2.1 Leaderboard, 2.2 Share Results, 3.1 Personal Bests, 3.2 Post-Session Insights, 4.1 Goal Setting, 4.3 Tomorrow Hook, 7.1 Weekly Summary | Adds social rewards, strengthens variable rewards, and creates investment → trigger loops. |
| **P2 — Medium Impact** | 1.4 Email, 2.3 Community Stats, 3.3 Hidden Achievements, 3.4 Bonus XP, 3.5 Daily Login Reward, 4.2 Scheduling, 5.1 Reframing, 5.3 Science Cards, 6.1 Goal Onboarding, 6.2 Program Rec, 7.2 Win-Back | Polishes and deepens each Hook phase. |
| **P3 — Nice to Have** | 2.4 Friend Challenges, 4.4 Cosmetics, 5.2 Mood Tracking, 6.3 Progressive Discovery | Higher complexity or lower certainty of impact. |

---

## Complexity Key

- **S (Small):** Frontend-only or minimal backend change. 1-2 files. A few hours.
- **M (Medium):** Frontend + backend changes. New API endpoints or DB fields. ~1 day.
- **L (Large):** New infrastructure (service workers, push servers, email services). Multiple new models/endpoints. Multi-day effort.
