import { AppSettings } from '../types';
import { DEFAULT_SETTINGS } from './constants';

const SETTINGS_KEY = 'coffee_sommelier_settings';

export const loadSettings = (): AppSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const clearSettings = (): AppSettings => {
  localStorage.removeItem(SETTINGS_KEY);
  return DEFAULT_SETTINGS;
};
