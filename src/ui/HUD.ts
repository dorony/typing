import type { ActivePowerUp } from '../state/GameState';

export class HUD {
  private el: HTMLDivElement;
  onPause: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'hud hidden';
    this.el.innerHTML = `
      <div class="hud-left">
        <div class="hud-lives"></div>
        <div class="hud-powerup hidden"></div>
      </div>
      <div class="hud-center">
        <div class="hud-combo"></div>
      </div>
      <div class="hud-right">
        <div class="hud-level"></div>
        <div class="hud-score"></div>
        <button class="hud-pause-btn">⏸</button>
      </div>
    `;
    container.appendChild(this.el);

    this.el.querySelector('.hud-pause-btn')!.addEventListener('click', () => {
      this.onPause?.();
    });
  }

  show(): void {
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }

  update(
    lives: number,
    score: number,
    combo: number,
    level: number,
    powerUp: ActivePowerUp | null,
  ): void {
    const livesEl = this.el.querySelector('.hud-lives')!;
    livesEl.textContent = '❤️'.repeat(Math.max(0, lives));

    const scoreEl = this.el.querySelector('.hud-score')!;
    scoreEl.textContent = `⭐ ${score.toLocaleString()}`;

    const comboEl = this.el.querySelector('.hud-combo')!;
    if (combo > 1) {
      comboEl.textContent = `🔥 x${combo}`;
      comboEl.classList.remove('hidden');
    } else {
      comboEl.textContent = '';
    }

    const levelEl = this.el.querySelector('.hud-level')!;
    levelEl.textContent = `שלב ${level}`;

    const powerUpEl = this.el.querySelector('.hud-powerup') as HTMLElement;
    if (powerUp) {
      const labels: Record<string, string> = {
        freeze: '❄️ הקפאה',
        slowmo: '🐌 האטה',
        shield: '🛡️ מגן',
      };
      const secs = Math.ceil(powerUp.remainingMs / 1000);
      powerUpEl.textContent = `${labels[powerUp.type]} ${secs}s`;
      powerUpEl.classList.remove('hidden');
    } else {
      powerUpEl.classList.add('hidden');
    }
  }
}
