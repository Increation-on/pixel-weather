// src/providers/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text } from 'react-native';

// 1. Определяем типы
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number; // в миллисекундах
}

interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
  toast: ToastConfig | null;
}

// 2. Создаем контекст с правильной типизацией
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// 3. Создаем компонент Toast (простая версия)
const ToastComponent: React.FC<ToastConfig & { onClose: () => void }> = ({ 
  message, 
  type, 
  onClose 
}) => {
  // Цвета для разных типов toast
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  // Простая анимация появления (позже добавим NativeWind анимации)
  return (
    <View 
      className={`
        absolute top-10 left-4 right-4 p-4 rounded-lg 
        ${bgColor} shadow-lg z-50
        flex-row items-center justify-between
      `}
    >
      <Text className="text-white text-base flex-1 font-medium">
        {message}
      </Text>
      <Text 
        className="text-white ml-2 text-lg font-bold"
        onPress={onClose}
      >
        ×
      </Text>
    </View>
  );
};

// 4. Создаем провайдер
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Функция показа toast
  const showToast = useCallback((config: ToastConfig) => {
    // Очищаем предыдущий таймер, если есть
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Показываем новый toast
    setToast(config);
    
    // Автоматическое скрытие через указанное время (по умолчанию 4 секунды)
    const duration = config.duration || 4000;
    const id = setTimeout(() => {
      setToast(null);
    }, duration);
    
    setTimeoutId(id);
  }, [timeoutId]);

  // Функция ручного скрытия toast
  const hideToast = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setToast(null);
  }, [timeoutId]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
      {toast && <ToastComponent {...toast} onClose={hideToast} />}
    </ToastContext.Provider>
  );
};

// 5. Экспортируем хук (создадим в отдельном файле)
// Это нужно для разделения кода и избежания circular dependencies