# CLAUDE.md — Space Defenders

## What This Is

Hebrew typing tutor as a space invaders game. Pure TypeScript + Canvas 2D + Vite. No frameworks, no game engine, no external libraries beyond dev tooling.

## Commands

```bash
npm run dev       # Vite dev server (localhost:5173)
npm run build     # tsc --noEmit + vite build → dist/
npm run preview   # Serve dist/ locally
npx tsc --noEmit  # Type-check only
```

After any code change, run `npx tsc --noEmit` to verify types compile.

## Architecture

### Game Loop

`Game.ts` is the central orchestrator. `GameLoop.ts` calls `Game.update(dt)` every frame via requestAnimationFrame. Delta time is capped at 0.1s.

Update cycle: clear canvas → draw starfield → update power-ups → spawn enemies → update entities → check collisions → render → update HUD → update keyboard highlights.

### Rendering

All drawing happens in `Renderer.ts` on a Canvas 2D context. The canvas uses `devicePixelRatio` scaling. Enemy ships are drawn as canvas paths (no images/sprites). There are 5 ship shapes:

- `drawBasicShip` — saucer with dome and prongs (basic enemy)
- `drawFastShip` — organic wedge with antennae (fast enemy)
- `drawArmoredShip` — beetle carapace with mandibles (armored enemy)
- `drawWordShip` — barge with tentacle fins (word enemy)
- `drawBossShip` — dreadnought with claw wings (boss)

All ships face downward and have `drawEngineGlow()` (green alien energy, flickering with `aliveTime`).

### Input Flow

`InputHandler.ts` listens for keydown → maps QWERTY key to Hebrew character (supports both QWERTY mapping and native Hebrew IME) → calls `Game.handleInput(char)`.

In `handleInput`:
1. Boss missile phase → find matching missile closest to bottom → destroy it
2. Boss final phase → simultaneous key detection (400ms window)
3. Locked word enemy → must match next char or break lock
4. Otherwise → find closest-to-bottom matching enemy

### Boss Fight Phases

`Boss.ts` has a phase state machine: `entrance → missile → final → defeated`.

- **Entrance**: flies in with easeOutBack animation
- **Missile**: fires each letter of `bossWord` as a `Missile` entity at 1.5s intervals. Player types letters to destroy missiles. When all missiles fired AND destroyed → transition to final.
- **Final**: 3 rounds of simultaneous key pairs. Two letters shown, player must press both within 400ms. `advanceFinalPair()` returns `true` when all 3 pairs done.
- **Defeated**: explosion particles, fade out, level complete.

Boss no longer has `matches()` or `hit()` — it's not typed directly.

### Enemy Types

| Type | Radius | Hits | Speed | Color |
|------|--------|------|-------|-------|
| basic | 30 | 1 | 1.0× | #4488ff |
| fast | 25 | 1 | 1.5× | #ff8844 |
| armored | 40 | 2 | 0.7× | #8866cc |
| word | 35+5×len | 1/char | 0.6× | #44bb88 |

### Level System

150 total levels. 13 letter groups × 10 levels + 2 word groups × 10 levels.

Letter groups progress from home-row index fingers outward through all 3 rows. Each group's 10 levels escalate: single letters → faster + fast enemies → 2-letter combos → armored enemies → 3-4 letter combos with boss.

`LevelConfig` is the key interface — it defines letters, enemy types, speed, spawn interval, boss word, and enemies required before boss.

`DifficultyScaler` handles adaptive difficulty: 40% chance to pick weak letters (low accuracy), plus speed/spawn multipliers from settings (easy=0.7×, normal=1.0×, hard=1.3×).

### Sound

`SoundManager.ts` uses Web Audio API — no audio files. All sounds are synthesized oscillators (sine, sawtooth, square). Key methods: `hit()`, `miss()`, `defeat()`, `loseLife()`, `bossAppear()`, `bossDefeat()`, `missileLaunch()`, `simultaneousSuccess()`, `levelComplete()`, `gameOver()`, `powerUp()`, `combo()`.

### State & Persistence

All player data lives in `localStorage` via `Storage.ts`. `PlayerProfile.ts` manages profiles (max 6). Each profile tracks: per-letter accuracy stats, level results (score/accuracy/WPM), achievements, current level.

`ProgressTracker.ts` tracks per-session metrics (accuracy, WPM, max combo) and checks achievement conditions at level end.

### UI Screens

All screens are DOM elements appended to `#ui-overlay`. They sit on top of the canvas. Each screen class has `show()` and `hide()` methods and callback properties for user actions.

Screens: `MenuScreen` (with level select modal), `ProfileSelect`, `HUD`, `LevelCompleteScreen`, `GameOverScreen`, `DashboardScreen` (keyboard heatmap + WPM chart + achievements), `SettingsPanel`.

Screen transitions are managed by `Game.showScreen()` which hides all screens then shows the target.

## Key Patterns

- **No external dependencies** at runtime. Only `typescript` and `vite` as devDependencies.
- **Object pool** for particles (200 pre-allocated in ParticleSystem).
- **Delta-time everything** — all movement, timers, and animations multiply by `dt`.
- **RTL text rendering** — `drawWordText()` manually renders Hebrew chars right-to-left with per-char coloring (typed=green, next=gold, remaining=white).
- **Hebrew direction** — HTML is `dir="rtl"`, but keyboard layout display and some UI uses `direction: ltr`.

## Style Conventions

- TypeScript strict mode
- No default exports — all named exports
- Entity classes are plain classes with public fields (no getters/setters except computed properties like `nextChar`, `isFullyDead`, `healthPercent`)
- UI classes follow callback pattern: `screen.onAction = () => { ... }`
- Colors: background #0a0a2e, primary #4488ff, accent #ffd700 (gold), danger #ff4444
- Font: Varela Round (loaded async, fallback to sans-serif)

## Deployment

GitHub Pages from `gh-pages` branch. `vite.config.ts` sets `base: '/typing/'`. Build, copy dist contents to gh-pages branch, push.

Live at: https://dorony.github.io/typing/
