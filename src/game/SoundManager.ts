export class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  private getCtx(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return null;
      }
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.15): void {
    const ctx = this.getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  hit(): void {
    this.playTone(880, 0.1, 'sine', 0.12);
    setTimeout(() => this.playTone(1100, 0.08, 'sine', 0.08), 50);
  }

  miss(): void {
    this.playTone(200, 0.2, 'sawtooth', 0.1);
  }

  defeat(): void {
    this.playTone(523, 0.1, 'sine', 0.12);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.12), 80);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.12), 160);
  }

  loseLife(): void {
    this.playTone(400, 0.15, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.15), 100);
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth', 0.12), 200);
  }

  bossAppear(): void {
    this.playTone(150, 0.3, 'square', 0.12);
    setTimeout(() => this.playTone(120, 0.3, 'square', 0.12), 200);
    setTimeout(() => this.playTone(100, 0.5, 'square', 0.15), 400);
  }

  bossDefeat(): void {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => this.playTone(400 + i * 100, 0.15, 'sine', 0.12), i * 100);
    }
  }

  levelComplete(): void {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2, 'sine', 0.12), i * 150);
    });
  }

  gameOver(): void {
    const notes = [400, 350, 300, 200];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.3, 'sawtooth', 0.1), i * 200);
    });
  }

  powerUp(): void {
    this.playTone(600, 0.1, 'sine', 0.1);
    setTimeout(() => this.playTone(800, 0.1, 'sine', 0.1), 80);
    setTimeout(() => this.playTone(1200, 0.15, 'sine', 0.12), 160);
  }

  combo(): void {
    this.playTone(1000, 0.08, 'sine', 0.08);
    setTimeout(() => this.playTone(1200, 0.1, 'sine', 0.1), 60);
  }

  missileLaunch(): void {
    this.playTone(600, 0.15, 'sawtooth', 0.1);
    setTimeout(() => this.playTone(400, 0.15, 'sawtooth', 0.08), 100);
    setTimeout(() => this.playTone(250, 0.2, 'sawtooth', 0.06), 200);
  }

  simultaneousSuccess(): void {
    // Two-note chord
    const ctx = this.getCtx();
    if (!ctx) return;

    const freqs = [523, 784]; // C5 + G5
    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.12;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  }
}
