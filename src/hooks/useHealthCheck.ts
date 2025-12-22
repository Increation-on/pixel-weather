// src/hooks/useHealthCheck.ts
import { useEffect } from 'react';
import { useNetwork } from '../providers/NetworkProvider';

export const useHealthCheck = () => {
  const { isOffline, checkNetwork } = useNetwork();

  useEffect(() => {
    console.log('✅ HealthCheck: инициализация');
    
    // Только логируем, не вызываем setState
    if (!isOffline) {
      console.log('🌐 HealthCheck: сеть доступна');
    }

    // Можно добавить периодическую проверку, но только логирование
    const interval = setInterval(() => {
      if (!isOffline) {
        console.log('⏰ HealthCheck: периодическая проверка - онлайн');
      }
    }, 300000); // Каждые 5 минут
    
    return () => {
      clearInterval(interval);
      console.log('❌ HealthCheck: очистка');
    };
  }, [isOffline, checkNetwork]);
  
  return null;
};