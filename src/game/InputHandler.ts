import { QWERTY_TO_HEBREW } from '../curriculum/HebrewKeyboard';

type InputCallback = (hebrewChar: string) => void;

export class InputHandler {
  private callback: InputCallback | null = null;
  private boundHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.boundHandler = this.handleKeyDown.bind(this);
  }

  setCallback(cb: InputCallback): void {
    this.callback = cb;
  }

  enable(): void {
    window.addEventListener('keydown', this.boundHandler);
  }

  disable(): void {
    window.removeEventListener('keydown', this.boundHandler);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // Don't intercept when focus is on an input element
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // Ignore modifier keys, function keys, etc.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length > 1 && !this.isHebrewChar(e.key)) return;

    e.preventDefault();

    let hebrewChar: string;

    // Check if the key is already a Hebrew character (native Hebrew input)
    if (this.isHebrewChar(e.key)) {
      hebrewChar = e.key;
    } else {
      // Map QWERTY to Hebrew
      const mapped = QWERTY_TO_HEBREW[e.key.toLowerCase()];
      if (!mapped || !this.isHebrewChar(mapped)) return;
      hebrewChar = mapped;
    }

    this.callback?.(hebrewChar);
  }

  private isHebrewChar(char: string): boolean {
    return /[\u0590-\u05FF]/.test(char);
  }
}
