import { Platform } from 'react-native';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://pixel-weather-server.vercel.app';

// Вспомогательная функция для получения токена
async function getPushToken(): Promise<string> {
  const token = await AsyncStorage.getItem('expo_push_token');
  if (!token) throw new Error('No push token found');
  return token;
}

// Вспомогательная функция для получения текущей локации
async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  // TODO: реализовать получение реальной геолокации
  // Пока заглушка
  return { lat: 53.838, lon: 27.584 };
}

export const pushTokenService = {
  // Сохраняем токен на сервере (только при первом запуске)
  async sendToken(token: string) {
    try {
      const response = await fetch(`${API_URL}/api/save-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          deviceInfo: {
            platform: Platform.OS,
            model: Device.modelName || 'unknown',
          }
        })
      });
      
      const data = await response.json();
      console.log('✅ Токен отправлен на сервер:', data);
      return data;
    } catch (error) {
      console.error('❌ Ошибка отправки токена:', error);
      return null;
    }
  },

  // Получаем сохранённый токен из AsyncStorage
  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('❌ Ошибка получения токена:', error);
      return null;
    }
  },

  // 👇 ОБНОВЛЁННАЯ функция отправки координат
  async updateLocation(token: string, lat: number, lon: number) {
    try {
      console.log('📍 Отправка координат на сервер...');
      
      // Используем новый эндпоинт для установки текущей локации
      const response = await fetch(`${API_URL}/api/set-current-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          lat, 
          lon,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to set current location');
      }
      
      const data = await response.json();
      console.log('✅ Координаты отправлены, текущая локация обновлена');
      return data;
    } catch (error) {
      console.warn('⚠️ Location update error:', error);
    }
  },

  // 👇 НОВАЯ функция для регистрации при первом запуске
  async registerDevice() {
    try {
      const token = await this.getStoredToken();
      if (!token) throw new Error('No token');
      
      // Получаем текущую локацию (через геолокацию)
      // TODO: реализовать получение реальных координат
      const location = await getCurrentLocation();
      
      // Отправляем как текущую
      await this.updateLocation(token, location.lat, location.lon);
      
      console.log('✅ Устройство зарегистрировано');
    } catch (error) {
      console.error('❌ Ошибка регистрации:', error);
    }
  }
};