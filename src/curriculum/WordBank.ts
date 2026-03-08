/** Hebrew words organized by difficulty tier */

export interface WordEntry {
  word: string;
  tier: number;
  category?: string;
}

/** Tier 1: Simple 2-3 letter words */
const TIER_1: WordEntry[] = [
  { word: 'יד', tier: 1 },
  { word: 'דג', tier: 1 },
  { word: 'כל', tier: 1 },
  { word: 'על', tier: 1 },
  { word: 'חג', tier: 1 },
  { word: 'של', tier: 1 },
  { word: 'גל', tier: 1 },
  { word: 'עד', tier: 1 },
  { word: 'כד', tier: 1 },
  { word: 'שד', tier: 1 },
  { word: 'גן', tier: 1 },
  { word: 'חם', tier: 1 },
  { word: 'אם', tier: 1 },
  { word: 'אב', tier: 1 },
  { word: 'בן', tier: 1 },
  { word: 'בת', tier: 1 },
  { word: 'זה', tier: 1 },
  { word: 'מה', tier: 1 },
  { word: 'לא', tier: 1 },
  { word: 'כן', tier: 1 },
];

/** Tier 2: 3-4 letter words */
const TIER_2: WordEntry[] = [
  { word: 'שלום', tier: 2 },
  { word: 'אור', tier: 2 },
  { word: 'קול', tier: 2 },
  { word: 'רוח', tier: 2 },
  { word: 'שיר', tier: 2 },
  { word: 'טוב', tier: 2 },
  { word: 'יום', tier: 2 },
  { word: 'פרי', tier: 2 },
  { word: 'ארון', tier: 2 },
  { word: 'עוגה', tier: 2 },
  { word: 'גשם', tier: 2 },
  { word: 'שמש', tier: 2 },
  { word: 'לחם', tier: 2 },
  { word: 'דבש', tier: 2 },
  { word: 'חלב', tier: 2 },
  { word: 'מים', tier: 2 },
  { word: 'אמא', tier: 2 },
  { word: 'אבא', tier: 2 },
  { word: 'ילד', tier: 2 },
  { word: 'סוס', tier: 2 },
];

/** Tier 3: 4-5 letter words, themed */
const TIER_3: WordEntry[] = [
  { word: 'בית', tier: 3, category: 'home' },
  { word: 'חתול', tier: 3, category: 'animals' },
  { word: 'כלב', tier: 3, category: 'animals' },
  { word: 'ירוק', tier: 3, category: 'colors' },
  { word: 'אדום', tier: 3, category: 'colors' },
  { word: 'ספר', tier: 3, category: 'school' },
  { word: 'ירח', tier: 3, category: 'nature' },
  { word: 'כוכב', tier: 3, category: 'space' },
  { word: 'ילדה', tier: 3, category: 'family' },
  { word: 'חלון', tier: 3, category: 'home' },
  { word: 'דלת', tier: 3, category: 'home' },
  { word: 'כיסא', tier: 3, category: 'home' },
  { word: 'צבע', tier: 3, category: 'school' },
  { word: 'פרח', tier: 3, category: 'nature' },
  { word: 'עץ', tier: 3, category: 'nature' },
  { word: 'ציפור', tier: 3, category: 'animals' },
  { word: 'דרך', tier: 3, category: 'general' },
  { word: 'חדש', tier: 3, category: 'general' },
  { word: 'גדול', tier: 3, category: 'general' },
  { word: 'קטן', tier: 3, category: 'general' },
];

/** Tier 4: Challenge words (5+ letters) */
const TIER_4: WordEntry[] = [
  { word: 'מחשב', tier: 4 },
  { word: 'טלפון', tier: 4 },
  { word: 'מקלדת', tier: 4 },
  { word: 'חלל', tier: 4 },
  { word: 'כדורגל', tier: 4 },
  { word: 'ארוחה', tier: 4 },
  { word: 'חברים', tier: 4 },
  { word: 'גלידה', tier: 4 },
  { word: 'שוקולד', tier: 4 },
  { word: 'מוסיקה', tier: 4 },
  { word: 'משפחה', tier: 4 },
  { word: 'שולחן', tier: 4 },
  { word: 'תלמיד', tier: 4 },
  { word: 'מורה', tier: 4 },
  { word: 'חבר', tier: 4 },
  { word: 'בקבוק', tier: 4 },
  { word: 'מטוס', tier: 4 },
  { word: 'אוטובוס', tier: 4 },
  { word: 'רכבת', tier: 4 },
  { word: 'ממתק', tier: 4 },
];

export const WORD_BANK: WordEntry[][] = [TIER_1, TIER_2, TIER_3, TIER_4];

export function getWordsForTier(tier: number): WordEntry[] {
  return WORD_BANK[Math.min(tier - 1, WORD_BANK.length - 1)] ?? TIER_1;
}

export function getRandomWord(tier: number): string {
  const words = getWordsForTier(tier);
  return words[Math.floor(Math.random() * words.length)].word;
}
