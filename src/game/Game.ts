import type { GameScreen, GameSettings, ActivePowerUp, PowerUpType } from '../state/GameState';
import { DEFAULT_SETTINGS } from '../state/GameState';
import { GameLoop } from './GameLoop';
import { InputHandler } from './InputHandler';
import { Renderer } from './Renderer';
import { CollisionDetector } from './CollisionDetector';
import { SoundManager } from './SoundManager';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Missile } from '../entities/Missile';
import { ParticleSystem } from '../entities/ParticleSystem';
import { EnemyFactory } from '../entities/EnemyFactory';
import { getLevelConfig, TOTAL_LEVELS, type LevelConfig } from '../curriculum/LetterProgression';
import { DifficultyScaler } from '../curriculum/DifficultyScaler';
import { Storage } from '../state/Storage';
import { PlayerProfile } from '../state/PlayerProfile';
import { ProgressTracker } from '../state/ProgressTracker';
import { KEYBOARD_LAYOUT } from '../curriculum/HebrewKeyboard';

// UI
import { MenuScreen } from '../ui/MenuScreen';
import { ProfileSelect } from '../ui/ProfileSelect';
import { HUD } from '../ui/HUD';
import { LevelCompleteScreen } from '../ui/LevelCompleteScreen';
import { GameOverScreen } from '../ui/GameOverScreen';
import { DashboardScreen } from '../ui/DashboardScreen';
import { SettingsPanel } from '../ui/SettingsPanel';

interface FloatingText {
  text: string;
  x: number;
  y: number;
  elapsed: number;
  duration: number;
  color: string;
  size: number;
}

export class Game {
  // Core
  private renderer: Renderer;
  private loop: GameLoop;
  private input: InputHandler;
  private collision: CollisionDetector;
  private sound: SoundManager;

  // Entities
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private missiles: Missile[] = [];
  private particles: ParticleSystem;
  private factory: EnemyFactory;
  private difficultyScaler: DifficultyScaler;

  // State
  private storage: Storage;
  private profile: PlayerProfile;
  private tracker: ProgressTracker;
  private settings: GameSettings;
  private screen: GameScreen = 'menu';

  // Game state
  private lives: number = 3;
  private score: number = 0;
  private combo: number = 0;
  private level: number = 1;
  private levelConfig: LevelConfig;
  private enemiesDefeated: number = 0;
  private bossPhase: boolean = false;
  private spawnTimer: number = 0;
  private activePowerUp: ActivePowerUp | null = null;
  private lockedEnemy: Enemy | null = null;
  private floatingTexts: FloatingText[] = [];
  private levelIntroTimer: number = 0;

  // Simultaneous key state (boss final phase)
  private firstPressedKey: string | null = null;
  private firstPressedTime: number = 0;
  private readonly simultaneousWindow: number = 400; // ms

  // Keyboard hint state
  private highlightedKeys: Set<string> = new Set();

  // UI
  private overlay: HTMLElement;
  private menuScreen: MenuScreen;
  private profileSelect: ProfileSelect;
  private hud: HUD;
  private levelComplete: LevelCompleteScreen;
  private gameOver: GameOverScreen;
  private dashboard: DashboardScreen;
  private settingsPanel: SettingsPanel;
  private keyboardHintEl: HTMLDivElement | null = null;
  private pauseEl: HTMLDivElement | null = null;

  constructor(canvas: HTMLCanvasElement, overlay: HTMLElement) {
    this.overlay = overlay;
    this.renderer = new Renderer(canvas);
    this.loop = new GameLoop((dt) => this.update(dt));
    this.input = new InputHandler();
    this.collision = new CollisionDetector();
    this.sound = new SoundManager();
    this.particles = new ParticleSystem();
    this.factory = new EnemyFactory();
    this.difficultyScaler = new DifficultyScaler();

    this.storage = new Storage();
    this.profile = new PlayerProfile(this.storage);
    this.tracker = new ProgressTracker(this.profile);
    this.settings = this.storage.getSettings();

    this.levelConfig = getLevelConfig(1);

    // Create UI screens
    this.menuScreen = new MenuScreen(overlay);
    this.profileSelect = new ProfileSelect(overlay);
    this.hud = new HUD(overlay);
    this.levelComplete = new LevelCompleteScreen(overlay);
    this.gameOver = new GameOverScreen(overlay);
    this.dashboard = new DashboardScreen(overlay);
    this.settingsPanel = new SettingsPanel(overlay);

    this.wireUI();

    // Window resize
    window.addEventListener('resize', () => {
      this.renderer.resize();
    });

    // Input
    this.input.setCallback((char) => this.handleInput(char));
    this.input.enable();

    // Apply settings
    this.sound.setEnabled(this.settings.soundEnabled);
  }

