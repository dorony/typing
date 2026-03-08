import type { PlayerProfileData, LetterStats, LevelResult } from './GameState';
import { Storage } from './Storage';

export class PlayerProfile {
  private storage: Storage;
  current: PlayerProfileData | null = null;

  constructor(storage: Storage) {
    this.storage = storage;

    const activeId = storage.getActiveProfileId();
    if (activeId) {
      this.current = storage.getProfile(activeId) ?? null;
    }
  }

  create(name: string, avatar: string): PlayerProfileData {
    const profile: PlayerProfileData = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      avatar,
      currentLevel: 1,
      totalScore: 0,
      letterStats: {},
      levelResults: [],
      achievements: [],
      createdAt: Date.now(),
    };
    this.storage.saveProfile(profile);
    return profile;
  }

  select(id: string): void {
    const profile = this.storage.getProfile(id);
    if (profile) {
      this.current = profile;
      this.storage.setActiveProfileId(id);
    }
  }

  getAll(): PlayerProfileData[] {
    return Object.values(this.storage.getProfiles());
  }

  delete(id: string): void {
    this.storage.deleteProfile(id);
    if (this.current?.id === id) {
      this.current = null;
    }
  }

  save(): void {
    if (this.current) {
      this.storage.saveProfile(this.current);
    }
  }

  recordLetterAttempt(letter: string, hit: boolean, reactionMs: number): void {
    if (!this.current) return;
    if (!this.current.letterStats[letter]) {
      this.current.letterStats[letter] = { attempts: 0, hits: 0, totalReactionMs: 0 };
    }
    const stats = this.current.letterStats[letter];
    stats.attempts++;
    if (hit) {
      stats.hits++;
      stats.totalReactionMs += reactionMs;
    }
  }

  recordLevelComplete(result: LevelResult): void {
    if (!this.current) return;
    this.current.levelResults.push(result);
    this.current.totalScore += result.score;
    if (result.level >= this.current.currentLevel) {
      this.current.currentLevel = result.level + 1;
    }
    this.save();
  }

  addAchievement(id: string): boolean {
    if (!this.current) return false;
    if (this.current.achievements.includes(id)) return false;
    this.current.achievements.push(id);
    this.save();
    return true;
  }

  getLetterStats(): Record<string, LetterStats> {
    return this.current?.letterStats ?? {};
  }

  getRecentAccuracy(last: number = 50): number {
    if (!this.current) return 0.5;
    const stats = Object.values(this.current.letterStats);
    if (stats.length === 0) return 0.5;
    let totalAttempts = 0;
    let totalHits = 0;
    for (const s of stats) {
      totalAttempts += Math.min(s.attempts, last);
      totalHits += Math.min(s.hits, last);
    }
    return totalAttempts > 0 ? totalHits / totalAttempts : 0.5;
  }
}
