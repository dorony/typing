import { Enemy } from '../entities/Enemy';

export class CollisionDetector {
  /** Returns enemies that reached the bottom */
  check(enemies: Enemy[], canvasHeight: number): Enemy[] {
    const reached: Enemy[] = [];
    for (const enemy of enemies) {
      if (enemy.reachedBottom(canvasHeight)) {
        reached.push(enemy);
      }
    }
    return reached;
  }
}
