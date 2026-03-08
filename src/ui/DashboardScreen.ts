import type { PlayerProfileData } from '../state/GameState';
import { ACHIEVEMENTS } from '../state/GameState';
import { KEYBOARD_LAYOUT } from '../curriculum/HebrewKeyboard';
import { TOTAL_LEVELS } from '../curriculum/LetterProgression';

export class DashboardScreen {
  private el: HTMLDivElement;
  onBack: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'screen dashboard-screen hidden';
    container.appendChild(this.el);
  }

  show(profile: PlayerProfileData): void {
    this.el.innerHTML = `
      <div class="dashboard-title">📊 ${profile.name} - סטטיסטיקות</div>

      <div class="dashboard-section">
        <h3>מפת מקלדת (ירוק = חזק, אדום = חלש)</h3>
        ${this.renderHeatmap(profile)}
      </div>

      <div class="dashboard-section">
        <h3>מילים לדקה לפי שלב</h3>
        ${this.renderWpmChart(profile)}
      </div>

      <div class="dashboard-section">
        <h3>התקדמות</h3>
        <div style="font-size:1.2rem;margin-bottom:0.5rem">
          שלב נוכחי: <span style="color:#ffd700">${profile.currentLevel}</span> / ${TOTAL_LEVELS}
        </div>
        <div style="font-size:1.2rem;margin-bottom:0.5rem">
          ניקוד כולל: <span style="color:#ffd700">${profile.totalScore.toLocaleString()}</span>
        </div>
        <div style="width:100%;background:rgba(255,255,255,0.1);border-radius:0.5rem;height:20px;overflow:hidden">
          <div style="width:${(profile.currentLevel / TOTAL_LEVELS) * 100}%;background:linear-gradient(to right,#4488ff,#ffd700);height:100%;border-radius:0.5rem;transition:width 0.5s"></div>
        </div>
      </div>

      <div class="dashboard-section">
        <h3>🏆 הישגים</h3>
        <div class="achievements-grid">
          ${this.renderAchievements(profile)}
        </div>
      </div>

      <button class="menu-btn" data-action="back">חזרה</button>
    `;

    this.el.addEventListener('click', this.handleClick);
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
    this.el.removeEventListener('click', this.handleClick);
  }

  private handleClick = (e: Event): void => {
    const btn = (e.target as HTMLElement).closest('[data-action="back"]');
    if (btn) this.onBack?.();
  };

  private renderHeatmap(profile: PlayerProfileData): string {
    const rows = KEYBOARD_LAYOUT.map((row) => {
      const keys = row
        .filter((k) => /[\u0590-\u05FF]/.test(k.hebrew))
        .map((k) => {
          const stats = profile.letterStats[k.hebrew];
          let color = 'rgba(255,255,255,0.1)';
          let accText = '-';

          if (stats && stats.attempts > 0) {
            const acc = stats.hits / stats.attempts;
            accText = Math.round(acc * 100) + '%';
            if (acc >= 0.8) {
              color = `rgba(68, 204, 68, ${0.3 + acc * 0.4})`;
            } else if (acc >= 0.5) {
              color = `rgba(255, 170, 68, ${0.3 + acc * 0.3})`;
            } else {
              color = `rgba(255, 68, 68, ${0.4 + (1 - acc) * 0.3})`;
            }
          }

          return `<div class="key-cell" style="background:${color}">
            ${k.hebrew}
            <span class="key-accuracy">${accText}</span>
          </div>`;
        })
        .join('');
      return `<div class="keyboard-row">${keys}</div>`;
    }).join('');

    return `<div class="keyboard-heatmap">${rows}</div>`;
  }

  private renderWpmChart(profile: PlayerProfileData): string {
    const results = profile.levelResults.slice(-15);
    if (results.length === 0) {
      return '<div style="color:#666;text-align:center;padding:2rem">אין נתונים עדיין</div>';
    }

    const maxWpm = Math.max(...results.map((r) => r.wpm), 10);
    const barWidth = Math.max(20, Math.min(40, 600 / results.length));

    const bars = results
      .map((r, i) => {
        const height = (r.wpm / maxWpm) * 130;
        const left = i * (barWidth + 4) + 10;
        return `<div class="wpm-bar" style="left:${left}px;height:${height}px;width:${barWidth}px" title="שלב ${r.level}: ${r.wpm} WPM">
          <span class="wpm-label">${r.level}</span>
        </div>`;
      })
      .join('');

    return `<div class="wpm-chart">${bars}</div>`;
  }

  private renderAchievements(profile: PlayerProfileData): string {
    return ACHIEVEMENTS.map((a) => {
      const unlocked = profile.achievements.includes(a.id);
      return `<div class="achievement ${unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${a.icon}</div>
        <div class="achievement-name">${a.name}</div>
        <div class="achievement-desc">${a.desc}</div>
      </div>`;
    }).join('');
  }
}
