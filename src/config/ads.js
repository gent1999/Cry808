// Centralized Ad Configuration
// Dynamic settings loaded from backend

// Get API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a settings store
class AdSettingsStore {
  constructor() {
    this.settings = {
      ADSTERRA_ENABLED: false,
      HILLTOP_ENABLED: true,
      MONETAG_ENABLED: false
    };
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return this.settings;

    try {
      const response = await fetch(`${API_URL}/api/settings/public`);
      const data = await response.json();

      if (data.settings) {
        // Convert string 'true'/'false' to boolean
        this.settings.ADSTERRA_ENABLED = data.settings.adsterra_enabled === 'true';
        this.settings.HILLTOP_ENABLED = data.settings.hilltop_enabled === 'true';
        this.settings.MONETAG_ENABLED = data.settings.monetag_enabled === 'true';
      }
      this.loaded = true;
    } catch (error) {
      console.error('Failed to load ad settings:', error);
    }

    return this.settings;
  }

  get ADSTERRA_ENABLED() {
    return this.settings.ADSTERRA_ENABLED;
  }

  get HILLTOP_ENABLED() {
    return this.settings.HILLTOP_ENABLED;
  }

  get MONETAG_ENABLED() {
    return this.settings.MONETAG_ENABLED;
  }
}

export const adSettingsStore = new AdSettingsStore();

// Load settings immediately
adSettingsStore.load();

// Export for backwards compatibility (but won't update reactively)
export const ADSTERRA_ENABLED = adSettingsStore.ADSTERRA_ENABLED;
export const HILLTOP_ENABLED = adSettingsStore.HILLTOP_ENABLED;
export const MONETAG_ENABLED = adSettingsStore.MONETAG_ENABLED;
