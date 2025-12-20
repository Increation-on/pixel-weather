// src/components/shared/EmptyState.tsx
import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message?: string;
  messageColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Нет данных',
  messageColor = '#475569',
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.message, { color: messageColor }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
  },
});