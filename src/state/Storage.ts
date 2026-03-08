const STORAGE_KEY = 'space-defenders';
const STORAGE_VERSION = 1;

interface StorageData {
  version: number;
  profiles: Record<string, import('./GameState').PlayerProfileData>;
  settings: import('./GameState').GameSettings;
  activeProfileId: string | null;
}

function getDefaultData(): StorageData {
  return {
    version: STORAGE_VERSION,
    profiles: {},
    settings: {
      soundEnabled: true,
      keyboardHintEnabled: true,
      difficulty: 'normal',
    },
    activeProfileId: null,
  };
}

export class Storage {
  private data: StorageData;

  constructor() {
    this.data = this.load();
  }

  private load(): StorageData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultData();
      const parsed = JSON.parse(raw) as StorageData;
      if (parsed.version !== STORAGE_VERSION) {
        // Future: migrate data between versions
        return getDefaultData();
      }
      return parsed;
    } catch {
      return getDefaultData();
    }
  }

  save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getProfiles(): Record<string, import('./GameState').PlayerProfileData> {
    return this.data.profiles;
  }

  getProfile(id: string): import('./GameState').PlayerProfileData | undefined {
    return this.data.profiles[id];
  }

  saveProfile(profile: import('./GameState').PlayerProfileData): void {
    this.data.profiles[profile.id] = profile;
    this.save();
  }

  deleteProfile(id: string): void {
    delete this.data.profiles[id];
    if (this.data.activeProfileId === id) {
      this.data.activeProfileId = null;
    }
    this.save();
  }

  getSettings(): import('./GameState').GameSettings {
    return { ...this.data.settings };
  }

  saveSettings(settings: import('./GameState').GameSettings): void {
    this.data.settings = { ...settings };
    this.save();
  }

  getActiveProfileId(): string | null {
    return this.data.activeProfileId;
  }

  setActiveProfileId(id: string | null): void {
    this.data.activeProfileId = id;
    this.save();
  }
}
