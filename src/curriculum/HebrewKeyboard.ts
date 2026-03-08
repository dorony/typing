/** QWERTY key → Hebrew letter mapping (standard Israeli keyboard layout) */
export const QWERTY_TO_HEBREW: Record<string, string> = {
  q: '/',
  w: '\'',
  e: 'ק',
  r: 'ר',
  t: 'א',
  y: 'ט',
  u: 'ו',
  i: 'ן',
  o: 'ם',
  p: 'פ',
  a: 'ש',
  s: 'ד',
  d: 'ג',
  f: 'כ',
  g: 'ע',
  h: 'י',
  j: 'ח',
  k: 'ל',
  l: 'ך',
  ';': 'ף',
  z: 'ז',
  x: 'ס',
  c: 'ב',
  v: 'ה',
  b: 'נ',
  n: 'מ',
  m: 'צ',
  ',': 'ת',
  '.': 'ץ',
  '/': '.',
};

export type FingerGroup = 'pinky' | 'ring' | 'middle' | 'index';

export interface KeyInfo {
  hebrew: string;
  qwerty: string;
  row: 'top' | 'home' | 'bottom';
  hand: 'left' | 'right';
  finger: FingerGroup;
}

/** Full Hebrew keyboard layout with finger assignments */
export const KEYBOARD_LAYOUT: KeyInfo[][] = [
  // Top row
  [
    { hebrew: '/', qwerty: 'q', row: 'top', hand: 'left', finger: 'pinky' },
    { hebrew: '\'', qwerty: 'w', row: 'top', hand: 'left', finger: 'ring' },
    { hebrew: 'ק', qwerty: 'e', row: 'top', hand: 'left', finger: 'middle' },
    { hebrew: 'ר', qwerty: 'r', row: 'top', hand: 'left', finger: 'index' },
    { hebrew: 'א', qwerty: 't', row: 'top', hand: 'left', finger: 'index' },
    { hebrew: 'ט', qwerty: 'y', row: 'top', hand: 'right', finger: 'index' },
    { hebrew: 'ו', qwerty: 'u', row: 'top', hand: 'right', finger: 'index' },
    { hebrew: 'ן', qwerty: 'i', row: 'top', hand: 'right', finger: 'middle' },
    { hebrew: 'ם', qwerty: 'o', row: 'top', hand: 'right', finger: 'ring' },
    { hebrew: 'פ', qwerty: 'p', row: 'top', hand: 'right', finger: 'pinky' },
  ],
  // Home row
  [
    { hebrew: 'ש', qwerty: 'a', row: 'home', hand: 'left', finger: 'pinky' },
    { hebrew: 'ד', qwerty: 's', row: 'home', hand: 'left', finger: 'ring' },
    { hebrew: 'ג', qwerty: 'd', row: 'home', hand: 'left', finger: 'middle' },
    { hebrew: 'כ', qwerty: 'f', row: 'home', hand: 'left', finger: 'index' },
    { hebrew: 'ע', qwerty: 'g', row: 'home', hand: 'left', finger: 'index' },
    { hebrew: 'י', qwerty: 'h', row: 'home', hand: 'right', finger: 'index' },
    { hebrew: 'ח', qwerty: 'j', row: 'home', hand: 'right', finger: 'index' },
    { hebrew: 'ל', qwerty: 'k', row: 'home', hand: 'right', finger: 'middle' },
    { hebrew: 'ך', qwerty: 'l', row: 'home', hand: 'right', finger: 'ring' },
    { hebrew: 'ף', qwerty: ';', row: 'home', hand: 'right', finger: 'pinky' },
  ],
  // Bottom row
  [
    { hebrew: 'ז', qwerty: 'z', row: 'bottom', hand: 'left', finger: 'pinky' },
    { hebrew: 'ס', qwerty: 'x', row: 'bottom', hand: 'left', finger: 'ring' },
    { hebrew: 'ב', qwerty: 'c', row: 'bottom', hand: 'left', finger: 'middle' },
    { hebrew: 'ה', qwerty: 'v', row: 'bottom', hand: 'left', finger: 'index' },
    { hebrew: 'נ', qwerty: 'b', row: 'bottom', hand: 'left', finger: 'index' },
    { hebrew: 'מ', qwerty: 'n', row: 'bottom', hand: 'right', finger: 'index' },
    { hebrew: 'צ', qwerty: 'm', row: 'bottom', hand: 'right', finger: 'index' },
    { hebrew: 'ת', qwerty: ',', row: 'bottom', hand: 'right', finger: 'middle' },
    { hebrew: 'ץ', qwerty: '.', row: 'bottom', hand: 'right', finger: 'ring' },
  ],
];

/** All typeable Hebrew letters (excluding punctuation) */
export const ALL_HEBREW_LETTERS = KEYBOARD_LAYOUT.flat()
  .map((k) => k.hebrew)
  .filter((h) => /[\u0590-\u05FF]/.test(h));

/** Get key info by Hebrew letter */
export function getKeyInfo(hebrew: string): KeyInfo | undefined {
  for (const row of KEYBOARD_LAYOUT) {
    for (const key of row) {
      if (key.hebrew === hebrew) return key;
    }
  }
  return undefined;
}
