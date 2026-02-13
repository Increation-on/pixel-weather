import { Platform } from 'react-native';
import * as Device from 'expo-device'; 

const API_URL = 'https://pixel-weather-server.vercel.app';

export const pushTokenService = {
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

  // 🔥 НОВЫЙ МЕТОД
  async updateLocation(token: string, lat: number, lon: number) {
    try {
      console.log('📍 Отправка координат на сервер...');
      
      fetch(`${API_URL}/api/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          lat, 
          lon,
          timestamp: Date.now()
        })
      }).catch(err => console.warn('⚠️ Location update failed:', err));
      
    } catch (error) {
      console.warn('⚠️ Location update error:', error);
    }
  }
};