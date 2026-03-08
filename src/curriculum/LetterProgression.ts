import type { EnemyType } from '../state/GameState';

export interface LevelConfig {
  level: number;
  name: string;
  description: string;
  letters: string[];
  /** Which word tier to use (0 = no words, -1 = generate combos from letter pool) */
  wordTier: number;
  /** Max word/combo length for generated combos (wordTier -1) */
  maxWordLen: number;
  /** Max enemies alive at once */
  maxEnemies: number;
  /** Seconds between spawns */
  spawnInterval: number;
  /** Base enemy speed (pixels per second) */
  baseSpeed: number;
  /** Allowed enemy types this level */
  enemyTypes: EnemyType[];
  /** How many enemies to defeat to complete the level (before boss) */
  enemiesRequired: number;
  /** Boss word (empty = no boss) */
  bossWord: string;
}

// Teaching order: 2 new letters per group (last group has 3)
// Progressing from index fingers outward through all keyboard rows
const LETTER_GROUPS: { newLetters: string[]; name: string; desc: string }[] = [
  // Home row - index fingers outward
  { newLetters: ['ח', 'כ'], name: 'ח, כ', desc: 'אצבעות מורות: ח, כ' },
  { newLetters: ['י', 'ע'], name: 'י, ע', desc: 'אצבעות מורות: י, ע' },
  { newLetters: ['ל', 'ג'], name: 'ל, ג', desc: 'אצבעות אמצעיות: ל, ג' },
  { newLetters: ['ך', 'ד'], name: 'ך, ד', desc: 'אצבעות קמיצה: ך, ד' },
  { newLetters: ['ף', 'ש'], name: 'ף, ש', desc: 'זרתות: ף, ש' },
  // Top row
  { newLetters: ['ו', 'א'], name: 'ו, א', desc: 'שורה עליונה: ו, א' },
  { newLetters: ['ט', 'ר'], name: 'ט, ר', desc: 'שורה עליונה: ט, ר' },
  { newLetters: ['ן', 'ק'], name: 'ן, ק', desc: 'שורה עליונה: ן, ק' },
  { newLetters: ['ם', 'פ'], name: 'ם, פ', desc: 'שורה עליונה: ם, פ' },
  // Bottom row
  { newLetters: ['ה', 'מ'], name: 'ה, מ', desc: 'שורה תחתונה: ה, מ' },
  { newLetters: ['נ', 'צ'], name: 'נ, צ', desc: 'שורה תחתונה: נ, צ' },
  { newLetters: ['ב', 'ת'], name: 'ב, ת', desc: 'שורה תחתונה: ב, ת' },
  { newLetters: ['ס', 'ץ', 'ז'], name: 'ס, ץ, ז', desc: 'שורה תחתונה: ס, ץ, ז' },
];

// Build cumulative letter pools
function buildPools(): string[][] {
  const pools: string[][] = [];
  let accumulated: string[] = [];
  for (const group of LETTER_GROUPS) {
    accumulated = [...accumulated, ...group.newLetters];
    pools.push([...accumulated]);
  }
  return pools;
}

const POOLS = buildPools();

/** Generate a deterministic boss word from a letter pool */
function makeBossWord(pool: string[], length: number, offset: number): string {
  let word = '';
  for (let i = 0; i < length; i++) {
    word += pool[(offset + i * 3) % pool.length];
  }
  return word;
}

/**
 * Generate 10 levels for a letter group.
 *  1-2: single letters, slow, easy
 *  3-4: single letters, faster + fast enemies
 *  5-6: 2-letter combos
 *  7-8: 2-3 letter combos + armored
 *  9:   3-4 letter combos, fast
 *  10:  big boss, 4-5 letter combos
 */
