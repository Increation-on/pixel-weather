// src/components/theme/ThemeWrapper.tsx
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSettings } from '@/src/contexts/SettingContext';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { settings } = useSettings();
  
  // ⭐ ВАЖНО: добавляем КОРНЕВОЙ класс темы
  const rootClass = settings.theme === 'light' ? 'light-root' : 'dark-root';
  
  // Динамически меняем meta theme-color для веб
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const metaTag = document.querySelector('meta[name="theme-color"]');
      if (metaTag) {
        metaTag.setAttribute(
          'content',
          settings.theme === 'dark' ? '#1a1f2e' : '#f8fafc'
        );
      }
    }
  }, [settings.theme]);
  
  return (
    // ⭐ ДОБАВЛЯЕМ КОРНЕВОЙ КЛАСС ТЕМЫ
    <View className={`flex-1 ${rootClass}`}>
      <StatusBar style={settings.theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </View>
  );
}