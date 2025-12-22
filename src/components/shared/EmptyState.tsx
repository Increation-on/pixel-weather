// src/components/shared/EmptyState.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type EmptyStateType = 'no-data' | 'no-results' | 'offline' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  message?: string;
  onRetry?: () => void;
}

const typeConfig = {
  'no-data': {
    icon: '📭',
    title: 'Нет данных',
    defaultMessage: 'Здесь пока ничего нет',
    titleColor: '#6b7280',
    messageColor: '#9ca3af',
  },
  'no-results': {
    icon: '🔍',
    title: 'Ничего не найдено',
    defaultMessage: 'Попробуйте изменить параметры поиска',
    titleColor: '#6b7280',
    messageColor: '#9ca3af',
  },
  'offline': {
    icon: '📶',
    title: 'Нет подключения',
    defaultMessage: 'Проверьте подключение к интернету',
    titleColor: '#d97706',
    messageColor: '#92400e',
  },
  'error': {
    icon: '⚠️',
    title: 'Ошибка',
    defaultMessage: 'Что-то пошло не так',
    titleColor: '#dc2626',
    messageColor: '#991b1b',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  message, 
  onRetry 
}) => {
  const config = typeConfig[type];
  const displayMessage = message || config.defaultMessage;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={[styles.title, { color: config.titleColor }]}>
        {config.title}
      </Text>
      <Text style={[styles.message, { color: config.messageColor }]}>
        {displayMessage}
      </Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Повторить попытку</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 160,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});