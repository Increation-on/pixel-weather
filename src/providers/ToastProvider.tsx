// src/providers/ToastProvider.tsx
import React, { createContext,  useState, useCallback } from 'react';
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

// 3. Toast компонент (как было, но с пиксельным шрифтом)
const ToastComponent: React.FC<ToastConfig & { onClose: () => void }> = ({ 
  message, 
  type, 
  onClose 
}) => {
  // Цвета для разных типов toast (используем warning из темы)
  const bgColor = {
    success: 'bg-success',
    error: 'bg-danger',
    info: 'bg-primary',
    warning: 'bg-warning', // ← ваш новый цвет
  }[type];

  return (
    <View 
      className={`
        absolute top-10 mx-4 p-4 rounded-lg 
        ${bgColor} shadow-lg z-50
        flex-row items-center justify-between
      `}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
        elevation: 8,
      }}
    >
      {/* Сообщение с пиксельным шрифтом */}
      <Text 
        className="text-white text-sm flex-1 font-pixel uppercase"
        style={{ lineHeight: 18 }}
      >
        {message.toUpperCase()}
      </Text>
      
      {/* Кнопка закрытия с пиксельным шрифтом */}
      <Text 
        className="text-white ml-3 text-lg"
        onPress={onClose}
        style={{ 
          fontFamily: 'PressStart2P-Regular',
          lineHeight: 20
        }}
      >
        ✕
      </Text>
    </View>
  );
};

// 4. Создаем провайдер (как было)
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [timeoutId, setTimeoutId] = useState<number  | null>(null);

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