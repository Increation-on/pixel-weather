// src/components/shared/ErrorState.tsx
import { View, Text, StyleSheet } from 'react-native';

interface ErrorStateProps {
  title?: string;
  message?: string;
  titleColor?: string;
  messageColor?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ошибка',
  message,
  titleColor = '#dc2626',
  messageColor = '#dc2626',
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, { color: messageColor }]}>
          {message}
        </Text>
      )}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});