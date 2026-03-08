import { Enemy } from './Enemy';
import type { LevelConfig } from '../curriculum/LetterProgression';
import type { EnemyType, LetterStats } from '../state/GameState';
import { DifficultyScaler } from '../curriculum/DifficultyScaler';
import { getRandomWord } from '../curriculum/WordBank';

export class EnemyFactory {
  private difficultyScaler = new DifficultyScaler();

  spawn(
    levelConfig: LevelConfig,
    canvasWidth: number,
    letterStats: Record<string, LetterStats>,
    speedMultiplier: number,
  ): Enemy {
    const type = this.pickEnemyType(levelConfig);
    const text = this.pickText(type, levelConfig, letterStats);
    const speed = this.calcSpeed(type, levelConfig) * speedMultiplier;

    const margin = 60;
    const x = margin + Math.random() * (canvasWidth - margin * 2);

    const enemy = new Enemy(x, -40, speed, text, type);

    // 10% chance to drop a power-up
    if (Math.random() < 0.1) {
      enemy.dropsPowerUp = true;
    }

    return enemy;
  }

  private pickEnemyType(config: LevelConfig): EnemyType {
    const types = config.enemyTypes.filter((t) => t !== 'boss');
    return types[Math.floor(Math.random() * types.length)];
  }

  private pickText(
    type: EnemyType,
    config: LevelConfig,
    letterStats: Record<string, LetterStats>,
  ): string {
    if (type === 'word') {
      if (config.wordTier > 0) {
        return getRandomWord(config.wordTier);
      }
      if (config.wordTier === -1) {
        // Generate a random combo from the letter pool
        const minLen = Math.max(2, config.maxWordLen - 1);
        const len = minLen + Math.floor(Math.random() * (config.maxWordLen - minLen + 1));
        let combo = '';
        for (let i = 0; i < len; i++) {
          combo += this.difficultyScaler.pickLetter(config.letters, letterStats);
        }
        return combo;
      }
    }
    return this.difficultyScaler.pickLetter(config.letters, letterStats);
  }

  private calcSpeed(type: EnemyType, config: LevelConfig): number {
    switch (type) {
      case 'fast':
        return config.baseSpeed * 1.5;
      case 'armored':
        return config.baseSpeed * 0.7;
      case 'word':
        return config.baseSpeed * 0.6;
      default:
        return config.baseSpeed;
    }
  }
}
