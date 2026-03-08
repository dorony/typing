# מגיני החלל — Space Defenders

A Hebrew touch-typing tutor disguised as a space invaders game. Type letters to destroy alien spaceships, defeat bosses, and learn the Hebrew keyboard layout — one finger at a time.

**Play now:** [dorony.github.io/typing](https://dorony.github.io/typing/)

## How It Works

Alien ships descend carrying Hebrew letters. Type the matching key to destroy them before they reach the bottom. The curriculum starts with index-finger home-row keys and progressively introduces new letters, combos, words, and boss battles across 150 levels.

### Boss Battles

Each level group ends with a boss fight in two phases:

1. **Missile phase** — The boss fires letter-missiles downward. Type each letter to destroy the missile before it hits the bottom.
2. **Simultaneous phase** — Two letters appear side by side. Press both keys within 400ms to deal damage. Three successful pairs defeat the boss.

### Features

- 150 levels across 15 groups (13 letter groups + 2 word groups)
- 4 enemy types: scout (basic), dart (fast), brute (armored), carrier (word)
- Alien spaceship silhouettes with engine glow effects
- Power-ups: freeze, slow-mo, shield (10% drop chance)
- Combo system with milestone rewards
- Per-letter accuracy tracking with adaptive difficulty (weak letters spawn more)
- Dashboard with keyboard heatmap, WPM chart, and achievements
- Multiple player profiles (up to 6)
- Difficulty settings (easy / normal / hard)
- On-screen keyboard hint overlay with finger color coding
- Procedural sound effects (Web Audio API — no audio files)
- Fully client-side — all data in localStorage

## Tech Stack

- **TypeScript** + **Vite** (no frameworks, no game engines)
- Canvas 2D rendering
- Web Audio API for synthesized sounds
- CSS for UI screens (menus, HUD, dashboard)
- localStorage for player profiles and settings

## Development

```bash
npm install
npm run dev       # Dev server at localhost:5173
npm run build     # Type-check + production build
npm run preview   # Preview production build locally
```

## Deploy to GitHub Pages

```bash
npm run build
# Push dist/ contents to gh-pages branch
```

## Project Structure

```
src/
├── curriculum/          Teaching progression & difficulty
│   ├── LetterProgression.ts   150 levels, letter groups, LevelConfig
│   ├── HebrewKeyboard.ts      QWERTY→Hebrew mapping, layout
│   ├── DifficultyScaler.ts    Adaptive speed/spawn/letter selection
│   └── WordBank.ts            Hebrew word lists by tier
├── entities/            Game objects
│   ├── Enemy.ts               Alien ships (basic/fast/armored/word)
│   ├── Boss.ts                Phase state machine (entrance→missile→final→defeated)
│   ├── Missile.ts             Boss letter-missiles
│   ├── EnemyFactory.ts        Spawning logic with adaptive letter picking
│   ├── Particle.ts            Single particle
│   └── ParticleSystem.ts      Object-pooled particle emitter (200 pool)
├── game/                Core engine
│   ├── Game.ts                Main game class, update loop, input routing
│   ├── GameLoop.ts            requestAnimationFrame loop with delta time
│   ├── Renderer.ts            Canvas drawing (ships, missiles, effects)
│   ├── InputHandler.ts        Keyboard→Hebrew char mapping
│   ├── CollisionDetector.ts   Bottom-boundary collision checks
│   └── SoundManager.ts        Procedural Web Audio sounds
├── state/               Persistence & tracking
│   ├── GameState.ts           Types (GameScreen, EnemyType, settings, etc.)
│   ├── PlayerProfile.ts       Profile CRUD, letter stats, level results
│   ├── ProgressTracker.ts     Per-session accuracy, WPM, achievements
│   └── Storage.ts             localStorage wrapper
├── ui/                  DOM-based screens
│   ├── MenuScreen.ts          Main menu with level select
│   ├── ProfileSelect.ts       Profile creation/selection (max 6)
│   ├── HUD.ts                 Lives, score, combo, power-up display
│   ├── LevelCompleteScreen.ts Post-level stats and achievements
│   ├── GameOverScreen.ts      Retry/menu on death
│   ├── DashboardScreen.ts     Keyboard heatmap, WPM chart, achievements
│   └── SettingsPanel.ts       Sound, hints, difficulty toggles
├── main.ts              Entry point (font loading, mobile warning)
└── style.css            All UI styles
```
