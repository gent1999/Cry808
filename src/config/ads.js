// Centralized Ad Configuration
// These values are loaded from the backend API
// Default fallback values if API is unavailable
let adSettings = {
  ADSTERRA_ENABLED: false,
  HILLTOP_ENABLED: true,
  MONETAG_ENABLED: false
};

// Function to load settings from API
export const loadAdSettings = async () => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_URL}/api/settings/public`);
    const data = await response.json();

    if (data.settings) {
      adSettings.ADSTERRA_ENABLED = data.settings.adsterra_enabled;
      adSettings.HILLTOP_ENABLED = data.settings.hilltop_enabled;
      adSettings.MONETAG_ENABLED = data.settings.monetag_enabled;
    }
  } catch (error) {
    console.error('Failed to load ad settings:', error);
  }
  return adSettings;
};

// Export individual settings
export const ADSTERRA_ENABLED = adSettings.ADSTERRA_ENABLED;
export const HILLTOP_ENABLED = adSettings.HILLTOP_ENABLED;
export const MONETAG_ENABLED = adSettings.MONETAG_ENABLED;
