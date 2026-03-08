import type { PlayerProfileData } from '../state/GameState';
import { AVATARS } from '../state/GameState';

export class ProfileSelect {
  private el: HTMLDivElement;
  onSelect: ((id: string) => void) | null = null;
  onCreate: ((name: string, avatar: string) => void) | null = null;
  onDelete: ((id: string) => void) | null = null;
  onBack: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'screen profile-screen hidden';
    container.appendChild(this.el);
  }

  show(profiles: PlayerProfileData[], activeId: string | null): void {
    this.el.innerHTML = `
      <div class="menu-title" style="font-size:2.5rem">👤 בחר שחקן</div>
      <div class="profile-grid">
        ${profiles
          .map(
            (p) => `
          <div class="profile-card ${p.id === activeId ? 'selected' : ''}" data-id="${p.id}">
            <div class="profile-avatar">${p.avatar}</div>
            <div class="profile-name">${p.name}</div>
            <div class="profile-level">שלב ${p.currentLevel}</div>
            <button class="delete-profile-btn" data-delete="${p.id}">מחק</button>
          </div>
        `,
          )
          .join('')}
        ${
          profiles.length < 6
            ? `
          <div class="profile-card new-profile-card" data-action="new">
            <div class="profile-avatar">+</div>
            <div class="profile-name">שחקן חדש</div>
          </div>
        `
            : ''
        }
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
    const target = e.target as HTMLElement;

    // Delete button
    const deleteBtn = target.closest('[data-delete]') as HTMLElement;
    if (deleteBtn) {
      e.stopPropagation();
      const id = deleteBtn.dataset.delete!;
      if (confirm('למחוק את השחקן?')) {
        this.onDelete?.(id);
      }
      return;
    }

    // Profile card
    const card = target.closest('[data-id]') as HTMLElement;
    if (card) {
      this.onSelect?.(card.dataset.id!);
      return;
    }

    // New profile
    const newCard = target.closest('[data-action="new"]');
    if (newCard) {
      this.showCreateModal();
      return;
    }

    // Back
    const backBtn = target.closest('[data-action="back"]');
    if (backBtn) {
      this.onBack?.();
      return;
    }
  };

  private showCreateModal(): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    let selectedAvatar = AVATARS[0];

    modal.innerHTML = `
      <div class="modal">
        <h3>שחקן חדש</h3>
        <input type="text" id="profile-name-input" placeholder="שם השחקן" maxlength="12" dir="rtl" />
        <div class="avatar-picker">
          ${AVATARS.map(
            (a, i) =>
              `<div class="avatar-option ${i === 0 ? 'selected' : ''}" data-avatar="${a}">${a}</div>`,
          ).join('')}
        </div>
        <button class="menu-btn primary" id="create-profile-btn">צור שחקן</button>
        <button class="menu-btn" id="cancel-profile-btn">ביטול</button>
      </div>
    `;

    this.el.appendChild(modal);

    const nameInput = modal.querySelector('#profile-name-input') as HTMLInputElement;
    nameInput.focus();

    modal.querySelectorAll('.avatar-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        modal.querySelectorAll('.avatar-option').forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
        selectedAvatar = (opt as HTMLElement).dataset.avatar!;
      });
    });

    modal.querySelector('#create-profile-btn')!.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (name) {
        this.onCreate?.(name, selectedAvatar);
        modal.remove();
      }
    });

    modal.querySelector('#cancel-profile-btn')!.addEventListener('click', () => {
      modal.remove();
    });

    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const name = nameInput.value.trim();
        if (name) {
          this.onCreate?.(name, selectedAvatar);
          modal.remove();
        }
      }
    });
  }
}
