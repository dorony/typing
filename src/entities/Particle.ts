export class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  life: number = 0;
  maxLife: number = 0;
  size: number = 0;
  color: string = '#fff';
  active: boolean = false;

  init(x: number, y: number, color: string): void {
    this.x = x;
    this.y = y;
    this.color = color;
    this.active = true;

    const angle = Math.random() * Math.PI * 2;
    const speed = 50 + Math.random() * 200;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.maxLife = 0.4 + Math.random() * 0.6;
    this.life = this.maxLife;
    this.size = 2 + Math.random() * 4;
  }

  update(dt: number): void {
    if (!this.active) return;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 100 * dt; // gravity
    this.life -= dt;

    if (this.life <= 0) {
      this.active = false;
    }
  }

  get opacity(): number {
    return Math.max(0, this.life / this.maxLife);
  }
}
