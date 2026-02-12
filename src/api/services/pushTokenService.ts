import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://pixel-weather-server.vercel.app';

export const pushTokenService = {
  async registerDevice(token: string) {
    try {
      console.log('📱 Регистрация устройства на сервере...');
      
      const response = await fetch(`${API_URL}/api/save-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          deviceInfo: {
            platform: Platform.OS,
            model: Device.modelName || 'unknown',
          },
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Устройство зарегистрировано');
        return { success: true, data };
      } else {
        console.error('❌ Ошибка регистрации:', data);
        return { success: false, error: data };
      }
    } catch (error) {
      console.error('❌ Сетевая ошибка:', error);
      return { success: false, error };
    }
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      return null;
    }
  },
};