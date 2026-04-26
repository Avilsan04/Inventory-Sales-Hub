import * as React from 'react';

export interface AppSettings {
    notificationsInfo: boolean;
    notificationsWarning: boolean;
    notificationsError: boolean;
    notificationsSuccess: boolean;
}

const STORAGE_KEY = 'app-settings';

const DEFAULT_SETTINGS: AppSettings = {
    notificationsInfo: true,
    notificationsWarning: true,
    notificationsError: true,
    notificationsSuccess: true,
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

interface UseSettingsReturn {
    settings: AppSettings;
    updateSettings: (patch: Partial<AppSettings>) => void;
    resetSettings: () => void;
}

export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = React.useState<AppSettings>(loadSettings);

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