  start(): void {
    this.loop.start();
    this.showScreen('menu');
  }

  setFontReady(): void {
    this.renderer.setFontReady();
  }

  private wireUI(): void {
    // Menu
    this.menuScreen.onPlay = (level: number) => {
      if (!this.profile.current) {
        this.showScreen('profile-select');
        return;
      }
      this.startLevel(level);
    };
    this.menuScreen.onProfiles = () => this.showScreen('profile-select');
    this.menuScreen.onDashboard = () => this.showScreen('dashboard');
    this.menuScreen.onSettings = () => this.showScreen('settings');

    // Profile Select
    this.profileSelect.onSelect = (id) => {
      this.profile.select(id);
      this.showScreen('menu');
    };
    this.profileSelect.onCreate = (name, avatar) => {
      const p = this.profile.create(name, avatar);
      this.profile.select(p.id);
      this.showScreen('menu');
    };
    this.profileSelect.onDelete = (id) => {
      this.profile.delete(id);
      this.showScreen('profile-select');
    };
    this.profileSelect.onBack = () => this.showScreen('menu');

    // HUD
    this.hud.onPause = () => {
      if (this.screen === 'playing') {
        this.showScreen('paused');
      }
    };

    // Level Complete
    this.levelComplete.onNext = () => {
      this.startLevel(this.level + 1);
    };
    this.levelComplete.onMenu = () => this.showScreen('menu');

    // Game Over
    this.gameOver.onRetry = () => {
      this.startLevel(this.level);
    };
    this.gameOver.onMenu = () => this.showScreen('menu');

    // Dashboard
    this.dashboard.onBack = () => this.showScreen('menu');

    // Settings
    this.settingsPanel.onBack = () => this.showScreen('menu');
    this.settingsPanel.onChange = (s) => {
      this.settings = s;
      this.storage.saveSettings(s);
      this.sound.setEnabled(s.soundEnabled);
    };

    // Pause - keyboard shortcut
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.screen === 'playing') {
          this.showScreen('paused');
        } else if (this.screen === 'paused') {
          this.resumeGame();
        }
      }
    });
  }

  private showScreen(screen: GameScreen): void {
    // Hide all
    this.menuScreen.hide();
    this.profileSelect.hide();
    this.hud.hide();
    this.levelComplete.hide();
    this.gameOver.hide();
    this.dashboard.hide();
    this.settingsPanel.hide();
    this.removePauseOverlay();
    this.removeKeyboardHint();

    this.screen = screen;

    switch (screen) {
      case 'menu':
        this.menuScreen.show(this.profile.current);
        break;
      case 'profile-select':
        this.profileSelect.show(
          this.profile.getAll(),
          this.profile.current?.id ?? null,
        );
        break;
      case 'playing':
        this.hud.show();
        if (this.settings.keyboardHintEnabled) {
          this.showKeyboardHint();
        }
        break;
      case 'paused':
        this.hud.show();
        this.showPauseOverlay();
        break;
      case 'level-intro':
        this.hud.show();
        break;
      case 'level-complete':
        // shown via showLevelComplete
        break;
      case 'game-over':
        // shown via showGameOver
        break;
      case 'dashboard':
        if (this.profile.current) {
          this.dashboard.show(this.profile.current);
        }
        break;
      case 'settings':
        this.settingsPanel.show(this.settings);
        break;
    }
  }

  private startLevel(level: number): void {
    this.level = Math.min(level, TOTAL_LEVELS);
    this.levelConfig = getLevelConfig(this.level);
    this.enemies = [];
    this.boss = null;
    this.missiles = [];
    this.bossPhase = false;
    this.enemiesDefeated = 0;
    this.spawnTimer = 0;
    this.activePowerUp = null;
    this.lockedEnemy = null;
    this.floatingTexts = [];
    this.lives = 3;
    this.score = 0;
    this.combo = 0;
    this.tracker.resetLevel();

    // Hide all UI screens first, then show level intro
    this.showScreen('level-intro');
    this.levelIntroTimer = 2.5;
    this.hud.update(this.lives, this.score, this.combo, this.level, null);
  }

  private update(dt: number): void {
    // Always render background
    this.renderer.clear();
    this.renderer.drawStarfield(dt);

    if (this.screen === 'level-intro') {
      this.levelIntroTimer -= dt;
      // Draw level intro text on canvas
      const progress = 1 - this.levelIntroTimer / 2.5;
      let alpha: number;
      if (progress < 0.15) alpha = progress / 0.15;
      else if (progress < 0.7) alpha = 1;
      else alpha = 1 - (progress - 0.7) / 0.3;

      this.renderer.drawFloatingText(
        this.levelConfig.name,
        this.renderer.width / 2,
        this.renderer.height / 2 - 30,
        Math.max(0, 1 - alpha),
        '#ffd700',
        48,
      );
      this.renderer.drawFloatingText(
        this.levelConfig.description,
        this.renderer.width / 2,
        this.renderer.height / 2 + 30,
        Math.max(0, 1 - alpha),
        '#88ccff',
        24,
      );

      if (this.levelIntroTimer <= 0) {
        this.showScreen('playing');
      }
      return;
    }

    if (this.screen !== 'playing') {
      // Draw existing entities for background even in menus
      this.particles.update(dt);
      this.renderer.drawParticles(this.particles);
      return;
    }

    // Update power-ups
    if (this.activePowerUp) {
      this.activePowerUp.remainingMs -= dt * 1000;
      if (this.activePowerUp.remainingMs <= 0) {
        this.activePowerUp = null;
      }
    }

    // Speed multiplier from difficulty + performance
    const recentAccuracy = this.profile.getRecentAccuracy();
    let speedMul = this.difficultyScaler.getSpeedMultiplier(this.settings, recentAccuracy);

    // Power-up effects
    if (this.activePowerUp?.type === 'freeze') {
      speedMul = 0;
    } else if (this.activePowerUp?.type === 'slowmo') {
      speedMul *= 0.5;
    }

    // Spawn enemies
    if (!this.bossPhase) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0 && this.enemies.length < this.levelConfig.maxEnemies) {
        const spawnMul = this.difficultyScaler.getSpawnMultiplier(this.settings);
        this.spawnTimer = this.levelConfig.spawnInterval * spawnMul;
        const enemy = this.factory.spawn(
          this.levelConfig,
          this.renderer.width,
          this.profile.getLetterStats(),
          speedMul,
        );
        this.enemies.push(enemy);
      }
    }

    // Update enemies
    for (const enemy of this.enemies) {
      enemy.update(dt, speedMul);
    }

    // Update boss
    if (this.boss) {
      this.boss.update(dt);

      // Boss fires missiles
      if (this.boss.shouldFireMissile()) {
        const letter = this.boss.fireNextMissile();
        const missile = new Missile(
          this.boss.x + (Math.random() - 0.5) * 40,
          this.boss.y + this.boss.radius * 0.5,
          80 + Math.random() * 40,
          letter,
        );
        this.missiles.push(missile);
        this.sound.missileLaunch();
      }

      // Check if all missiles fired and destroyed → start final phase
      if (this.boss.phase === 'missile' && this.boss.allMissilesFired && this.missiles.length === 0) {
        this.boss.startFinalPhase();
      }
    }

    // Update missiles
    for (const missile of this.missiles) {
      missile.update(dt);
    }

    // Missile reaching bottom
    for (const missile of this.missiles) {
      if (missile.reachedBottom(this.renderer.height)) {
        this.onMissileReachedBottom(missile);
      }
    }

    // Clean up dead missiles
    this.missiles = this.missiles.filter((m) => !m.isFullyDead && !m.reachedBottom(this.renderer.height));

    // Simultaneous key timeout (boss final phase)
    if (this.firstPressedKey !== null) {
      const elapsed = performance.now() - this.firstPressedTime;
      if (elapsed > this.simultaneousWindow) {
        this.firstPressedKey = null;
        this.onMiss(this.firstPressedKey ?? '');
        this.addFloatingText('!מהר יותר', this.renderer.width / 2, this.renderer.height / 2, '#ff8844', 28);
      }
    }

    // Collision detection
    const reached = this.collision.check(this.enemies, this.renderer.height);
    for (const enemy of reached) {
      this.onEnemyReachedBottom(enemy);
    }

    // Clean up dead enemies
    this.enemies = this.enemies.filter((e) => !e.isFullyDead && !e.reachedBottom(this.renderer.height));

    // Check boss phase trigger
    if (!this.bossPhase && this.enemiesDefeated >= this.levelConfig.enemiesRequired) {
      this.startBossPhase();
    }

    // Check boss dead
    if (this.boss?.isFullyDead) {
      this.onBossDefeated();
    }

    // Update particles
    this.particles.update(dt);

    // Update floating texts
    this.floatingTexts = this.floatingTexts.filter((ft) => {
      ft.elapsed += dt;
      return ft.elapsed < ft.duration;
    });

    // Render
    this.renderGame();

    // Update HUD
    this.hud.update(this.lives, this.score, this.combo, this.level, this.activePowerUp);

    // Update keyboard hint highlighting
    this.updateKeyboardHighlights();
  }

  private renderGame(): void {
    // Draw enemies
    for (const enemy of this.enemies) {
      if (enemy.dropsPowerUp && enemy.alive) {
        this.renderer.drawPowerUpGlow(enemy.x, enemy.y, enemy.radius);
      }
      this.renderer.drawEnemy(enemy);
    }

    // Draw missiles
    for (const missile of this.missiles) {
      this.renderer.drawMissile(missile);
    }

    // Draw boss
    if (this.boss && !this.boss.isFullyDead) {
      this.renderer.drawBoss(this.boss);

      // Draw final pair UI
      if (this.boss.phase === 'final' && this.boss.finalPairActive) {
        const pair = this.boss.currentPair;
        if (pair) {
          this.renderer.drawBossFinalPair(this.boss, pair, this.firstPressedKey);
        }
      }
    }

    // Draw particles
    this.renderer.drawParticles(this.particles);

    // Draw floating texts
    for (const ft of this.floatingTexts) {
      this.renderer.drawFloatingText(
        ft.text,
        ft.x,
        ft.y,
        ft.elapsed / ft.duration,
        ft.color,
        ft.size,
      );
    }
  }

  private handleInput(char: string): void {
    if (this.screen === 'paused') {
      // Don't process input while paused
      return;
    }

    if (this.screen !== 'playing') return;

    // Boss missile phase: missiles take priority, but fall through to regular enemies if no match
    if (this.boss?.alive && this.boss.phase === 'missile') {
      const matchingMissile = this.missiles
        .filter((m) => m.matches(char))
        .sort((a, b) => b.y - a.y); // closest to bottom first

      if (matchingMissile.length > 0) {
        this.onMissileHit(matchingMissile[0], char);
        return;
      }
      // No missile matches — fall through to try regular enemies
    }

    // Boss final phase: simultaneous key detection (no fall-through, boss demands full attention)
    if (this.boss?.alive && this.boss.phase === 'final' && this.boss.finalPairActive) {
      const pair = this.boss.currentPair;
      if (pair) {
        const isValidKey = pair[0] === char || pair[1] === char;

        if (!isValidKey) {
          // Wrong key
          this.firstPressedKey = null;
          this.onMiss(char);
          return;
        }

        if (this.firstPressedKey === null) {
          // First valid key pressed
          this.firstPressedKey = char;
          this.firstPressedTime = performance.now();
          return;
        }

        if (this.firstPressedKey === char) {
          // Same key pressed again
          this.firstPressedKey = null;
          this.onMiss(char);
          return;
        }

        // Second valid key (the OTHER one) within window
        const elapsed = performance.now() - this.firstPressedTime;
        if (elapsed <= this.simultaneousWindow) {
          // Success!
          this.firstPressedKey = null;
          this.onFinalPairSuccess();
          return;
        } else {
          // Too slow
          this.firstPressedKey = null;
          this.onMiss(char);
          this.addFloatingText('!מהר יותר', this.renderer.width / 2, this.renderer.height / 2, '#ff8844', 28);
          return;
        }
      }
    }

    // During final phase delay, block input (boss demands attention)
    if (this.boss?.alive && this.boss.phase === 'final' && !this.boss.finalPairActive) {
      return;
    }

    // Check locked enemy
    if (this.lockedEnemy?.alive) {
      if (this.lockedEnemy.matches(char)) {
        this.onEnemyHit(this.lockedEnemy, char);
        return;
      } else {
        // Miss on locked target - break lock
        this.lockedEnemy.lockedOn = false;
        this.lockedEnemy = null;
        this.onMiss(char);
        return;
      }
    }

    // Find matching enemies, prefer the one closest to bottom
    const matching = this.enemies
      .filter((e) => e.alive && e.matches(char))
      .sort((a, b) => b.y - a.y);

    if (matching.length > 0) {
      this.onEnemyHit(matching[0], char);
    } else {
      this.onMiss(char);
    }
  }

  private onEnemyHit(enemy: Enemy, char: string): void {
    this.tracker.recordHit(char, enemy.aliveTime * 1000);
    this.sound.hit();
    this.combo++;
    this.tracker.recordCombo(this.combo);
    this.checkComboMilestone();

    const defeated = enemy.hit();

    if (defeated) {
      this.onEnemyDefeated(enemy);
    } else if (enemy.type === 'word') {
      // Lock on to word enemy
      enemy.lockedOn = true;
      this.lockedEnemy = enemy;
    }
  }

  private onEnemyDefeated(enemy: Enemy): void {
    this.enemiesDefeated++;
    this.sound.defeat();

    // Score: base + combo bonus
    const baseScore = enemy.type === 'word' ? enemy.text.length * 15 : 10;
    const comboBonus = Math.floor(this.combo * 2);
    const points = baseScore + comboBonus;
    this.score += points;

    // Floating score text
    this.addFloatingText(`+${points}`, enemy.x, enemy.y - 20, '#ffd700', 20);

    // Particles
    this.particles.emit(enemy.x, enemy.y, enemy.color, 20);

    // Track word completion
    if (enemy.type === 'word') {
      this.tracker.recordWordComplete();
    }

    // Unlock lock
    if (this.lockedEnemy === enemy) {
      this.lockedEnemy = null;
    }

    // Power-up drop
    if (enemy.dropsPowerUp) {
      this.activatePowerUp();
    }
  }

  private onMissileHit(missile: Missile, char: string): void {
    this.tracker.recordHit(char, missile.aliveTime * 1000);
    this.sound.hit();
    this.combo++;
    this.tracker.recordCombo(this.combo);
    this.checkComboMilestone();

    missile.destroy();
    this.particles.emit(missile.x, missile.y, '#ff6644', 12);

    const points = 15 + Math.floor(this.combo * 2);
    this.score += points;
    this.addFloatingText(`+${points}`, missile.x, missile.y - 20, '#ffd700', 20);
  }

  private onFinalPairSuccess(): void {
    if (!this.boss) return;
    this.sound.simultaneousSuccess();
    this.combo++;
    this.tracker.recordCombo(this.combo);
    this.particles.emit(this.boss.x, this.boss.y, '#ffd700', 15);

    const points = 50 + Math.floor(this.combo * 2);
    this.score += points;
    this.addFloatingText(`+${points}`, this.boss.x, this.boss.y + this.boss.radius + 60, '#ffd700', 28);

    const defeated = this.boss.advanceFinalPair();
    if (defeated) {
      // Boss defeated - big particles
      this.particles.emit(this.boss.x, this.boss.y, '#ff3333', 40);
      this.particles.emit(this.boss.x, this.boss.y, '#ffd700', 30);
      this.sound.bossDefeat();
      this.tracker.recordBossDefeat();

      const bossScore = this.boss.text.length * 50;
      this.score += bossScore;
      this.addFloatingText(`+${bossScore}`, this.boss.x, this.boss.y - 40, '#ffd700', 32);
    }
  }

  private onMissileReachedBottom(missile: Missile): void {
    missile.destroy();

    // Shield power-up absorbs the hit
    if (this.activePowerUp?.type === 'shield') {
      this.activePowerUp = null;
      this.addFloatingText('\u{1f6e1}\ufe0f', this.renderer.width / 2, this.renderer.height - 50, '#00ff80', 32);
      return;
    }

    this.lives--;
    this.combo = 0;
    this.sound.loseLife();

    if (this.lives <= 0) {
      this.onGameOver();
    }
  }

  private onBossDefeated(): void {
    this.boss = null;

    // Level complete!
    const achievements = this.tracker.checkAchievements(this.level);

    this.profile.recordLevelComplete({
      level: this.level,
      score: this.score,
      accuracy: this.tracker.accuracy,
      wpm: this.tracker.wpm,
      timestamp: Date.now(),
    });

    this.sound.levelComplete();

    this.levelComplete.show({
      level: this.level,
      score: this.score,
      accuracy: this.tracker.accuracy,
      wpm: this.tracker.wpm,
      maxCombo: this.tracker.maxCombo,
      newAchievements: achievements.map((id) => {
        const info = this.tracker.getAchievementInfo(id);
        return info ? `${info.icon} ${info.name}` : id;
      }),
    });
    this.screen = 'level-complete';
    this.hud.hide();
    this.removeKeyboardHint();
  }

  private onMiss(char: string): void {
    this.tracker.recordMiss(char);
    this.sound.miss();
    this.combo = 0;

    this.addFloatingText('✗', this.renderer.width / 2, this.renderer.height / 2, '#ff4444', 28);
  }

  private onEnemyReachedBottom(enemy: Enemy): void {
    enemy.alive = false;

    // Shield power-up absorbs the hit
    if (this.activePowerUp?.type === 'shield') {
      this.activePowerUp = null;
      this.addFloatingText('🛡️', this.renderer.width / 2, this.renderer.height - 50, '#00ff80', 32);
      return;
    }

    this.lives--;
    this.combo = 0;
    this.sound.loseLife();

    if (this.lockedEnemy === enemy) {
      this.lockedEnemy = null;
    }

    if (this.lives <= 0) {
      this.onGameOver();
    }
  }

  private onGameOver(): void {
    this.sound.gameOver();
    this.profile.save();

    this.gameOver.show(this.score, this.level);
    this.screen = 'game-over';
    this.hud.hide();
    this.removeKeyboardHint();
  }

  private startBossPhase(): void {
    if (!this.levelConfig.bossWord) {
      // No boss - level complete
      this.boss = null;
      this.onBossDefeated();
      return;
    }

    this.bossPhase = true;
    this.missiles = [];
    this.firstPressedKey = null;
    this.boss = new Boss(this.renderer.width);
    this.boss.init(this.levelConfig.bossWord, this.levelConfig.letters);
    this.sound.bossAppear();
    this.addFloatingText('!BOSS', this.renderer.width / 2, this.renderer.height / 2, '#ff3333', 48);
  }

  private activatePowerUp(): void {
    const types: PowerUpType[] = ['freeze', 'slowmo', 'shield'];
    const type = types[Math.floor(Math.random() * types.length)];

    let duration: number;
    switch (type) {
      case 'freeze':
        duration = 5000;
        break;
      case 'slowmo':
        duration = 8000;
        break;
      case 'shield':
        duration = 15000;
        break;
    }

    this.activePowerUp = { type, remainingMs: duration };
    this.sound.powerUp();

    const labels: Record<string, string> = {
      freeze: '❄️ הקפאה!',
      slowmo: '🐌 האטה!',
      shield: '🛡️ מגן!',
    };
    this.addFloatingText(labels[type], this.renderer.width / 2, this.renderer.height / 2, '#00ff80', 36);
  }

  private checkComboMilestone(): void {
    const milestones: Record<number, string> = {
      5: '!נחמד',
      10: '!מעולה',
      20: '!מדהים',
      50: '!אגדי',
    };

    const text = milestones[this.combo];
    if (text) {
      this.sound.combo();
      this.addFloatingText(text, this.renderer.width / 2, this.renderer.height * 0.35, '#ffd700', 40);
    }
  }

  private addFloatingText(
    text: string,
    x: number,
    y: number,
    color: string,
    size: number,
  ): void {
    this.floatingTexts.push({
      text,
      x,
      y,
      elapsed: 0,
      duration: 1.2,
      color,
      size,
    });
  }

  private resumeGame(): void {
    this.showScreen('playing');
  }

  private showPauseOverlay(): void {
    this.pauseEl = document.createElement('div');
    this.pauseEl.className = 'screen pause-overlay';
    this.pauseEl.innerHTML = `
      <div class="pause-title">⏸ השהייה</div>
      <button class="menu-btn primary" data-action="resume">▶ המשך</button>
      <button class="menu-btn" data-action="menu">🏠 תפריט ראשי</button>
    `;
    this.pauseEl.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      if (btn.dataset.action === 'resume') this.resumeGame();
      if (btn.dataset.action === 'menu') this.showScreen('menu');
    });
    this.overlay.appendChild(this.pauseEl);
  }

  private removePauseOverlay(): void {
    this.pauseEl?.remove();
    this.pauseEl = null;
  }

  private showKeyboardHint(): void {
    this.removeKeyboardHint();
    this.keyboardHintEl = document.createElement('div');
    this.keyboardHintEl.className = 'keyboard-hint';

    const rows = KEYBOARD_LAYOUT.map((row) => {
      const keys = row
        .map((k) => {
          const isHebrew = /[\u0590-\u05FF]/.test(k.hebrew);
          return `<div class="key finger-${k.finger}" data-hebrew="${k.hebrew}">${isHebrew ? k.hebrew : ''}</div>`;
        })
        .join('');
      return `<div class="keyboard-row">${keys}</div>`;
    }).join('');

    this.keyboardHintEl.innerHTML = rows;
    this.overlay.appendChild(this.keyboardHintEl);
  }

  private removeKeyboardHint(): void {
    this.keyboardHintEl?.remove();
    this.keyboardHintEl = null;
  }

  private updateKeyboardHighlights(): void {
    if (!this.keyboardHintEl) return;

    // Collect expected chars
    const expected = new Set<string>();

    if (this.boss?.alive && this.boss.phase === 'missile') {
      // Highlight all active missile letters
      for (const missile of this.missiles) {
        if (missile.alive) expected.add(missile.letter);
      }
    } else if (this.boss?.alive && this.boss.phase === 'final') {
      const pair = this.boss.currentPair;
      if (pair) {
        expected.add(pair[0]);
        expected.add(pair[1]);
      }
    } else if (this.lockedEnemy?.alive) {
      expected.add(this.lockedEnemy.nextChar);
    } else {
      for (const enemy of this.enemies) {
        if (enemy.alive) expected.add(enemy.nextChar);
      }
    }

    // Only update DOM if changed
    const newKeys = [...expected].sort().join('');
    const oldKeys = [...this.highlightedKeys].sort().join('');
    if (newKeys === oldKeys) return;

    this.highlightedKeys = expected;

    const allKeys = this.keyboardHintEl.querySelectorAll('.key');
    for (const keyEl of allKeys) {
      const el = keyEl as HTMLElement;
      const hebrew = el.dataset.hebrew;
      if (hebrew && expected.has(hebrew)) {
        el.classList.add('highlight');
      } else {
        el.classList.remove('highlight');
      }
    }
  }
}
