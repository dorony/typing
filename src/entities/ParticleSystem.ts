import { Particle } from './Particle';

const POOL_SIZE = 200;

export class ParticleSystem {
  private pool: Particle[] = [];

  constructor() {
    for (let i = 0; i < POOL_SIZE; i++) {
      this.pool.push(new Particle());
    }
  }

  /** Spawn a burst of particles at position */
  emit(x: number, y: number, color: string, count: number = 20): void {
    let spawned = 0;
    for (const p of this.pool) {
      if (!p.active) {
        p.init(x, y, color);
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  update(dt: number): void {
    for (const p of this.pool) {
      if (p.active) {
        p.update(dt);
      }
    }
  }

  getActive(): Particle[] {
    return this.pool.filter((p) => p.active);
  }
}
