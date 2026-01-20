// src/hooks/useHealthCheck.ts
import { useEffect } from 'react';
import { useNetwork } from '../providers/NetworkProvider';

export const useHealthCheck = () => {
  const { isOffline, checkNetwork } = useNetwork();

  useEffect(() => {
    
    // Только логируем, не вызываем setState
    if (!isOffline) {
    }

    // Можно добавить периодическую проверку, но только логирование
    const interval = setInterval(() => {
      if (!isOffline) {
      }
    }, 300000); // Каждые 5 минут
    
    return () => {
      clearInterval(interval);
    };
  }, [isOffline, checkNetwork]);
  
  return null;
};