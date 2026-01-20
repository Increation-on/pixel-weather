// src/providers/NetworkProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native'; // ← ДОБАВЛЕН ИМПОРТ
import NetInfo from '@react-native-community/netinfo';

interface NetworkContextType {
  isOffline: boolean;
  checkNetwork: () => Promise<boolean>;
  connectionType: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const isOfflineRef = useRef(isOffline);

  // Основной useEffect для мониторинга сети
  useEffect(() => {
    
    const handleConnectivityChange = (state: any) => {
      const newIsOffline = state.isConnected === false || 
                          state.isInternetReachable === false;
      const newConnectionType = state.type || 'unknown';                    
      
      if (newIsOffline !== isOfflineRef.current || newConnectionType !== connectionType) {
        isOfflineRef.current = newIsOffline;
        setIsOffline(newIsOffline);
        setConnectionType(newConnectionType);
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    
    NetInfo.fetch().then(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  // Функция для ручной проверки сети
  const checkNetwork = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const isOnline = response.ok;
      
      if (isOnline !== !isOfflineRef.current) {
        isOfflineRef.current = !isOnline;
        setIsOffline(!isOnline);
      }
      
      return isOnline;
    } catch (error) {
      if (!isOfflineRef.current) {
        isOfflineRef.current = true;
        setIsOffline(true);
      }
      
      return false;
    }
  }, []);

  // Для веба - дополнительный мониторинг (БЕЗОПАСНАЯ ВЕРСИЯ)
  useEffect(() => {
    // Безопасная проверка: только веб-окружение с полным window API
    const isWebEnvironment = 
      Platform.OS === 'web' && 
      typeof window !== 'undefined' && 
      typeof window.addEventListener === 'function' && 
      typeof window.removeEventListener === 'function';
    
    if (!isWebEnvironment) return;
    
    const handleOnline = () => {
      if (isOfflineRef.current) {
        isOfflineRef.current = false;
        setIsOffline(false);
      }
    };
    
    const handleOffline = () => {
      if (!isOfflineRef.current) {
        isOfflineRef.current = true;
        setIsOffline(true);
      }
    };
    
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOffline, checkNetwork, connectionType }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};