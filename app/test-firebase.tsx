// app/test-firebase.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useFirebaseMessaging } from '@/src/hooks/useFirebaseMessaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

export default function TestFirebaseScreen() {
  const [logs, setLogs] = useState<string[]>(['Нажмите кнопки для теста']);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { getFCMToken } = useFirebaseMessaging();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 20)]);
  };

  // Загружаем сохранённый токен при монтировании
  useEffect(() => {
    const loadSavedToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('fcm_token');
        if (savedToken) {
          setFcmToken(savedToken);
          addLog(`📱 Загружен сохранённый токен: ${savedToken.substring(0, 20)}...`);
        }
      } catch (error) {
        addLog('❌ Ошибка загрузки токена');
      }
    };
    
    loadSavedToken();
  }, []);

  const handleInitialize = async () => {
    addLog('🚀 Получение FCM токена...');
    try {
      const token = await getFCMToken();
      
      if (token) {
        setFcmToken(token);
        setIsInitialized(true);
        
        addLog(`✅ FCM токен получен: ${token.substring(0, 30)}...`);
        addLog(`📏 Длина: ${token.length} символов`);
        addLog('🎉 Firebase работает!');
        
        // Сохраняем токен в AsyncStorage
        await AsyncStorage.setItem('fcm_token', token);
        addLog('💾 Токен сохранён в хранилище');
      } else {
        addLog('❌ Не удалось получить токен');
      }
    } catch (error: any) {
      addLog(`❌ Ошибка: ${error.message}`);
    }
  };

  const handleTestPush = async () => {
    if (!fcmToken) {
      addLog('⚠️ Сначала получите FCM токен');
      return;
    }
    
    addLog('📨 Отправка тестового пуша...');
    
    try {
      const response = await fetch(
        'https://pixel-weather-server.vercel.app/api/send-test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fcmToken: fcmToken,
            channelId: 'pixel_weather_high',
            title: '🔥 PIXEL WEATHER TEST',
            body: 'Тестовое push-уведомление! 🎉',
            data: {
              type: 'test',
              timestamp: new Date().toISOString(),
            }
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Пуш отправлен на сервер!');
        addLog(`📦 ID: ${data.messageId}`);
        addLog(`🎯 Канал: ${data.channelId}`);
        addLog('📱 Проверьте уведомления на устройстве');
      } else {
        addLog(`❌ Ошибка: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Ошибка сети: ${error.message}`);
    }
  };

  const handleTestBackgroundPush = async () => {
    if (!fcmToken) {
      addLog('⚠️ Сначала получите FCM токен');
      return;
    }
    
    addLog('🌙 Отправка фонового пуша с каналом...');
    
    try {
      const response = await fetch(
        'https://pixel-weather-server.vercel.app/api/send-test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fcmToken: fcmToken,
            channelId: 'pixel_weather_default',
            title: '🌤️ PIXEL WEATHER',
            body: 'Тест с Android каналом (обычный приоритет)',
            data: {
              channelId: 'weather',
              importance: 'default'
            }
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Фоновый пуш отправлен!');
        addLog(`🎯 Канал: ${data.channelId}`);
      } else {
        addLog(`❌ Ошибка: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Ошибка сети: ${error.message}`);
    }
  };

  const handleClearToken = async () => {
    await AsyncStorage.removeItem('fcm_token');
    setFcmToken(null);
    setIsInitialized(false);
    addLog('🧹 Токен очищен из хранилища');
  };

  const handleCopyToken = async () => {
    if (!fcmToken) {
      addLog('⚠️ Токен не получен');
      return;
    }
    
    console.log('=== FCM TOKEN ===');
    console.log(fcmToken);
    console.log('=================');
    addLog('📋 Токен выведен в консоль для копирования');
  };

  const handleTestLowPriority = async () => {
    if (!fcmToken) {
      addLog('⚠️ Сначала получите FCM токен');
      return;
    }
    
    addLog('🔕 Отправка тихого уведомления...');
    
    try {
      const response = await fetch(
        'https://pixel-weather-server.vercel.app/api/send-test',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fcmToken: fcmToken,
            channelId: 'pixel_weather_low',
            title: '🌤️ Pixel Weather',
            body: 'Тихое обновление погоды',
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Тихий пуш отправлен!');
        addLog(`🎯 Канал: ${data.channelId}`);
      } else {
        addLog(`❌ Ошибка: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Ошибка сети: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 Firebase FCM Тест</Text>
      
      {/* Статус панель */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>СТАТУС FIREBASE</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Токен:</Text>
          <Text style={[styles.statusValue, fcmToken ? styles.statusSuccess : styles.statusWarning]}>
            {fcmToken ? '✅ Получен' : '❌ Нет'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Инициализирован:</Text>
          <Text style={styles.statusValue}>
            {isInitialized ? '✅ Да' : '❌ Нет'}
          </Text>
        </View>
        {fcmToken && (
          <Text style={styles.tokenPreview}>
            Токен: {fcmToken.substring(0, 20)}...
          </Text>
        )}
      </View>
      
      {/* Основные кнопки */}
      <ScrollView horizontal style={styles.horizontalButtons} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]} 
          onPress={handleInitialize}
        >
          <Text style={styles.actionButtonText}>🚀 Получить токен</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.pushButton]} 
          onPress={handleTestPush}
          disabled={!fcmToken}
        >
          <Text style={[styles.actionButtonText, !fcmToken && styles.disabledButton]}>
            📨 Высокий приоритет
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.bgTaskButton]} 
          onPress={handleTestBackgroundPush}
          disabled={!fcmToken}
        >
          <Text style={[styles.actionButtonText, !fcmToken && styles.disabledButton]}>
            📊 Обычный приоритет
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.lowButton]} 
          onPress={handleTestLowPriority}
          disabled={!fcmToken}
        >
          <Text style={[styles.actionButtonText, !fcmToken && styles.disabledButton]}>
            🔕 Низкий приоритет
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Вторичные кнопки */}
      <View style={styles.secondaryButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.warningButton]} 
          onPress={handleCopyToken}
          disabled={!fcmToken}
        >
          <Text style={[styles.actionButtonText, !fcmToken && styles.disabledButton]}>
            📋 Копировать токен
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]} 
          onPress={handleClearToken}
        >
          <Text style={styles.actionButtonText}>🧹 Очистить токен</Text>
        </TouchableOpacity>
      </View>
      
      {/* Логи */}
      <View style={styles.logsHeader}>
        <Text style={styles.logsTitle}>ЛОГИ</Text>
        <TouchableOpacity onPress={() => setLogs(['Логи очищены'])}>
          <Text style={styles.clearLogs}>🧹 Очистить</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.logsContainer}>
        {logs.length === 0 ? (
          <Text style={styles.emptyLogs}>Логи будут появляться здесь</Text>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text style={[
                styles.logText,
                log.includes('❌') && styles.logError,
                log.includes('✅') && styles.logSuccess,
                log.includes('⚠️') && styles.logWarning
              ]}>
                {log}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1f2e',
  },
  title: {
    color: '#4ecdc4',
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#2d3748',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusTitle: {
    color: '#4ecdc4',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusLabel: {
    color: '#cbd5e0',
    fontSize: 12,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: '#48bb78',
  },
  statusWarning: {
    color: '#ed8936',
  },
  tokenPreview: {
    color: '#a0aec0',
    fontSize: 10,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  horizontalButtons: {
    marginBottom: 10,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#4a5568',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ecdc4',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    color: '#a0aec0',
    opacity: 0.7,
  },
  pushButton: {
    backgroundColor: '#ed8936',
  },
  bgTaskButton: {
    backgroundColor: '#4299e1',
  },
  lowButton: {
    backgroundColor: '#68d391',
  },
  warningButton: {
    backgroundColor: '#ed8936',
  },
  dangerButton: {
    backgroundColor: '#f56565',
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logsTitle: {
    color: '#4ecdc4',
    fontSize: 14,
  },
  clearLogs: {
    color: '#f56565',
    fontSize: 12,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#2d3748',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  emptyLogs: {
    color: '#a0aec0',
    fontSize: 12,
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  logItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#4a5568',
  },
  logText: {
    color: '#cbd5e0',
    fontSize: 11,
  },
  logError: {
    color: '#f56565',
  },
  logSuccess: {
    color: '#48bb78',
  },
  logWarning: {
    color: '#ed8936',
  },
});