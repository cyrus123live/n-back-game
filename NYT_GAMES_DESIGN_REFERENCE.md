# New York Times Games Design Language Reference

A comprehensive analysis of the NYT Games design system, compiled from public sources, design analyses, open-source recreations, and official NYT team publications.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Layout & Spacing](#4-layout--spacing)
5. [Game UI Patterns](#5-game-ui-patterns)
6. [Interaction Patterns & Animations](#6-interaction-patterns--animations)
7. [Results & Sharing](#7-results--sharing)
8. [Statistics & Streaks](#8-statistics--streaks)
9. [Onboarding & Tutorials](#9-onboarding--tutorials)
10. [Gamification & Engagement](#10-gamification--engagement)
11. [Branding & Identity](#11-branding--identity)
12. [Mobile vs Desktop](#12-mobile-vs-desktop)
13. [Accessibility](#13-accessibility)
14. [Daily Ritual Design](#14-daily-ritual-design)
15. [Difficulty & Progression](#15-difficulty--progression)
16. [Error Handling](#16-error-handling)
17. [Navigation](#17-navigation)
18. [Notifications](#18-notifications)
19. [Monetization](#19-monetization)
20. [Patterns Transferable to Cognitive Training Apps](#20-patterns-transferable-to-cognitive-training-apps)
21. [Sources](#21-sources)

---

## 1. Design Philosophy

NYT Games operates under a distinct design philosophy that balances playfulness with the gravitas of the NYT brand:

### Core Principles

- **"Time well spent"**: The 2024 redesign was framed around emphasizing time well spent — building vocabulary, connecting players across generations, adding smart fun to daily routines.
- **Respectful of time**: Jonathan Knight (Head of NYT Games): "We're respectful of your time. We're not trying to get you in the app all day. We're not nagging you to come back in. We don't want 24/7 engagement. We want a very healthy daily habit where you feel good about what you've done."
- **Come back tomorrow, not stay longer**: Knight explicitly states he doesn't want users to stay in the app longer — he wants them to come back tomorrow.
- **Human-crafted**: "We want you to know a human made this for you today." Connections is made by one person every single day and tested. Even Wordle is programmed week-to-week to ensure the flow feels right.
- **Shared experience**: "The puzzle is the same for everyone. We're all trying to beat the New York Times together."
- **Minimalism with purpose**: Clean, uncluttered interfaces where the puzzle is the star. No unnecessary decoration.
- **Playful-yet-sophisticated tone**: The design team faced the challenge of merging the vibrant, playful design of games into the more subdued and serious aesthetic of the news brand, solved through close collaboration between product design and brand identity teams.

### Design Team Structure

- **Jonathan Knight** — Head of NYT Games (previously EA, Zynga, Warner Bros)
- **Zoe Bell** — Executive Producer of Games (previously Zynga, Big Huge Games)
- The team has tested 120 prototypes since the Wordle acquisition, with only 3 (Connections, Strands, Pips) making it to full release. Every prototype runs through a rigorous greenlight process with retention as the deciding factor.

### Recognition

- Won the **2024 Apple Design Award** in the "Delight and Fun" category
- Described by Apple as providing "memorable, engaging and satisfying experiences"
- Puzzles were collectively played over **11.2 billion times in 2025**

---

## 2. Color Palette

### Wordle Colors

#### Light Theme (Default)

| Role | Hex | Description |
|------|-----|-------------|
| Correct (Green) | `#6aaa64` | Letter is in the word AND in the correct position |
| Present (Yellow) | `#c9b458` | Letter is in the word but in the wrong position |
| Absent (Gray) | `#787c7e` | Letter is not in the word |
| Color Tone 1 | `#1a1a1b` | Darkest text / primary text |
| Color Tone 2 | `#787c7e` | Secondary text / absent key |
| Color Tone 3 | `#878a8c` | Tertiary text |
| Color Tone 4 | `#d3d6da` | Empty tile border / unused key background |
| Color Tone 5 | `#edeff1` | Page background accent |
| Color Tone 6 | `#f6f7f8` | Light background |
| Color Tone 7 | `#ffffff` | White / page background |

#### Dark Theme

| Role | Hex | Description |
|------|-----|-------------|
| Correct (Green) | `#538d4e` | Darkened green for dark backgrounds |
| Present (Yellow) | `#b59f3b` | Darkened yellow for dark backgrounds |
| Absent (Gray) | `#3a3a3c` | Dark gray for absent letters |
| Color Tone 1 | `#d7dadc` | Primary text (light on dark) |
| Color Tone 2 | `#818384` | Secondary text |
| Color Tone 3 | `#565758` | Tertiary / borders |
| Color Tone 4 | `#3a3a3c` | Empty tile border / key background |
| Color Tone 5 | `#272729` | Surface background |
| Color Tone 6 | `#1a1a1b` | Darker surface |
| Color Tone 7 | `#121213` | Page background (near-black) |

#### High Contrast / Colorblind Mode

| Role | Hex | Description |
|------|-----|-------------|
| Correct | `#f5793a` | Orange (replaces green) |
| Present | `#85c0f9` | Blue (replaces yellow) |

#### CSS Custom Properties Structure

Wordle uses a CSS custom properties system for theming:

```css
:root {
  --green: #6aaa64;
  --darkendGreen: #538d4e;
  --yellow: #c9b458;
  --darkendYellow: #b59f3b;
  --lightGray: #d8d8d8;
  --gray: #86888a;
  --darkGray: #939598;
  --white: #fff;
  --black: #212121;

  /* Theme-dependent (light mode defaults) */
  --color-correct: var(--green);
  --color-present: var(--yellow);
  --color-absent: var(--color-tone-2);

  --color-tone-1: #1a1a1b;
  --color-tone-2: #787c7e;
  --color-tone-3: #878a8c;
  --color-tone-4: #d3d6da;
  --color-tone-5: #edeff1;
  --color-tone-6: #f6f7f8;
  --color-tone-7: #ffffff;

  /* Keyboard colors derive from main colors */
  --key-bg-correct: var(--color-correct);
  --key-bg-present: var(--color-present);
  --key-bg-absent: var(--color-absent);
}

/* Dark theme overrides */
.nightmode {
  --color-correct: var(--darkendGreen);
  --color-present: var(--darkendYellow);

  --color-tone-1: #d7dadc;
  --color-tone-2: #818384;
  --color-tone-3: #565758;
  --color-tone-4: #3a3a3c;
  --color-tone-5: #272729;
  --color-tone-6: #1a1a1b;
  --color-tone-7: #121213;
}

/* High contrast overrides */
.colorblind {
  --color-correct: #f5793a;  /* orange */
  --color-present: #85c0f9;  /* blue */
}
```

### Connections Colors

Categories are color-coded by difficulty (easiest to hardest):

| Difficulty | Color | Approximate Hex | Emoji |
|-----------|-------|-----------------|-------|
| Easiest | Yellow | `#f9df6d` | :large_yellow_square: |
| Easy | Green | `#a0c35a` | :large_green_square: |
| Medium | Blue | `#b0c4ef` | :large_blue_square: |
| Hardest | Purple | `#ba81c5` | :large_purple_square: |

Unselected tiles use a neutral light gray (`#efefe6` approximately). Selected tiles darken slightly before submission.

### Strands Colors

| Element | Color | Description |
|---------|-------|-------------|
| Theme words | Blue | Highlighted when found |
| Spangram | Yellow | The special theme-describing word |
| Grid background | Light/neutral | Clean word search grid |

### Spelling Bee Colors

| Element | Color | Description |
|---------|-------|-------------|
| Center hexagon | Yellow / Gold | The required letter — always prominent |
| Outer hexagons | Light gray | The 6 optional letters |
| Background | White | Clean, minimal |

### General NYT Games Palette

A broader NYT Games palette documented on color-hex includes:

| Hex | Usage Context |
|-----|---------------|
| `#f7da21` | Primary yellow / highlight |
| `#b5e352` | Success green |
| `#e05c56` | Error / alert red |
| `#00a2b3` | Accent teal |
| `#fb9b00` | Secondary orange |

---

## 3. Typography

### Font Families

NYT uses a suite of custom fonts designed by Matthew Carter and Font Bureau:

| Font | Weight | Usage |
|------|--------|-------|
| **NYT Karnak Condensed** | 700 (Bold) | Game titles, section headers (e.g., "Wordle", "Connections" headers) |
| **NYT Franklin** | 700 (Bold) | In-game text, tile letters, body text, navigation, meta info |
| **NYT Franklin** | 400-500 | Secondary text, descriptions |
| **NYT Cheltenham** | Various | Headlines in editorial/news context (rarely in games) |
| **NYT Imperial** | Various | Body copy in iPad app editorial sections |

### System Font Fallbacks (Games)

When custom fonts are unavailable (especially on different platforms):

| Platform | Fallback |
|----------|----------|
| iOS / macOS | Helvetica Neue |
| Windows | Arial |
| Android | Roboto |

### Type Hierarchy in Games

| Element | Font | Size (approx) | Weight | Notes |
|---------|------|----------------|--------|-------|
| Game title | NYT Karnak Condensed | 28-36px | 700 | Uppercase or title case |
| Tile letters (Wordle) | NYT Franklin | 32-36px | 700 | Uppercase, centered in tile |
| Keyboard keys | NYT Franklin / system | 13-14px | 600-700 | Uppercase |
| Stats numbers | NYT Franklin | 36-48px | 700 | Large, prominent |
| Stats labels | NYT Franklin | 11-12px | 400 | Small, subdued |
| Modal headings | NYT Karnak Condensed | 20-24px | 700 | "How to Play", "Statistics" |
| Body text | NYT Franklin | 14-16px | 400 | Instructions, descriptions |
| Toast messages | NYT Franklin | 14px | 600 | Centered, white on dark |
| Button text | NYT Franklin | 16-20px | 700 | Uppercase or title case |

### Key Typography Characteristics

- **Letter spacing**: Tile letters use wider letter-spacing for readability; body text uses default
- **Text transform**: Tile letters are always uppercase. Navigation is mixed case. Buttons vary.
- **Line height**: Generous (1.4-1.6) for body text; tight (1.0-1.1) for display numbers
- **Number styling**: Statistics use tabular (monospaced) figures for alignment

---

## 4. Layout & Spacing

### General Layout Principles

- **Content-centered**: Games are centered horizontally with a max-width container
- **Vertical stacking**: Simple top-to-bottom flow — header, game area, keyboard/input
- **Generous whitespace**: Ample padding around game elements
- **No sidebar clutter**: Game area is the full focus

### Wordle Grid Layout

- **Grid**: 5 columns x 6 rows
- **Tile size**: ~62px x 62px on desktop, scales down on mobile
- **Gap between tiles**: ~5px
- **Grid container max-width**: ~350px
- **Border**: 2px solid border on empty tiles (color-tone-4 in light mode)
- **Filled tile border**: Becomes color-tone-3 when letter is entered
- **Revealed tile**: No border, background fills with correct/present/absent color

### Connections Grid Layout

- **Grid**: 4 columns x 4 rows (16 word tiles)
- **Tile shape**: Rounded rectangles (significant border-radius, ~8-12px)
- **Tile background**: Neutral tan/beige when unselected
- **Selected tile**: Darker shade
- **Solved group**: Full-width bar with category color, showing group name and words
- **Spacing**: Consistent gap between tiles (~8px)

### Spelling Bee Layout

- **Honeycomb**: 7 hexagons in a flower arrangement (1 center + 6 surrounding)
- **Input area**: Text display above hexagons showing current word being typed
- **Buttons**: "Delete", "Shuffle", "Enter" below hexagons
- **Overall width**: Compact, centered on screen

### Strands Grid Layout

- **Grid**: 6 columns x 8 rows of individual letters
- **Each cell**: Contains one letter, evenly spaced
- **Selection**: Path highlighted as user drags between adjacent letters

### Common Spacing Values

| Element | Spacing |
|---------|---------|
| Page padding (mobile) | 16-20px |
| Page padding (desktop) | 24-32px |
| Section gap | 16-24px |
| Tile gap | 4-6px |
| Button padding | 12-16px vertical, 24-32px horizontal |
| Modal padding | 24-32px |
| Header height | ~50-56px |

---

## 5. Game UI Patterns

### Wordle

- **5x6 grid**: Central focal point, no distractions
- **On-screen QWERTY keyboard**: Three rows, mirrors physical layout. "Enter" (left) and "Backspace" (right) are wider keys on the bottom row
- **Keyboard color feedback**: Keys change color to match tile feedback — green if correct, yellow if present, gray if absent. The highest-priority color is shown (green overrides yellow)
- **Empty tile**: Outlined with a thin border, no fill
- **Active row**: Current typing row; letters appear with a subtle pop animation
- **Completed row**: Letters flip to reveal colors, staggered left to right
- **Input method**: Type on physical keyboard or tap virtual keyboard; no text input field

### Connections

- **16 word tiles**: Arranged in a 4x4 grid, each showing a single word in uppercase
- **Selection**: Tap to select (up to 4 words), tiles visually highlight
- **Submit button**: "Submit" button below grid, only active when 4 tiles selected
- **Correct group**: Tiles animate out and collapse into a colored banner showing the category name
- **Mistake tracking**: Dots below the grid (4 dots, one lost per wrong guess — like lives)
- **Shuffle button**: Rearranges remaining tiles to help spot patterns
- **Deselect All button**: Clears current selection

### Spelling Bee

- **Hexagonal layout**: Iconic honeycomb with yellow center letter
- **Word building**: Tap hexagons or type to build words letter by letter
- **Current word display**: Large text above the honeycomb showing letters typed so far
- **Ranking system**: Progress bar from "Beginner" to "Genius" to "Queen Bee" (all words found)
- **Word list**: Expandable section showing found words, alphabetically sorted
- **Shuffle button**: Rotates/rearranges outer hexagons (center stays fixed)

### Strands

- **6x8 letter grid**: Clean grid of individual letters
- **Word selection**: Tap/drag across adjacent letters (horizontal, vertical, diagonal) to form words
- **Theme hint**: Displayed at top of puzzle
- **Found theme words**: Highlighted in blue on the grid
- **Spangram**: Highlighted in yellow, spans two opposite sides of the board
- **Hint system**: Find 3 non-theme words to earn a hint (highlights one theme word)

### The Mini Crossword

- **5x5 grid**: Small crossword grid with black squares
- **Selected cell**: Highlighted (typically blue/yellow)
- **Selected word**: Entire across/down word highlighted in lighter shade
- **Clue display**: Current clue shown prominently, swipe between clues
- **Keyboard**: Standard virtual keyboard for letter input
- **Timer**: Optional speed-solving timer

---

## 6. Interaction Patterns & Animations

### Wordle Animations

#### Tile Pop (Letter Input)
When a letter is typed, the tile does a quick scale-up/scale-down "pop":
```css
@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
/* Duration: ~100ms */
```

#### Tile Flip (Reveal)
When a row is submitted, tiles flip one by one to reveal their color:
```css
@keyframes flip {
  0% { transform: rotateX(0deg); }
  45% { transform: rotateX(90deg); }  /* tile is edge-on, invisible */
  /* Color changes here at the midpoint */
  55% { transform: rotateX(90deg); }
  100% { transform: rotateX(0deg); }  /* tile returns face-forward with new color */
}
/* Duration: ~500ms per tile */
/* Stagger delay: ~200-300ms between each tile (left to right) */
/* Total row reveal: ~1.3-1.5 seconds */
```

#### Row Shake (Invalid Word)
When an invalid word is entered, the entire row shakes horizontally:
```css
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}
/* Duration: ~600ms */
```

#### Win Dance (Bounce)
When the correct word is guessed, tiles bounce up one by one:
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}
/* Duration: ~1000ms per tile */
/* Stagger delay: ~100ms between tiles */
```

### Connections Animations

- **Tile selection**: Quick scale or highlight transition (~150ms)
- **Correct group solve**: Selected tiles animate together, sliding up and condensing into the colored category bar. Remaining tiles drop down to fill the gap.
- **Wrong guess**: Tiles briefly shake, then deselect
- **Last group**: Auto-solves with animation

### General Interaction Patterns

- **Tap/click feedback**: Immediate visual response (color change, scale, or highlight)
- **No drag-and-drop in most games**: Simple tap-to-select or type-to-input
- **Modals**: Slide up from bottom on mobile, fade in centered on desktop
- **Toast notifications**: Appear at top-center, auto-dismiss after ~1.5-2 seconds. Dark background, white text, rounded corners.
- **Transitions between states**: Smooth, never jarring. Typical duration 200-300ms with ease-in-out timing.

### Toast Messages (Wordle)

| Trigger | Message |
|---------|---------|
| Not enough letters | "Not enough letters" |
| Invalid word | "Not in word list" |
| Share results | "Copied results to clipboard" |
| Correct guess | The answer word (briefly before stats modal) |
| Game over (loss) | The answer word is revealed |

---

## 7. Results & Sharing

### Wordle Share Format

```
Wordle 1,234 4/6

:black_large_square::black_large_square::large_yellow_square::black_large_square::black_large_square:
:black_large_square::large_green_square::black_large_square::black_large_square::black_large_square:
:large_green_square::large_green_square::large_green_square::black_large_square::large_yellow_square:
:large_green_square::large_green_square::large_green_square::large_green_square::large_green_square:
```

**Format details:**
- Title: "Wordle [puzzle number] [guesses]/6"
- X/6 for failures
- Each row: 5 emoji squares
- Colors: :large_green_square: (correct), :large_yellow_square: (present), :black_large_square: (absent in light mode) or :white_large_square: (absent in dark mode)
- No letters revealed — only colors. This is the genius of the spoiler-free sharing format.

### Connections Share Format

```
Connections
Puzzle #456
:large_yellow_square::large_yellow_square::large_yellow_square::large_yellow_square:
:large_green_square::large_green_square::large_green_square::large_green_square:
:large_blue_square::large_purple_square::large_blue_square::large_blue_square:
:large_purple_square::large_purple_square::large_purple_square::large_purple_square:
```

**Format details:**
- Title: "Connections" + "Puzzle #[number]"
- Each row represents a guess attempt (4 emojis per row)
- Colors represent which category each selected word belongs to
- A perfect solve shows 4 rows of matching colors
- Mistakes show mixed colors in a row

### Strands Share Format

Uses a custom emoji-based representation of the grid with theme/non-theme/spangram indicators.

### Sharing UX Pattern

1. Game ends (win or loss)
2. Results/stats modal appears (slight delay to let final animations complete)
3. "Share" button prominently displayed
4. Tap "Share" -> results text copied to clipboard
5. Toast notification: "Copied results to clipboard"
6. On mobile: may also trigger native share sheet
7. No image generation — pure text/emoji format for maximum compatibility

---

## 8. Statistics & Streaks

### Wordle Statistics Modal

Layout (top to bottom):
1. **"Statistics" heading** (centered, bold)
2. **Four stat boxes** in a horizontal row:
   - "Played" — total games
   - "Win %" — win percentage
   - "Current Streak" — consecutive wins
   - "Max Streak" — best streak ever
   - Each: large number on top, small label below
3. **"Guess Distribution" heading**
4. **Bar chart**: 6 horizontal bars (one per guess count 1-6)
   - Bar length proportional to count
   - The bar for the current game's guess count is highlighted in green
   - Numbers shown at end of each bar
5. **Countdown timer**: "NEXT WORDLE" with HH:MM:SS countdown to midnight
6. **Share button**: Green background, white text, prominent

### Connections Statistics

Similar to Wordle but tracks:
- Games played
- Win %
- Current streak
- Max streak
- Category solve order distribution

### Streak Design Pattern

- **Prominent number display**: Current streak shown as a large, bold number
- **Flame/fire emoji**: Sometimes accompanies streak count
- **Loss aversion**: The streak display is psychologically powerful. Users with 7+ day streaks are 2.3x more likely to engage daily.
- **Streak danger**: Some implementations show countdown/urgency when you haven't played today but have an active streak

### Daily Challenge Pattern

- **One puzzle per day**: Same puzzle for everyone, refreshes at midnight local time
- **Deterministic**: Puzzle is seeded from the date — same puzzle everywhere
- **Countdown timer**: Shows time until next puzzle after completion
- **No replay**: Once completed, you see your results but can't retry (reinforces the "one shot" tension)

---

## 9. Onboarding & Tutorials

### "How to Play" Modal Pattern

NYT Games uses a clean, minimal modal for teaching new games:

**Structure:**
1. **Title**: "How to Play" (NYT Karnak Condensed, centered)
2. **Step-by-step instructions**: Short paragraphs with bold key terms
3. **Visual examples**: Small inline game grids showing example states
4. **Color legend**: Visual examples of what green/yellow/gray mean
5. **Close button**: "X" in top-right corner, or tap outside to dismiss

**Wordle How-to-Play Example:**
- "Guess the Wordle in 6 tries."
- "Each guess must be a valid 5-letter word."
- Shows example tile with green highlight: "W is in the word and in the correct spot."
- Shows example tile with yellow highlight: "I is in the word but in the wrong spot."
- Shows example tile with gray: "U is not in the word in any spot."

### Onboarding Triggers

- **First visit**: How-to-play modal shown automatically
- **Subsequent visits**: Accessible via "?" or info icon in header
- **No forced tutorials**: Users can dismiss immediately
- **Learn by playing**: The games themselves teach through immediate feedback

### Newer Games (Pips, Crossplay)

- **Interactive tutorials**: "Play Tutorial" option that walks users through basics with guided examples
- **Skip option**: "Skip the tutorial and jump right in"
- **Instant feedback**: "The game lets you know right away if you've broken a rule, so you can try again and learn as you go."

---

## 10. Gamification & Engagement

### Hook Model (as analyzed by Audiencers)

NYT Games follows Nir Eyal's Hook Model:

1. **Trigger**: Daily refresh, social media sharing by friends, push notifications (gentle)
2. **Action**: Simple, low-friction gameplay (tap, type, submit)
3. **Variable Reward**: Satisfaction of solving, streak continuation, social comparison
4. **Investment**: Streak built up over time, statistics accumulation

### Engagement Mechanics

| Mechanic | Implementation |
|----------|---------------|
| **Daily cadence** | One puzzle per day, mirrors newspaper tradition |
| **Streaks** | Consecutive days played, visible in stats |
| **Statistics tracking** | Games played, win %, guess distribution |
| **Social sharing** | Spoiler-free emoji grids for social media |
| **Countdown timer** | Time until next puzzle creates anticipation |
| **Progression ranks** | Spelling Bee: Beginner -> Good Start -> Moving Up -> Good -> Solid -> Nice -> Great -> Amazing -> Genius -> Queen Bee |
| **Year in Games** | Annual Spotify Wrapped-style recap (launched 2025) with shareable graphics |
| **Leaderboards** | Friends/social comparison for some games |

### What NYT Games Does NOT Do

- No infinite scroll or endless content
- No push notifications spam
- No loot boxes or premium currency
- No artificial time gates (play once, come back tomorrow)
- No advertising-driven engagement metrics
- No variable ratio reinforcement schedules (each game is skill-based, not random)

---

## 11. Branding & Identity

### Logo Treatment

- **NYT Games logo**: Uses the NYT brand lockup with "Games" — clean, text-based
- **Individual game logos**: Each game has its own distinct identity
  - **Wordle**: Bold serif wordmark (NYT Karnak Condensed). After NYT acquisition, changed from original sans-serif to heavy serif typeface in title case. Icon: letters on green squares.
  - **Connections**: Clean word-based mark
  - **Spelling Bee**: Hexagonal honeycomb motif
  - **The Crossword**: Classic grid imagery
  - **Strands**: Interlinked letter motif

### Brand Differentiation from NYT News

| Aspect | NYT News | NYT Games |
|--------|----------|-----------|
| **Tone** | Serious, authoritative | Playful, warm, inviting |
| **Color** | Monochromatic (black, white, gray) | Colorful (yellows, greens, blues, purples) |
| **Typography** | Cheltenham for headlines | Karnak Condensed for game titles, Franklin for body |
| **Imagery** | Photography, illustration | Abstract game elements, geometric shapes |
| **Greeting** | None | Personalized time-of-day greetings ("Good morning!") |
| **Emotional register** | Informational | Delightful |

### App Design (2024 Redesign)

- **Three main tabs**: "Games", "Stats", "Leaderboard" (simplified from 5 tabs)
- **Game cards**: Reflect user progress, designed to be both inviting for discovery and functional
- **Personalized greetings**: Change throughout the day — responsive to time and context
- **Lots of color**: Used strategically for new player discovery while maintaining NYT sophistication
- **Clear brand icons**: Each game has a distinctive, recognizable icon
- **Streamlined typography**: Clean hierarchy throughout

---

## 12. Mobile vs Desktop

### Responsive Design Approach

NYT Games uses a **mobile-first** design that scales up:

| Aspect | Mobile | Desktop |
|--------|--------|---------|
| **Game grid** | Fills available width with padding | Max-width container, centered |
| **Keyboard (Wordle)** | Full-width, touch-optimized | Narrower, optional (physical keyboard) |
| **Tile size** | Scales to fit screen width | Fixed ~62px |
| **Modals** | Slide up from bottom (sheet-style) | Centered overlay with backdrop |
| **Navigation** | Bottom tab bar | Top navigation |
| **Touch targets** | Minimum 44x44px | Standard click targets |
| **Haptics** | Subtle haptic feedback on tile/key press (iOS) | None |

### Key Mobile Considerations

- **Single-hand usability**: Games designed to be playable with one thumb
- **No horizontal scrolling**: Everything fits within viewport
- **Keyboard avoidance**: On-screen keyboards (Wordle, Mini) positioned to not trigger system keyboard
- **Orientation**: Portrait-locked for most games
- **Offline capability**: Games can be played without internet (PWA support)
- **Safe area compliance**: Respects notches and home indicators

### PWA / App Implementation

- Available as native iOS/Android app and as web app
- Service worker for offline support
- Install prompt on Android/Chrome
- App icon: Custom NYT Games icon for home screen

---

## 13. Accessibility

### Color Accessibility

- **High contrast mode**: Replaces green/yellow with orange/blue for colorblind users
- **Known limitation**: Even high contrast mode doesn't fully meet 3:1 minimum ratio for non-text element contrast
- **Dark mode**: Full dark theme support across all games

### Screen Reader Support (Significant Gaps)

An accessibility audit found notable shortcomings:
- **Wordle is largely inaccessible to screen reader users**: Color feedback (green/yellow/gray) on letter tiles is **not semantically encoded with ARIA attributes** — screen readers cannot announce whether a guessed letter is correct, wrong position, or absent
- **Tutorial popup**: Found to be **impossible to close via keyboard alone** (no focus trap, no keyboard-accessible close button)
- **Shared emoji grids**: Screen readers announce each square's color name but not the semantic meaning (correct/wrong position/miss)
- **Community workaround**: A community-created Chrome extension ("Accessible Wordle") was developed to patch these issues
- No explicit `prefers-reduced-motion` media query support found in available audits

### Interaction Accessibility

- **Physical keyboard support**: Full support for typing in Wordle, Mini Crossword
- **No time pressure**: Most games have no time limit (timer is optional in Mini)
- **Large touch targets**: Keys and tiles are generously sized (minimum 44x44px on mobile)
- **Clear visual feedback**: Multiple channels (color + position + animation)

---

## 14. Daily Ritual Design

NYT Games has mastered the "one puzzle per day" mechanic as a core engagement driver. The psychological foundation is built on **scarcity** (limiting supply creates urgency) and the **Zeigarnik Effect** (incomplete tasks linger in memory, pulling you back tomorrow).

### Reset Times

- **Wordle, Connections, Strands, Spelling Bee**: Reset at **midnight local time** — the player's own timezone clock determines when the new puzzle appears
- **Daily Crossword and Mini Crossword**: Available at **10:00 PM EST** the night before (Monday-Saturday). Sunday puzzles drop at **6:00 PM EST on Saturday**. This early-release pattern lets evening solvers engage before bed

### "Come Back Tomorrow" Pattern

After completing a game, the interface shows results and a countdown timer to the next puzzle. There is no way to replay or practice — you are done for the day. This artificial scarcity is what makes each puzzle feel precious and shareable. As one analysis put it: "Skipping a day feels like breaking a streak and like missing out on a shared experience."

### Personalized Time-of-Day Greetings

The 2024 app redesign introduced greetings that change throughout the day — acknowledging whether you are playing first thing in the morning or returning in the evening. This creates the feeling of a living, responsive environment rather than a static game launcher.

### The Morning Ritual Loop

For many users, NYT Games has become part of a fixed daily sequence (often: Mini -> Connections -> Wordle -> Strands -> Spelling Bee). The games are designed to be completable in roughly 5-20 minutes total, fitting into a coffee-and-commute routine.

### Design Philosophy Quote

Jonathan Knight (Head of NYT Games): "We don't want 24/7 engagement. We want a very healthy daily habit where you feel good about what you've done."

---

## 15. Difficulty & Progression

Each game handles difficulty differently, but none use traditional "levels" — difficulty is either intrinsic to each day's puzzle or self-directed.

### Wordle
- **Fixed difficulty**: 6 guesses to find a 5-letter word. No difficulty settings except optional Hard Mode
- **Hard Mode toggle**: Forces constraint-based guessing (must reuse confirmed letters)
- **No hints**: Only feedback is letter colors after each guess
- **WordleBot**: Post-game AI companion that scores your "skill" and "luck" — retrospective learning, not in-game help

### Connections
- **Color-coded difficulty tiers**: Yellow (easiest) -> Green -> Blue -> Purple (hardest, often wordplay/puns)
- **4 mistakes allowed**: Functions as a lives system. Four wrong groupings = game over
- **"One away" feedback**: When a submission has 3 correct and 1 wrong word, shows "One away..." without revealing which word is wrong
- **No hints**: Relies entirely on pattern recognition

### Spelling Bee
- **Progressive ranking**: Points-based progression through: Beginner -> Good Start -> Moving Up -> Good -> Solid -> Nice -> Great -> Amazing -> Genius -> Queen Bee
- **Genius threshold**: ~70-74% of maximum possible points
- **Queen Bee**: Finding every valid word (completionist goal)
- **Pangram bonus**: A word using all 7 letters earns +7 bonus points
- **Shuffle button**: Rearranges letter positions to help spot combinations (no penalty)

### Strands
- **Theme-based difficulty**: Varies by how obscure the theme connections are
- **Hint system via non-theme words**: Every 3 valid non-theme words = 1 hint (reveals one theme word). No penalty for wrong guesses — wrong guesses are actually productive
- **Spangram**: Special theme word spanning the entire board (touches two opposite sides)

### Mini Crossword
- **Consistent low difficulty**: 5x5 grid, designed to be solved in 1-5 minutes
- **Timer-based competition**: Primary challenge is speed, not difficulty. Average solve time (2023): 1 minute 57 seconds

---

## 16. Error Handling

NYT Games communicates errors through gentle, non-punishing feedback patterns.

### Wordle
- **Invalid word**: Entire row **shakes horizontally** (~0.5s). Toast: "Not in word list." No aggressive "ERROR" text
- **Not enough letters**: Row shakes. Toast: "Not enough letters."
- **Color feedback as implicit error**: Gray tiles are deliberately **not red**. Gray is neutral; red would create stress. Gray says "this letter isn't here"
- **Keyboard color tracking**: On-screen keyboard updates letter colors after each guess, preventing re-use of eliminated letters

### Connections
- **Wrong grouping**: Selected words **briefly shake**, then deselect. One dot removed from "Mistakes remaining: oooo"
- **"One away..." feedback**: Special message when 3 of 4 words are correct — doesn't reveal which is wrong
- **Game over**: Remaining groups revealed with colors and labels. No dramatic failure screen — just a clean reveal

### Spelling Bee
- **Word too short**: Toast: "Too short."
- **Missing center letter**: Toast: "Missing center letter."
- **Not in word list**: Toast: "Not in word list."
- **Already found**: Toast: "Already found."
- Hexagons provide subtle press feedback (scale/color change on tap)

### Strands
- **No penalty for wrong guesses**: Invalid theme words simply don't highlight. Non-theme valid words count toward earning hints (3 = 1 hint). This is notably forgiving

### Design Principle

Errors are guidance, not punishment. The shake animation and neutral gray (instead of red) keeps emotional tone calm. Mistakes are learning opportunities, not failures.

---

## 17. Navigation

### Mobile App (2024 Redesign)

Led by product design director Jennifer Scheerer:

- **Bottom navigation reduced from 5 tabs to 3**:
  1. **Games** — hub showing all available games as cards
  2. **Stats** — aggregated statistics across all games
  3. **Leaderboard** — friend comparisons and scores (expanded in 2025)

- **Game cards**: Each game as a visual card with name, icon, and status ("Play" or checkmark if completed today). Designed for scannability
- **Personalized greetings**: Time-of-day messages ("Good morning," "Welcome back this evening") that change dynamically

### NYT News App Integration

- **2023**: Added a "Games" tab in bottom navigation
- **Current (2025-2026)**: 5 bottom tabs: Home, Listen, Play, Sections, You. "Play" is the gateway to all games

### Between-Game Flow

After completing one game, results screen shows countdown and share button, but **no prominent "Play next game" button**. Users navigate back to hub. This is deliberate — each game is a self-contained experience, not a pipeline.

---

## 18. Notifications

NYT Games uses push notifications strategically but with notable restraint:

- **Daily puzzle reminders**: Opt-in, configurable per game
- **Streak danger alerts**: Some users receive notifications when their streak is at risk (haven't played, reset approaching)
- **No aggressive re-engagement**: No "Your crops are dying!" urgency. Tone matches the NYT brand — informational, not manipulative
- **Customizable**: Users choose notification types through app settings

### Design Principle

Match notification frequency to natural play frequency. If users play once daily, one notification per day is appropriate. Personalized content (e.g., mentioning streak count) reportedly increases engagement by up to 259%.

---

## 19. Monetization

### Free vs. Paid Structure (as of 2025-2026)

| Game | Access |
|------|--------|
| **Wordle** | Free forever (no ads, no paywall, no limitations) |
| **Connections** | Free forever |
| **Strands** | Free forever |
| **Spelling Bee** | Free with limits (subscription for full access) |
| **Mini Crossword** | Paywalled since August 2025 ($6/month or $50/year) |
| **Daily Crossword** | Paywalled (full crossword, archives) |

### The Funnel Strategy

Wordle is the **top-of-funnel acquisition tool**. It remains permanently free because its viral sharing mechanic brings millions of new users to the NYT ecosystem. Once on the platform, users discover other games and encounter the paywall for premium content. Free games build the habit; paid games capture revenue.

As of 2024: over 9 million Games subscribers. Games were played over 11.2 billion times in 2025.

### What NYT Does NOT Do

- No hint-selling or in-game purchases
- No virtual currencies
- No pay-to-win mechanics
- No advertising in games
- Monetization is strictly subscription-based

---

## 20. Patterns Transferable to Cognitive Training Apps

The patterns most applicable to apps like Unreel (n-back cognitive training):

1. **Scarcity drives habit**: The one-per-day mechanic creates FOMO, preserves novelty, and makes each session feel meaningful rather than disposable

2. **Streaks as the primary retention hook**: Current streak and max streak are the two most emotionally powerful numbers. Fear of losing a streak is more motivating than any reward for building one

3. **Spoiler-free sharing formats**: The emoji grid pattern lets people share accomplishments without revealing content. For n-back, an equivalent could encode performance pattern, difficulty level, and accuracy in a compact shareable format

4. **Celebration restraint**: Brief, tasteful animations (tile bounce, confetti) rather than overwhelming celebrations. Matches a premium/serious brand — critical for cognitive training that wants to feel credible

5. **Error feedback as guidance, not punishment**: Shake animation and gray (not red) for misses keeps emotional tone neutral. Mistakes are learning opportunities, not failures

6. **Progressive disclosure of statistics**: Stats behind a single tap, not plastered on the main screen. Rewards the curious without overwhelming casual players

7. **Time-of-day awareness**: Personalized greetings and streak-danger indicators create a sense that the app knows your routine and respects your time

8. **Accessibility as opportunity**: Even NYT has significant accessibility shortcomings (screen reader support, contrast ratios). Doing it better is a differentiator

9. **"Time well spent" positioning**: Frame cognitive training as a healthy daily habit, not a time sink. Respect users' time — short, focused sessions

10. **Human warmth**: Personalized greetings, "come back tomorrow" messaging, and the "we're all in this together" shared-experience feeling create emotional connection

---

## 21. Sources

### Official / Authoritative Sources
- [NYT Games App - Apple App Store](https://apps.apple.com/us/app/nyt-games-wordle-crossword/id307569751)
- [Apple 2024 Design Awards - Delight and Fun category](https://developer.apple.com/design/awards/2024/)
- [NYT Games debuts redesigned app - TechCrunch](https://techcrunch.com/2024/03/07/nyt-games-redesigned-app-boost-discovery-simplify-navigation/)
- [NYT Games Kit - Figma Community](https://www.figma.com/community/file/1532786930468924576/nyt-games-kit)

### Design & UX Analyses
- [How NYT Games Builds Products People Can't Quit - Jonathan Knight Interview, Enrich](https://www.joinenrich.com/newsletter/how-nyt-games-builds-products-people-cant-quit-with-jonathan-knight-head-of-nyt-games)
- [How The New York Times Harnesses the Power of Games - Audiencers](https://theaudiencers.com/dopamine-the-hook-model-how-the-new-york-times-harnesses-the-power-of-games/)
- [Transforming The New York Times: Empowering Evolution through UX - UXDX](https://uxdx.com/blog/transforming-the-new-york-times-empowering-evolution-through-ux/)
- [NYT Games App Redesign Case Study - vgnicholls](https://www.vgnicholls.com/case-studies/nyt-app-redesign)
- [Zoe Bell - NYT Games Executive Producer - Johns Hopkins Magazine](https://hub.jhu.edu/magazine/2024/fall/zoe-bell-nytimes-games/)
- [NYT Spelling Bee Social Play Feature Case Study - JTMadeThis](https://www.jtmadethis.com/ux-case-studies/spellingbee)
- [Caro Turcios - NYT Games Brand Refresh](https://www.carolinaturcios.com/nyt-games-brand-refresh)

### Typography & Font Sources
- [Every Font Used by The New York Times - Sensatype](https://sensatype.com/every-font-used-by-the-new-york-times-in-2025)
- [NYT Cheltenham - Fonts In Use](https://fontsinuse.com/typefaces/7802/nyt-cheltenham)
- [NYT Franklin - Fonts In Use](https://fontsinuse.com/typefaces/12496/nyt-franklin)
- [NYT Karnak - Fonts In Use](https://fontsinuse.com/typefaces/31767/nyt-karnak)
- [NYT Wordle Font Generator - FontBolt](https://www.fontbolt.com/font/nyt-wordle-font/)
- [NYT Connections Font Generator - FontBolt](https://www.fontbolt.com/font/nyt-connections-font/)
- [Wordle Font Change Discussion - Mastodon](https://mas.to/@FormerlyStC/109825826629107068)

### Color Palette Sources
- [Wordle NYTIMES Color Palette - color-hex.com](https://www.color-hex.com/color-palette/1012607)
- [Wordle Color Palette (Original) - color-hex.com](https://www.color-hex.com/color-palette/1338)
- [NY Times Games Color Palette - color-hex.com](https://www.color-hex.com/color-palette/1021164)
- [Wordle Button States Color Palette - color-hex.com](https://www.color-hex.com/color-palette/1339)
- [Wordle Colorblind Mode - Zendesk Help](https://wordle-app.zendesk.com/hc/en-us/articles/5608997682579-Blue-Orange-Mode)
- [Wordle Accessibility Analysis - Access Armada](https://www.accessarmada.com/blog/how-wordle-falls-short-on-accessibility/)

### Source Code & Technical References
- [Original Wordle Source Code - GitHub Gist (jpluimers)](https://gist.github.com/jpluimers/67c1098567793e8e71df42924e76981d)
- [Wordle Light/Dark Mode Toggle CSS - GitHub Gist (curleypg)](https://gist.github.com/curleypg/d730c90d8341c795c9593ef3c9a74791)
- [Deconstructing and Rebuilding Wordle Part 1 - blog.ltgt.net](https://blog.ltgt.net/deconstructing-and-rebuilding-wordle/)
- [Deconstructing and Rebuilding Wordle Part 2 - blog.ltgt.net](https://blog.ltgt.net/deconstructing-and-rebuilding-wordle-2/)
- [Wordle CSS Variables in Emails - Email on Acid](https://www.emailonacid.com/blog/article/email-development/wordle-css-variables/)

### Wikipedia & General Reference
- [Wordle - Wikipedia](https://en.wikipedia.org/wiki/Wordle)
- [The New York Times Connections - Wikipedia](https://en.wikipedia.org/wiki/The_New_York_Times_Connections)
- [The New York Times Strands - Wikipedia](https://en.wikipedia.org/wiki/The_New_York_Times_Strands)
- [The New York Times Spelling Bee - Wikipedia](https://en.wikipedia.org/wiki/The_New_York_Times_Spelling_Bee)
- [The New York Times Games - Wikipedia](https://en.wikipedia.org/wiki/The_New_York_Times_Games)
- [NYT Wordle Logo and Symbol History - 1000logos.net](https://1000logos.net/wordle-logo/)

### UX Analyses & Case Studies
- [Why I love Wordle: a UX breakdown - Medium/Bootcamp](https://medium.com/design-bootcamp/why-wordle-works-a-ux-breakdown-485b1dbba30b)
- [Wordle UX: Sometimes a game just feels good - UX Collective](https://uxdesign.cc/wordle-ux-sometimes-a-game-just-feels-good-8749b26834ef)
- [Master the 5 simple UX design tricks that make Wordle so popular](https://blog.tbhcreative.com/ux-design/)
- [UX Case Study: How did Wordle take over the World? - Hatch](https://hatch.sg/blog/ux-case-study-how-did-wordle-take-over-the-world)
- [How Wordle Falls Short on Accessibility - Access Armada](https://www.accessarmada.com/blog/how-wordle-falls-short-on-accessibility/)
- [Wordle colors undermine color-blind inclusion - Bill Fischer](https://billfischer.substack.com/p/these-2-wordle-colors-undermine-color)

### Social Features & Engagement
- [NYT Launches Multi-Game Leaderboard - TODAY](https://www.today.com/popculture/nyt-multi-game-leaderboard-rcna202155)
- [NYT Games App Social Makeover - Gear Diary](https://geardiary.com/2025/05/01/new-york-times-games-app/)
- [The Daily Puzzle Phenomenon - Ivey HBA](https://www.ivey.uwo.ca/hba/blog/2025/03/the-daily-puzzle-phenomenon-how-nyt-turned-games-into-a-subscription-goldmine/)
- [How to Share Your Wordle Score - How-To Geek](https://www.howtogeek.com/108120/how-to-share-your-wordle-score-without-spoilers/)

### Business & Strategy
- [NYT Games Crossplay Launch - AdWeek](https://www.adweek.com/media/crossplay-new-york-times-games/)
- [NYT Games Apple Design Award - InPublishing](https://www.inpublishing.co.uk/articles/nyt-games-app-wins-award-24907)
- [NYT App Redesign Strategy - WAN-IFRA](https://wan-ifra.org/2025/06/read-play-swipe-the-strategy-behind-the-new-york-times-app-revamp/)
- [Jonathan Knight - Everybody Is a Gamer - Boston University](https://www.bu.edu/articles/2024/everybody-is-a-gamer/)
- [NYT Gamification Strategy - Smartico](https://www.smartico.ai/blog-post/the-new-york-times-gamification-boost-sales)
- [NYT Mini Crossword Paywalled - LA Mag](https://lamag.com/gaming/the-new-york-times-mini-crossword-goes-behind-a-paywall-and-players-are-not-happy/)
- [Does Wordle Make Money? - EatHealthy365](https://eathealthy365.com/how-wordle-generates-millions-for-the-new-york-times/)
