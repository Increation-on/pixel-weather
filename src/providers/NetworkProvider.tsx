// src/providers/NetworkProvider.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  const isOfflineRef = useRef(isOffline); // Используем ref для избежания race conditions

  // Основной useEffect для мониторинга сети
  useEffect(() => {
    console.log('🔧 NetworkProvider: инициализация мониторинга сети');
    
    const handleConnectivityChange = (state: any) => {
      const newIsOffline = state.isConnected === false || 
                          state.isInternetReachable === false;
      const newConnectionType = state.type || 'unknown';                    
      
      // Проверяем, изменилось ли состояние
      if (newIsOffline !== isOfflineRef.current || newConnectionType !== connectionType) {
        console.log(`🌐 NetworkProvider: состояние сети изменилось - ${newIsOffline ? 'offline' : 'online'}`);
        isOfflineRef.current = newIsOffline;
        setIsOffline(newIsOffline);
        setConnectionType(newConnectionType);
      }
    };

    // Подписываемся на изменения сети
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);
    
    // Получаем начальное состояние
    NetInfo.fetch().then(handleConnectivityChange);

    return () => {
      console.log('🔧 NetworkProvider: отписка от мониторинга сети');
      unsubscribe();
    };
  }, []);

  // Функция для ручной проверки сети
  const checkNetwork = useCallback(async (): Promise<boolean> => {
  console.log('🔄 NetworkProvider: ручная проверка сети...');
  
  try {
    // Используем CORS-friendly эндпоинт
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 секунды
    
    // МЕНЯЕМ ЭТУ СТРОКУ:
    const response = await fetch('https://httpbin.org/status/200', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const isOnline = response.ok;
    console.log(`🌐 NetworkProvider: ручная проверка - ${isOnline ? 'онлайн' : 'оффлайн'}`);
    
    if (isOnline !== !isOfflineRef.current) {
      isOfflineRef.current = !isOnline;
      setIsOffline(!isOnline);
    }
    
    return isOnline;
  } catch (error) {
    console.log('🌐 NetworkProvider: ручная проверка - ошибка сети', error);
    
    if (!isOfflineRef.current) {
      isOfflineRef.current = true;
      setIsOffline(true);
    }
    
    return false;
  }
}, []);

  // Для веба - дополнительный мониторинг
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = () => {
      console.log('🌐 Web: онлайн событие');
      if (isOfflineRef.current) {
        isOfflineRef.current = false;
        setIsOffline(false);
      }
    };
    
    const handleOffline = () => {
      console.log('🌐 Web: оффлайн событие');
      if (!isOfflineRef.current) {
        isOfflineRef.current = true;
        setIsOffline(true);
      }
    };
    
    console.log('🔧 NetworkProvider: инициализация web мониторинга');
    
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