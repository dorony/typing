export type BossPhase = 'entrance' | 'missile' | 'final' | 'defeated';

export class Boss {
  x: number;
  y: number;
  targetY: number;
  text: string;
  alive: boolean = true;
  radius: number;
  color: string = '#ff3333';
  opacity: number = 1;
  destroyTimer: number = 0;
  aliveTime: number = 0;
  glowIntensity: number = 0;
  /** Boss entrance animation progress (0-1) */
  entranceProgress: number = 0;

  // Phase state machine
  phase: BossPhase = 'entrance';

  // Missile phase
  missileLetters: string[] = [];
  missileFiredCount: number = 0;
  missilesDealtWith: number = 0;
  missileFireTimer: number = 0;
  missileFireInterval: number = 1.5;

  // Final phase
  finalPairs: [string, string][] = [];
  finalPairIndex: number = 0;
  finalPairActive: boolean = false;
  finalPairTimer: number = 0;
  finalPairShowDelay: number = 1.0;
  finalPairDeadline: number = 4.0;
  finalPairElapsed: number = 0;

  constructor(canvasWidth: number) {
    this.x = canvasWidth / 2;
    this.y = -80;
    this.targetY = 120;
    this.text = '';
    this.radius = 60;
  }

  init(
    word: string,
    levelLetters: string[],
    missileFireInterval: number = 1.5,
    extraMissileLetters: string[] = [],
    finalPairDeadline: number = 4.0,
  ): void {
    this.text = word;
    this.alive = true;
    this.opacity = 1;
    this.destroyTimer = 0;
    this.entranceProgress = 0;
    this.radius = 50 + word.length * 8;

    // Phase init
    this.phase = 'entrance';

    // Missile phase: boss word letters + extra letters, shuffled together
    const allLetters = [...word.split(''), ...extraMissileLetters];
    // Shuffle extra missiles into the mix (Fisher-Yates)
    for (let i = allLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLetters[i], allLetters[j]] = [allLetters[j], allLetters[i]];
    }
    this.missileLetters = allLetters;
    this.missileFiredCount = 0;
    this.missilesDealtWith = 0;
    this.missileFireTimer = 0;
    this.missileFireInterval = missileFireInterval;

    // Final phase: generate 3 pairs from levelLetters (no duplicates within pair)
    this.finalPairs = [];
    const available = [...levelLetters];
    for (let i = 0; i < 3; i++) {
      const pair = this.pickPair(available);
      this.finalPairs.push(pair);
    }
    this.finalPairIndex = 0;
    this.finalPairActive = false;
    this.finalPairTimer = 0;
    this.finalPairDeadline = finalPairDeadline;
    this.finalPairElapsed = 0;
  }

  private pickPair(pool: string[]): [string, string] {
    if (pool.length < 2) {
      return [pool[0] || 'א', pool[1] || 'ב'];
    }
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  }

  update(dt: number): void {
    this.aliveTime += dt;

    if (this.phase === 'entrance') {
      this.entranceProgress = Math.min(1, this.entranceProgress + dt * 0.8);
      this.y = -80 + (this.targetY + 80) * this.easeOutBack(this.entranceProgress);
      if (this.entranceProgress >= 1) {
        this.phase = 'missile';
        this.missileFireTimer = 0.5; // short delay before first missile
      }
      return;
    }

    if (this.phase === 'defeated') {
      this.destroyTimer += dt;
      // Hold visible for 1.5s of explosions, then fade out over 0.5s
      if (this.destroyTimer < 1.5) {
        this.opacity = 1;
      } else {
        this.opacity = Math.max(0, 1 - (this.destroyTimer - 1.5) / 0.5);
      }
      return;
    }

    // Idle bob during missile and final phases
    this.y = this.targetY + Math.sin(this.aliveTime * 2) * 5;
    this.glowIntensity = 0.3 + Math.sin(this.aliveTime * 4) * 0.2;

    // Missile fire timer
    if (this.phase === 'missile') {
      this.missileFireTimer -= dt;
    }

    // Final pair show delay
    if (this.phase === 'final' && !this.finalPairActive) {
      this.finalPairTimer += dt;
      if (this.finalPairTimer >= this.finalPairShowDelay) {
        this.finalPairActive = true;
        this.finalPairElapsed = 0;
      }
    }

    // Final pair deadline countdown
    if (this.phase === 'final' && this.finalPairActive) {
      this.finalPairElapsed += dt;
    }
  }

  /** Whether it's time to fire the next missile */
  shouldFireMissile(): boolean {
    return (
      this.phase === 'missile' &&
      this.missileFiredCount < this.missileLetters.length &&
      this.missileFireTimer <= 0
    );
  }

  /** Fire next missile, returns the letter */
  fireNextMissile(): string {
    const letter = this.missileLetters[this.missileFiredCount];
    this.missileFiredCount++;
    this.missileFireTimer = this.missileFireInterval;
    return letter;
  }

  get allMissilesFired(): boolean {
    return this.missileFiredCount >= this.missileLetters.length;
  }

  startFinalPhase(): void {
    this.phase = 'final';
    this.finalPairIndex = 0;
    this.finalPairActive = false;
    this.finalPairTimer = 0;
  }

  get currentPair(): [string, string] | null {
    if (this.phase !== 'final') return null;
    if (this.finalPairIndex >= this.finalPairs.length) return null;
    return this.finalPairs[this.finalPairIndex];
  }

  get isFinalPairExpired(): boolean {
    return this.finalPairElapsed >= this.finalPairDeadline;
  }

  /** Advance to next final pair. Returns true if boss is defeated. */
  advanceFinalPair(): boolean {
    this.finalPairIndex++;
    if (this.finalPairIndex >= this.finalPairs.length) {
      this.phase = 'defeated';
      this.alive = false;
      return true;
    }
    this.finalPairActive = false;
    this.finalPairTimer = 0;
    this.finalPairElapsed = 0;
    return false;
  }

  get isFullyDead(): boolean {
    return this.phase === 'defeated' && this.destroyTimer > 2.0;
  }

  /** Progress of the explosion sequence (0-1) during defeated phase */
  get explosionProgress(): number {
    if (this.phase !== 'defeated') return 0;
    return Math.min(1, this.destroyTimer / 1.5);
  }

  /** Health as fraction for the final phase (3 segments) */
  get healthPercent(): number {
    if (this.phase === 'final' || this.phase === 'defeated') {
      return (this.finalPairs.length - this.finalPairIndex) / this.finalPairs.length;
    }
    // During missile phase, show full health
    return 1;
  }

  /** For rendering: typed index is no longer used but keep for compatibility */
  get typedIndex(): number {
    return 0;
  }

  private easeOutBack(t: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}
