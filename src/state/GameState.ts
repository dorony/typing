export type GameScreen =
  | 'menu'
  | 'profile-select'
  | 'playing'
  | 'paused'
  | 'level-intro'
  | 'level-complete'
  | 'game-over'
  | 'dashboard'
  | 'settings';

export type EnemyType = 'basic' | 'fast' | 'armored' | 'word' | 'boss';

export type PowerUpType = 'freeze' | 'slowmo' | 'shield';

export interface LetterStats {
  attempts: number;
  hits: number;
  totalReactionMs: number;
}

export interface LevelResult {
  level: number;
  score: number;
  accuracy: number;
  wpm: number;
  timestamp: number;
}

export interface PlayerProfileData {
  id: string;
  name: string;
  avatar: string;
  currentLevel: number;
  totalScore: number;
  letterStats: Record<string, LetterStats>;
  levelResults: LevelResult[];
  achievements: string[];
  createdAt: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  keyboardHintEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'very-hard' | 'master';
}

export interface ActivePowerUp {
  type: PowerUpType;
  remainingMs: number;
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  keyboardHintEnabled: true,
  difficulty: 'normal',
};

export const AVATARS = ['🚀', '👾', '🛸', '⭐', '🌙', '🪐', '👽', '🤖'];

export const ACHIEVEMENTS = [
  { id: 'home_row_hero', name: 'גיבור שורת הבית', desc: 'השלם את שורת הבית (50 שלבים)', icon: '🏠' },
  { id: 'speed_demon', name: 'שד המהירות', desc: 'הגע ל-30 WPM', icon: '⚡' },
  { id: 'combo_king', name: 'מלך הקומבו', desc: 'הגע לקומבו 20', icon: '🔥' },
  { id: 'boss_slayer', name: 'מחסל בוסים', desc: 'הביס 5 בוסים', icon: '👑' },
  { id: 'perfect_level', name: 'שלב מושלם', desc: 'סיים שלב עם 100% דיוק', icon: '💎' },
  { id: 'word_master', name: 'אלוף המילים', desc: 'הקלד 50 מילים נכון', icon: '📚' },
  { id: 'full_keyboard', name: 'מקלדת מלאה', desc: 'שלוט בשורות הבית והעליונה', icon: '⌨️' },
  { id: 'legendary_combo', name: 'קומבו אגדי', desc: 'הגע לקומבו 50', icon: '🌟' },
  { id: 'sharpshooter', name: 'צלף', desc: 'סיים 3 שלבים עם דיוק מעל 95%', icon: '🎯' },
  { id: 'graduate', name: 'בוגר', desc: 'סיים את כל השלבים', icon: '🎓' },
];
