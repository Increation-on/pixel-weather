// src/components/weather/WeatherCard.tsx
import { View, Text, StyleSheet } from 'react-native';

interface WeatherCardProps {
  temperature: number;
  weatherDescription: string;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  weatherDescription,
  feelsLike,
  windSpeed,
  humidity,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.temperature}>
        {Math.round(temperature)}°C
      </Text>
      
      <Text style={styles.description}>
        {weatherDescription}
      </Text>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Ощущается</Text>
          <Text style={styles.detailValue}>
            {Math.round(feelsLike)}°C
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Ветер</Text>
          <Text style={styles.detailValue}>
            {windSpeed} м/с
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Влажность</Text>
          <Text style={styles.detailValue}>
            {humidity}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginTop: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
});