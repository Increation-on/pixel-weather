// src/components/navigation/ForecastLink.tsx
import { Link } from "expo-router";
import { Text, View, StyleSheet } from "react-native";

interface ForecastLinkProps {
  style?: object;
  textStyle?: object;
}

export const ForecastLink: React.FC<ForecastLinkProps> = ({
  style,
  textStyle,
}) => {
  return (
    <Link
      href="/forecast"
      style={[styles.link, style]}
    >
      <Text style={[styles.text, textStyle]}>
        📅 Смотреть прогноз на 5 дней
      </Text>
    </Link>
  );
};

const styles = StyleSheet.create({
  link: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  text: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});