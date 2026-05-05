import * as React from 'react';

export type AccentColor = 'blue' | 'green' | 'purple' | 'slate' | 'rose';
export type DisplayScale = 'sm' | 'md' | 'lg';
export type Density = 'comfortable' | 'compact';

export interface AppSettings {
  notificationsInfo: boolean;
  notificationsWarning: boolean;
  notificationsError: boolean;
  notificationsSuccess: boolean;
  accentColor: AccentColor;
  displayScale: DisplayScale;
  density: Density;
  reduceMotion: boolean;
  highContrast: boolean;
}

const STORAGE_KEY = 'app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  notificationsInfo: true,
  notificationsWarning: true,
  notificationsError: true,
  notificationsSuccess: true,
  accentColor: 'blue',
  displayScale: 'md',
  density: 'comfortable',
  reduceMotion: false,
  highContrast: false,
};

const ACCENT_COLORS: Record<AccentColor, string> = {
  blue: '#2563eb',
  green: '#10b981',
  purple: '#8b5cf6',
  slate: '#64748b',
  rose: '#f43f5e',
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applySettings(s: AppSettings): void {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', ACCENT_COLORS[s.accentColor]);
  root.setAttribute('data-scale', s.displayScale);
  root.setAttribute('data-density', s.density);
  if (s.reduceMotion) root.setAttribute('data-reduce-motion', 'true');
  else root.removeAttribute('data-reduce-motion');
  if (s.highContrast) root.setAttribute('data-high-contrast', 'true');
  else root.removeAttribute('data-high-contrast');
}

interface UseSettingsReturn {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = React.useState<AppSettings>(loadSettings);

  React.useEffect(() => {
    applySettings(settings);
  }, [settings]);

  const updateSettings = React.useCallback((patch: Partial<AppSettings>): void => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = React.useCallback((): void => {
    localStorage.removeItem(STORAGE_KEY);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
