import type { PlayerProfileData } from '../state/GameState';
import { TOTAL_LEVELS, LEVELS, GROUP_NAMES } from '../curriculum/LetterProgression';

export class MenuScreen {
  private el: HTMLDivElement;
  onPlay: ((level: number) => void) | null = null;
  onProfiles: (() => void) | null = null;
  onDashboard: (() => void) | null = null;
  onSettings: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'screen menu-screen hidden';
    this.el.innerHTML = `
      <div class="menu-title">מגיני החלל</div>
      <div class="menu-subtitle">Space Defenders</div>
      <div class="menu-player-info hidden"></div>
      <button class="menu-btn primary" data-action="play">🚀 התחל משחק</button>
      <button class="menu-btn" data-action="select-level">🗺️ בחר שלב</button>
      <button class="menu-btn" data-action="profiles">👤 שחקנים</button>
      <button class="menu-btn" data-action="dashboard">📊 סטטיסטיקות</button>
      <button class="menu-btn" data-action="settings">⚙️ הגדרות</button>
    `;
    container.appendChild(this.el);

    this.el.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
      if (!btn) return;
      switch (btn.dataset.action) {
        case 'play':
          this.onPlay?.(this.currentLevel);
          break;
        case 'select-level':
          this.showLevelSelect();
          break;
        case 'profiles':
          this.onProfiles?.();
          break;
        case 'dashboard':
          this.onDashboard?.();
          break;
        case 'settings':
          this.onSettings?.();
          break;
      }
    });
  }

  private currentLevel = 1;

  show(profile: PlayerProfileData | null): void {
    const hasProfile = !!profile;
    this.currentLevel = profile?.currentLevel ?? 1;

    // Player info badge
    const infoEl = this.el.querySelector('.menu-player-info') as HTMLElement;
    if (profile) {
      infoEl.innerHTML = `${profile.avatar} ${profile.name} · שלב ${profile.currentLevel}`;
      infoEl.classList.remove('hidden');
    } else {
      infoEl.classList.add('hidden');
    }

    const playBtn = this.el.querySelector('[data-action="play"]') as HTMLButtonElement;
    if (playBtn) {
      playBtn.disabled = !hasProfile;
      playBtn.style.opacity = hasProfile ? '1' : '0.4';
    }
    const selectBtn = this.el.querySelector('[data-action="select-level"]') as HTMLButtonElement;
    if (selectBtn) {
      selectBtn.disabled = !hasProfile;
      selectBtn.style.opacity = hasProfile ? '1' : '0.4';
    }
    const dashBtn = this.el.querySelector('[data-action="dashboard"]') as HTMLButtonElement;
    if (dashBtn) {
      dashBtn.disabled = !hasProfile;
      dashBtn.style.opacity = hasProfile ? '1' : '0.4';
    }
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }

  private showLevelSelect(): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    // Group levels into sets of 10
    let groupsHtml = '';

    for (let g = 0; g < Math.ceil(TOTAL_LEVELS / 10); g++) {
      const start = g * 10;
      const end = Math.min(start + 10, TOTAL_LEVELS);
      let buttonsHtml = '';
      for (let i = start; i < end; i++) {
        const lvl = i + 1;
        const cfg = LEVELS[i];
        const cls = lvl === this.currentLevel ? 'level-btn current' : 'level-btn';
        buttonsHtml += `<button class="${cls}" data-level="${lvl}" title="${cfg.description}">${lvl}</button>`;
      }
      groupsHtml += `
        <div class="level-group">
          <div class="level-group-name">${GROUP_NAMES[g] ?? ''}</div>
          <div class="level-grid">${buttonsHtml}</div>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal level-select-modal">
        <h3>🗺️ בחר שלב</h3>
        <div class="level-select-scroll">
          ${groupsHtml}
        </div>
        <button class="menu-btn" id="close-level-select">חזרה</button>
      </div>
    `;

    this.el.appendChild(modal);

    modal.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-level]') as HTMLElement;
      if (btn) {
        const level = parseInt(btn.dataset.level!, 10);
        modal.remove();
        this.onPlay?.(level);
        return;
      }
      if ((e.target as HTMLElement).closest('#close-level-select')) {
        modal.remove();
      }
    });
  }
}
