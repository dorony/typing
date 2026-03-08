export interface LevelCompleteData {
  level: number;
  score: number;
  accuracy: number;
  wpm: number;
  maxCombo: number;
  newAchievements: string[];
}

export class LevelCompleteScreen {
  private el: HTMLDivElement;
  onNext: (() => void) | null = null;
  onMenu: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'screen level-complete-screen hidden';
    container.appendChild(this.el);
  }

  show(data: LevelCompleteData): void {
    const achievementsHtml = data.newAchievements.length > 0
      ? `<div style="margin-bottom:1.5rem;color:#ffd700;font-size:1.3rem">
          🏆 הישגים חדשים!<br>
          ${data.newAchievements.join(' ')}
        </div>`
      : '';

    this.el.innerHTML = `
      <div class="level-complete-title">🎉 שלב ${data.level} הושלם!</div>
      <div class="stats-grid">
        <div class="stat-label">ניקוד:</div>
        <div class="stat-value">${data.score.toLocaleString()}</div>
        <div class="stat-label">דיוק:</div>
        <div class="stat-value">${Math.round(data.accuracy * 100)}%</div>
        <div class="stat-label">מילים לדקה:</div>
        <div class="stat-value">${data.wpm}</div>
        <div class="stat-label">קומבו מקסימלי:</div>
        <div class="stat-value">${data.maxCombo}</div>
      </div>
      ${achievementsHtml}
      <button class="menu-btn primary" data-action="next">▶ שלב הבא</button>
      <button class="menu-btn" data-action="menu">🏠 תפריט ראשי</button>
    `;

    this.el.addEventListener('click', this.handleClick);
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
    if (!btn) return;
    if (btn.dataset.action === 'next') this.onNext?.();
    if (btn.dataset.action === 'menu') this.onMenu?.();
  };
}
