export class Missile {
  x: number;
  y: number;
  speed: number;
  letter: string;
  alive: boolean = true;
  opacity: number = 1;
  destroyTimer: number = 0;
  radius: number = 18;
  color: string = '#ff6644';
  aliveTime: number = 0;

  constructor(x: number, y: number, speed: number, letter: string) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.letter = letter;
  }

  update(dt: number): void {
    if (!this.alive) {
      this.destroyTimer += dt;
      this.opacity = Math.max(0, 1 - this.destroyTimer / 0.3);
      return;
    }
    this.y += this.speed * dt;
    this.aliveTime += dt;
  }

  matches(char: string): boolean {
    return this.alive && this.letter === char;
  }

  destroy(): void {
    this.alive = false;
  }

  reachedBottom(canvasHeight: number): boolean {
    return this.alive && this.y - this.radius > canvasHeight;
  }

  get isFullyDead(): boolean {
    return !this.alive && this.destroyTimer > 0.3;
  }
}
