import { PlayerProfile } from './PlayerProfile';
import { ACHIEVEMENTS } from './GameState';
import { TOTAL_LEVELS } from '../curriculum/LetterProgression';

export class ProgressTracker {
  private profile: PlayerProfile;

  // Session stats
  totalTyped: number = 0;
  totalHits: number = 0;
  totalMisses: number = 0;
  maxCombo: number = 0;
  wordsCompleted: number = 0;
  bossesDefeated: number = 0;
  levelStartTime: number = 0;
  perfectLevels: number = 0;
  highAccuracyLevels: number = 0;

  constructor(profile: PlayerProfile) {
    this.profile = profile;
  }

  resetLevel(): void {
    this.totalTyped = 0;
    this.totalHits = 0;
    this.totalMisses = 0;
    this.maxCombo = 0;
    this.wordsCompleted = 0;
    this.levelStartTime = performance.now();
  }

  recordHit(letter: string, reactionMs: number): void {
    this.totalTyped++;
    this.totalHits++;
    this.profile.recordLetterAttempt(letter, true, reactionMs);
  }

  recordMiss(letter: string): void {
    this.totalTyped++;
    this.totalMisses++;
    this.profile.recordLetterAttempt(letter, false, 0);
  }

  recordCombo(combo: number): void {
    this.maxCombo = Math.max(this.maxCombo, combo);
  }

  recordWordComplete(): void {
    this.wordsCompleted++;
  }

  recordBossDefeat(): void {
    this.bossesDefeated++;
  }

  get accuracy(): number {
    return this.totalTyped > 0 ? this.totalHits / this.totalTyped : 0;
  }

  get wpm(): number {
    const elapsedMin = (performance.now() - this.levelStartTime) / 60000;
    if (elapsedMin < 0.01) return 0;
    // Approximate: 5 chars = 1 word
    return Math.round(this.totalHits / 5 / elapsedMin);
  }

  /** Check and award achievements after level complete */
  checkAchievements(level: number): string[] {
    const newAchievements: string[] = [];
    const profile = this.profile.current;
    if (!profile) return newAchievements;

    const tryAward = (id: string) => {
      if (this.profile.addAchievement(id)) {
        newAchievements.push(id);
      }
    };

    // Home Row Hero: completed home row (5 groups × 10 = level 50)
    if (level >= 50 && profile.currentLevel > 50) {
      tryAward('home_row_hero');
    }

    // Speed Demon: 30 WPM
    if (this.wpm >= 30) {
      tryAward('speed_demon');
    }

    // Combo King: combo 20
    if (this.maxCombo >= 20) {
      tryAward('combo_king');
    }

    // Boss Slayer: 5 bosses
    const totalBosses = profile.levelResults.length;
    if (totalBosses >= 5) {
      tryAward('boss_slayer');
    }

    // Perfect Level: 100% accuracy
    if (this.accuracy >= 1.0 && this.totalTyped >= 5) {
      tryAward('perfect_level');
      this.perfectLevels++;
    }

    // Word Master: 50 words
    const totalWords = profile.levelResults.reduce((sum, _) => sum, 0) + this.wordsCompleted;
    if (totalWords >= 50 || this.wordsCompleted >= 50) {
      tryAward('word_master');
    }

    // Full Keyboard: completed home + top rows (9 groups × 10 = level 90)
    if (level >= 90) {
      tryAward('full_keyboard');
    }

    // Legendary Combo: 50
    if (this.maxCombo >= 50) {
      tryAward('legendary_combo');
    }

    // Sharpshooter: 3 levels with 95%+ accuracy
    if (this.accuracy >= 0.95) {
      this.highAccuracyLevels++;
    }
    if (this.highAccuracyLevels >= 3) {
      tryAward('sharpshooter');
    }

    // Graduate: all levels
    if (level >= TOTAL_LEVELS) {
      tryAward('graduate');
    }

    return newAchievements;
  }

  getAchievementInfo(id: string) {
    return ACHIEVEMENTS.find((a) => a.id === id);
  }
}
