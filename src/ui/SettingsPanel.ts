import type { GameSettings } from '../state/GameState';

export class SettingsPanel {
  private el: HTMLDivElement;
  onBack: (() => void) | null = null;
  onChange: ((settings: GameSettings) => void) | null = null;
  private settings: GameSettings = {
    soundEnabled: true,
    keyboardHintEnabled: true,
    difficulty: 'normal',
  };

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'screen settings-screen hidden';
    container.appendChild(this.el);
  }

  show(settings: GameSettings): void {
    this.settings = { ...settings };
    this.render();
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }

  private render(): void {
    this.el.innerHTML = `
      <div class="settings-title">⚙️ הגדרות</div>
      <div class="settings-group">
        <div class="setting-row">
          <span class="setting-label">🔊 צלילים</span>
          <div class="toggle ${this.settings.soundEnabled ? 'active' : ''}" data-setting="sound"></div>
        </div>
        <div class="setting-row">
          <span class="setting-label">⌨️ רמז מקלדת</span>
          <div class="toggle ${this.settings.keyboardHintEnabled ? 'active' : ''}" data-setting="keyboard"></div>
        </div>
        <div class="setting-row">
          <span class="setting-label">📊 רמת קושי</span>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
            <button class="menu-btn ${this.settings.difficulty === 'easy' ? 'primary' : ''}" data-diff="easy" style="padding:0.4rem 0.8rem;min-width:auto;font-size:0.9rem">קל</button>
            <button class="menu-btn ${this.settings.difficulty === 'normal' ? 'primary' : ''}" data-diff="normal" style="padding:0.4rem 0.8rem;min-width:auto;font-size:0.9rem">רגיל</button>
            <button class="menu-btn ${this.settings.difficulty === 'hard' ? 'primary' : ''}" data-diff="hard" style="padding:0.4rem 0.8rem;min-width:auto;font-size:0.9rem">קשה</button>
            <button class="menu-btn ${this.settings.difficulty === 'very-hard' ? 'primary' : ''}" data-diff="very-hard" style="padding:0.4rem 0.8rem;min-width:auto;font-size:0.9rem">קשה מאוד</button>
            <button class="menu-btn ${this.settings.difficulty === 'master' ? 'primary' : ''}" data-diff="master" style="padding:0.4rem 0.8rem;min-width:auto;font-size:0.9rem">מאסטר</button>
          </div>
        </div>
      </div>
      <button class="menu-btn" data-action="back">חזרה</button>
    `;

    this.el.addEventListener('click', this.handleClick);
  }

  private handleClick = (e: Event): void => {
    const target = e.target as HTMLElement;

    const toggle = target.closest('.toggle') as HTMLElement;
    if (toggle) {
      const setting = toggle.dataset.setting;
      if (setting === 'sound') {
        this.settings.soundEnabled = !this.settings.soundEnabled;
      } else if (setting === 'keyboard') {
        this.settings.keyboardHintEnabled = !this.settings.keyboardHintEnabled;
      }
      this.onChange?.(this.settings);
      this.render();
      return;
    }

    const diffBtn = target.closest('[data-diff]') as HTMLElement;
    if (diffBtn) {
      this.settings.difficulty = diffBtn.dataset.diff as GameSettings['difficulty'];
      this.onChange?.(this.settings);
      this.render();
      return;
    }

    const backBtn = target.closest('[data-action="back"]');
    if (backBtn) this.onBack?.();
  };
}
