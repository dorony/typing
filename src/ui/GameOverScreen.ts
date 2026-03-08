export class GameOverScreen {
  private el: HTMLDivElement;
  onRetry: (() => void) | null = null;
  onMenu: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'screen game-over-screen hidden';
    container.appendChild(this.el);
  }

  show(score: number, level: number): void {
    this.el.innerHTML = `
      <div class="game-over-title">💥 המשחק נגמר</div>
      <div class="game-over-score">ניקוד: ${score.toLocaleString()}</div>
      <div style="color:#88ccff;font-size:1.2rem;margin-bottom:2rem">שלב ${level}</div>
      <button class="menu-btn primary" data-action="retry">🔄 נסה שוב</button>
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
    if (btn.dataset.action === 'retry') this.onRetry?.();
    if (btn.dataset.action === 'menu') this.onMenu?.();
  };
}
