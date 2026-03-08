export class GameLoop {
  private running: boolean = false;
  private lastTime: number = 0;
  private callback: (dt: number) => void;
  private rafId: number = 0;

  constructor(callback: (dt: number) => void) {
    this.callback = callback;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick = (now: number): void => {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Cap at 100ms
    this.lastTime = now;
    this.callback(dt);
    this.rafId = requestAnimationFrame(this.tick);
  };
}