function generateGroupLevels(
  groupIndex: number,
  startLevel: number,
): LevelConfig[] {
  const pool = POOLS[groupIndex];
  const group = LETTER_GROUPS[groupIndex];
  const levels: LevelConfig[] = [];

  // Difficulty curves across 10 sub-levels (index 0-9)
  const speeds =        [22, 26, 28, 32, 30, 34, 32, 36, 38, 40];
  const spawnIntervals =[3.5,3.0,2.8,2.4,2.6,2.2,2.2,2.0,1.8,1.6];
  const maxEnemiesList= [3,  3,  4,  4,  5,  5,  6,  6,  7,  8 ];
  const enemiesReq    = [8, 10, 10, 12, 12, 14, 14, 16, 18, 20 ];
  const maxWordLens   = [1,  1,  1,  1,  2,  2,  3,  3,  4,  5 ];
  const bossWordLens  = [2,  2,  3,  3,  3,  4,  4,  5,  5,  6 ];

  const enemyTypeSets: EnemyType[][] = [
    ['basic'],
    ['basic'],
    ['basic', 'fast'],
    ['basic', 'fast'],
    ['basic', 'word'],
    ['basic', 'fast', 'word'],
    ['basic', 'fast', 'word'],
    ['basic', 'fast', 'armored', 'word'],
    ['basic', 'fast', 'armored', 'word'],
    ['basic', 'fast', 'armored', 'word'],
  ];

  const descriptions = [
    group.desc,
    `${group.name} - תרגול`,
    `${group.name} - מהר יותר`,
    `${group.name} - אויבים מהירים`,
    `${group.name} - צירופי 2 אותיות`,
    `${group.name} - צירופים מהירים`,
    `${group.name} - צירופי 3 אותיות`,
    `${group.name} - אויבים משוריינים`,
    `${group.name} - צירופים ארוכים`,
    `${group.name} - אתגר!`,
  ];

  for (let i = 0; i < 10; i++) {
    const lvl = startLevel + i;
    const wordLen = maxWordLens[i];
    levels.push({
      level: lvl,
      name: `שלב ${lvl}`,
      description: descriptions[i],
      letters: pool,
      wordTier: wordLen > 1 ? -1 : 0,
      maxWordLen: wordLen,
      maxEnemies: maxEnemiesList[i],
      spawnInterval: spawnIntervals[i],
      baseSpeed: speeds[i],
      enemyTypes: enemyTypeSets[i],
      enemiesRequired: enemiesReq[i],
      bossWord: makeBossWord(pool, bossWordLens[i], i * 2),
    });
  }

  return levels;
}

// All Hebrew letters (full pool from last letter group)
const ALL_LETTERS = POOLS[POOLS.length - 1];

/**
 * Generate 20 word levels (131-150) with real Hebrew words.
 * Speed ramps up aggressively across both groups.
 */
function generateWordLevels(startLevel: number): LevelConfig[] {
  const levels: LevelConfig[] = [];

  // Boss words for the word levels (real Hebrew words, increasing length)
  const bossWords = [
    'שלום', 'גשם', 'חלב', 'ארון', 'כוכב',
    'ציפור', 'חלון', 'גדול', 'כיסא', 'משפחה',
    'מחשב', 'גלידה', 'שולחן', 'טלפון', 'חברים',
    'מקלדת', 'שוקולד', 'כדורגל', 'אוטובוס', 'מוסיקה',
  ];

  for (let i = 0; i < 20; i++) {
    const lvl = startLevel + i;
    const t = i / 19; // 0..1 progress through word levels

    // Speed ramps from 40 to 82
    const speed = Math.round(40 + t * 42);
    // Spawn interval shrinks from 2.0 to 0.75
    const spawnInterval = +(2.0 - t * 1.25).toFixed(2);
    // More enemies on screen
    const maxEnemies = Math.round(5 + t * 5);
    // More enemies required
    const enemiesReq = Math.round(14 + t * 12);

    // Word tier: first 10 use tiers 1-2, last 10 use tiers 3-4
    let wordTier: number;
    if (i < 5) wordTier = 1;
    else if (i < 10) wordTier = 2;
    else if (i < 15) wordTier = 3;
    else wordTier = 4;

    const groupIdx = i < 10 ? 0 : 1;
    const groupNames = ['מילים קלות', 'מילים מאתגרות'];
    const descriptions = [
      `${groupNames[groupIdx]} - מהירות ${Math.round((1 + t) * 100)}%`,
    ];

    levels.push({
      level: lvl,
      name: `שלב ${lvl}`,
      description: descriptions[0],
      letters: ALL_LETTERS,
      wordTier,
      maxWordLen: 5,
      maxEnemies,
      spawnInterval,
      baseSpeed: speed,
      enemyTypes: ['basic', 'fast', 'armored', 'word'],
      enemiesRequired: enemiesReq,
      bossWord: bossWords[i],
    });
  }

  return levels;
}

/** Group names for UI (level select modal) */
export const GROUP_NAMES = [
  ...LETTER_GROUPS.map((g) => g.name),
  'מילים קלות',
  'מילים מאתגרות',
];

const letterLevels = LETTER_GROUPS.flatMap((_, gi) =>
  generateGroupLevels(gi, gi * 10 + 1),
);

const wordLevels = generateWordLevels(letterLevels.length + 1);

export const LEVELS: LevelConfig[] = [...letterLevels, ...wordLevels];

export const TOTAL_LEVELS = LEVELS.length; // 150

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(level - 1, LEVELS.length - 1)];
}
