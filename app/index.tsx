// app/index.tsx
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Без NativeWind</Text>
      <View className="bg-red-500 p-4 mt-4">
        <Text className="text-white font-bold">С NativeWind</Text>
      </View>
    </View>
  );
}