import type { LetterStats, GameSettings } from '../state/GameState';

export class DifficultyScaler {
  /**
   * Choose which letter to spawn, weighted by weakness.
   * 40% chance to target weak letters, 60% random.
   */
  pickLetter(pool: string[], letterStats: Record<string, LetterStats>): string {
    if (Math.random() > 0.4 || pool.length <= 2) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // Build weakness scores
    const scored = pool.map((letter) => {
      const stats = letterStats[letter];
      if (!stats || stats.attempts === 0) {
        // Never seen = high priority
        return { letter, weight: 3 };
      }
      const accuracy = stats.hits / stats.attempts;
      // Lower accuracy = higher weight
      return { letter, weight: Math.max(0.1, 2 - accuracy * 2) };
    });

    const totalWeight = scored.reduce((sum, s) => sum + s.weight, 0);
    let rand = Math.random() * totalWeight;

    for (const s of scored) {
      rand -= s.weight;
      if (rand <= 0) return s.letter;
    }

    return pool[0];
  }

  /** Get speed multiplier based on difficulty setting and player performance */
  getSpeedMultiplier(settings: GameSettings, recentAccuracy: number): number {
    const bases: Record<string, number> = {
      easy: 0.7,
      normal: 1.0,
      hard: 1.3,
      'very-hard': 1.6,
      master: 2.0,
    };
    const base = bases[settings.difficulty] ?? 1.0;

    // Slightly adjust based on how well player is doing
    // If accuracy > 90%, speed up a bit; if < 60%, slow down
    if (recentAccuracy > 0.9) return base * 1.1;
    if (recentAccuracy < 0.6) return base * 0.85;
    return base;
  }

  /** Get spawn interval multiplier */
  getSpawnMultiplier(settings: GameSettings): number {
    const multipliers: Record<string, number> = {
      easy: 1.4,
      normal: 1.0,
      hard: 0.75,
      'very-hard': 0.55,
      master: 0.4,
    };
    return multipliers[settings.difficulty] ?? 1.0;
  }
}
