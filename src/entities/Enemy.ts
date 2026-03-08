import type { EnemyType } from '../state/GameState';

export class Enemy {
  x: number;
  y: number;
  speed: number;
  text: string;
  type: EnemyType;
  /** For word enemies: how many chars have been typed */
  typedIndex: number = 0;
  /** For armored enemies: hits remaining */
  hitsRemaining: number;
  /** Whether this enemy is "locked on" (player is typing its word) */
  lockedOn: boolean = false;
  /** Visual radius */
  radius: number;
  /** Alive flag */
  alive: boolean = true;
  /** Opacity for fade effects */
  opacity: number = 1;
  /** Destruction animation timer */
  destroyTimer: number = 0;
  /** Time this enemy has been alive (for scoring reaction time) */
  aliveTime: number = 0;
  /** Whether this enemy drops a power-up */
  dropsPowerUp: boolean = false;
  /** Color based on type */
  color: string;
  /** Glow intensity for lock-on effect */
  glowIntensity: number = 0;

  constructor(
    x: number,
    y: number,
    speed: number,
    text: string,
    type: EnemyType,
  ) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.text = text;
    this.type = type;

    switch (type) {
      case 'fast':
        this.radius = 25;
        this.hitsRemaining = 1;
        this.color = '#ff8844';
        break;
      case 'armored':
        this.radius = 40;
        this.hitsRemaining = 2;
        this.color = '#8866cc';
        break;
      case 'word':
        this.radius = 35 + text.length * 5;
        this.hitsRemaining = 1;
        this.color = '#44bb88';
        break;
      default:
        this.radius = 30;
        this.hitsRemaining = 1;
        this.color = '#4488ff';
    }
  }

  update(dt: number, speedMultiplier: number): void {
    if (!this.alive) {
      this.destroyTimer += dt;
      this.opacity = Math.max(0, 1 - this.destroyTimer / 0.3);
      return;
    }
    this.y += this.speed * speedMultiplier * dt;
    this.aliveTime += dt;

    // Animate glow for locked enemies
    if (this.lockedOn) {
      this.glowIntensity = 0.5 + Math.sin(this.aliveTime * 6) * 0.3;
    } else {
      this.glowIntensity = Math.max(0, this.glowIntensity - dt * 3);
    }
  }

  /** Returns the next expected character for this enemy */
  get nextChar(): string {
    if (this.type === 'word') {
      return this.text[this.typedIndex] ?? '';
    }
    return this.text;
  }

  /** Check if typing `char` matches this enemy */
  matches(char: string): boolean {
    return this.nextChar === char;
  }

  /** Process a hit. Returns true if enemy is defeated. */
  hit(): boolean {
    if (this.type === 'word') {
      this.typedIndex++;
      if (this.typedIndex >= this.text.length) {
        this.hitsRemaining = 0;
      }
    } else {
      this.hitsRemaining--;
    }

    if (this.hitsRemaining <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  /** Has the destroy animation finished */
  get isFullyDead(): boolean {
    return !this.alive && this.destroyTimer > 0.3;
  }

  /** Has the enemy reached the bottom of the screen */
  reachedBottom(canvasHeight: number): boolean {
    return this.alive && this.y - this.radius > canvasHeight;
  }
}
