// src/components/location/LocationActions.tsx
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface LocationActionsProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  isGeocoding?: boolean;
  refreshButtonText?: string;
}

export const LocationActions: React.FC<LocationActionsProps> = ({
  onRefresh,
  isRefreshing = false,
  isGeocoding = false, 
  refreshButtonText = 'Обновить местоположение',
}) => {
  const isLoading = isRefreshing || isGeocoding;
  
  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => onRefresh()}
          disabled={isLoading}
          style={[
            styles.refreshButton,
            isLoading && styles.refreshButtonDisabled
          ]}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.refreshButtonText}>
                {isGeocoding ? 'Определяем город...' : 'Обновляем...'}
              </Text>
            </View>
          ) : (
            <View style={styles.refreshContent}>
              <Text style={styles.icon}>📍</Text>
              <Text style={styles.refreshButtonText}>
                {refreshButtonText}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 10,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
  },
  refreshButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  refreshContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
  },
};