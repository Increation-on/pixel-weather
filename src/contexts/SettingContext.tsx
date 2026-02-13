// src/contexts/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 🚫 УДАЛЯЕМ: import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';
import * as Notifications from 'expo-notifications'; // ✅ Добавляем для разрешений

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ThemeMode = 'light' | 'dark';

interface Settings {
    temperatureUnit: TemperatureUnit;
    theme: ThemeMode;
    notifications: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    toggleTemperatureUnit: () => Promise<void>;
    toggleTheme: () => Promise<void>;
    toggleNotifications: (enabled: boolean) => Promise<void>;
    requestNotificationPermissions: () => Promise<boolean>;
}

const defaultSettings: Settings = {
    temperatureUnit: 'celsius',
    theme: 'dark',
    notifications: true,
};

const STORAGE_KEY = 'app_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const loadedSettings = { ...defaultSettings, ...JSON.parse(saved) };
                setSettings(loadedSettings);
                // 🚫 УДАЛЯЕМ синхронизацию с WeatherNotificationService
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки настроек:', error);
        }
    };

    const saveSettings = async (newSettings: Settings) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error('❌ Ошибка сохранения настроек:', error);
        }
    };

    const updateSettings = async (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        await saveSettings(updated);
        // 🚫 УДАЛЯЕМ синхронизацию с WeatherNotificationService
    };

    const toggleTemperatureUnit = async () => {
        const newUnit = settings.temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius';
        await updateSettings({ temperatureUnit: newUnit });
    };

    const toggleTheme = async () => {
        const newTheme = settings.theme === 'light' ? 'dark' : 'light';
        await updateSettings({ theme: newTheme });
    };

    const toggleNotifications = async (enabled: boolean) => {
        const updated = { ...settings, notifications: enabled };
        setSettings(updated);
        await saveSettings(updated);
        
        // Если включаем - запрашиваем разрешения напрямую через Notifications
        if (enabled) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                // Если нет разрешения - выключаем обратно
                await updateSettings({ notifications: false });
                return;
            }
        }
    };

    const requestNotificationPermissions = async (): Promise<boolean> => {
        const { status } = await Notifications.requestPermissionsAsync();
        const hasPermission = status === 'granted';
        if (hasPermission) {
            await updateSettings({ notifications: true });
        }
        return hasPermission;
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            updateSettings,
            toggleTemperatureUnit,
            toggleTheme,
            toggleNotifications,
            requestNotificationPermissions,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}