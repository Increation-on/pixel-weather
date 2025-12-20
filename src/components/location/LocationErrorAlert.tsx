// src/components/shared/LocationErrorAlert.tsx
import { View, Text, StyleSheet } from 'react-native';
import { GeolocationError } from '@/src/types/location';

interface LocationErrorAlertProps {
  error?: GeolocationError | null;
  fallbackCity?: string | null;
  isLoading?: boolean; // Добавили флаг загрузки
}

export const LocationErrorAlert: React.FC<LocationErrorAlertProps> = ({
  error,
  fallbackCity,
  isLoading = false,
}) => {
  if (!error || isLoading) return null; // Сама проверяем isLoading
  
  const fallbackText = fallbackCity 
    ? `Показываем ${fallbackCity}.`
    : 'Показываем Москву.';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ⚠️ {error.message}. {fallbackText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
  },
  text: {
    color: '#dc2626',
    fontSize: 12,
  },
});