// src/components/location/LocationHeader.tsx
import { View, Text, StyleSheet } from 'react-native';

interface LocationHeaderProps {
  city?: string | null;
  country?: string | null;
  subtitle?: string;
  isSaved?: boolean;
  showSavedBadge?: boolean;
}

export const LocationHeader: React.FC<LocationHeaderProps> = ({
  city,
  country,
  subtitle,
  isSaved = false,
  showSavedBadge = true,
}) => {
  const getDisplayLocation = () => {
    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    return 'Локация не определена';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title} numberOfLines={1}>
        {getDisplayLocation()}
      </Text>
      
      {subtitle && (
        <Text style={styles.subtitle}>
          {subtitle}
          {isSaved && showSavedBadge && ' • 💾 Сохранено'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});