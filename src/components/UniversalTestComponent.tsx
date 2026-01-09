import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Alert,
  ScrollView,
  StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';

export const TestNotificationLogic: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testFreshData = async () => {
    setIsTesting(true);
    try {
      addResult('🧪 Тест 1: Свежие данные (1 минута назад)');
      
      // 1. Сохраняем "свежие" данные (1 минута назад)
      const freshData = {
        timestamp: Date.now() - 60000, // 1 минута назад
        temperature: 20,
        precipitation: 0,
        windSpeed: 5,
        weatherCode: 0
      };
      
      await AsyncStorage.setItem('last_weather_data', JSON.stringify(freshData));
      addResult('✅ Сохранены свежие данные');
      
      // 2. "Новые" данные с изменениями
      const newData = {
        current: {
          temperature: 20,
          precipitation: 5, // Осадки!
          windSpeed: 5,
          weatherCode: 61 // Дождь
        }
      } as any;
      
      const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
      const changes = await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
      
      const result = changes.length > 0 
        ? '✅ Правильно: уведомление отправлено (есть изменения)'
        : '❌ ОШИБКА: должно быть уведомление!';
      
      addResult(result);
      addResult(`📊 Изменения: ${changes.join(', ') || 'нет'}`);
      
    } catch (error) {
      // Исправлено: явное приведение типа
      const err = error as Error;
      addResult(`❌ Ошибка: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testOldData = async () => {
    setIsTesting(true);
    try {
      addResult('🧪 Тест 2: Устаревшие данные (4 часа назад)');
      
      // 1. Сохраняем устаревшие данные
      const oldData = {
        timestamp: Date.now() - 4 * 3600000, // 4 часа назад
        temperature: 20,
        precipitation: 0,
        windSpeed: 5,
        weatherCode: 0
      };
      
      await AsyncStorage.setItem('last_weather_data', JSON.stringify(oldData));
      addResult('✅ Сохранены устаревшие данные');
      
      // 2. "Новые" данные с изменениями
      const newData = {
        current: {
          temperature: 20,
          precipitation: 5, // Осадки!
          windSpeed: 5,
          weatherCode: 61 // Дождь
        }
      } as any;
      
      const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
      const changes = await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
      
      const result = changes.length === 0
        ? '✅ Правильно: нет уведомления (данные устарели)'
        : '❌ ОШИБКА: уведомление при устаревших данных!';
      
      addResult(result);
      addResult(`📊 Изменения: ${changes.join(', ') || 'нет'}`);
      
    } catch (error) {
      // Исправлено: явное приведение типа
      const err = error as Error;
      addResult(`❌ Ошибка: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testNoChanges = async () => {
    setIsTesting(true);
    try {
      addResult('🧪 Тест 3: Нет изменений погоды');
      
      // 1. Сохраняем данные
      const data = {
        timestamp: Date.now() - 60000, // 1 минута назад
        temperature: 20,
        precipitation: 0,
        windSpeed: 5,
        weatherCode: 0
      };
      
      await AsyncStorage.setItem('last_weather_data', JSON.stringify(data));
      addResult('✅ Сохранены данные');
      
      // 2. "Новые" данные БЕЗ изменений
      const newData = {
        current: {
          temperature: 20,
          precipitation: 0, // Те же осадки
          windSpeed: 5,
          weatherCode: 0 // Тот же код
        }
      } as any;
      
      const oldSnapshot = await WeatherNotificationService.getLastSnapshot();
      const changes = await WeatherNotificationService.checkAndNotify(oldSnapshot, newData);
      
      const result = changes.length === 0
        ? '✅ Правильно: нет уведомления (нет изменений)'
        : '❌ ОШИБКА: уведомление без изменений!';
      
      addResult(result);
      addResult(`📊 Изменения: ${changes.join(', ') || 'нет'}`);
      
    } catch (error) {
      // Исправлено: явное приведение типа
      const err = error as Error;
      addResult(`❌ Ошибка: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('🚀 ЗАПУСК ВСЕХ ТЕСТОВ');
    
    await testFreshData();
    await testOldData();
    await testNoChanges();
    
    addResult('🏁 ТЕСТЫ ЗАВЕРШЕНЫ');
  };

  const viewCurrentData = async () => {
    try {
      const data = await AsyncStorage.getItem('last_weather_data');
      const location = await AsyncStorage.getItem('user_location');
      
      Alert.alert(
        '📊 Текущие данные',
        `last_weather_data:\n${data || 'нет'}\n\n` +
        `user_location:\n${location || 'нет'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Исправлено: явное приведение типа
      const err = error as Error;
      Alert.alert('❌ Ошибка', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Тест логики уведомлений</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="🧪 Тест 1: Свежие данные" 
          onPress={testFreshData}
          disabled={isTesting}
          color="#4ecdc4"
        />
        
        <Button 
          title="⏰ Тест 2: Устаревшие данные" 
          onPress={testOldData}
          disabled={isTesting}
          color="#ff9f43"
        />
        
        <Button 
          title="🔄 Тест 3: Нет изменений" 
          onPress={testNoChanges}
          disabled={isTesting}
          color="#54a0ff"
        />
        
        <Button 
          title="🚀 Запустить все тесты" 
          onPress={runAllTests}
          disabled={isTesting}
          color="#9b59b6"
        />
        
        <Button 
          title="👁️ Посмотреть данные" 
          onPress={viewCurrentData}
          color="#1dd1a1"
        />
        
        <Button 
          title="🧹 Очистить логи" 
          onPress={clearResults}
          color="#ff6b6b"
        />
      </View>
      
      <ScrollView style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Результаты:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
        {testResults.length === 0 && (
          <Text style={styles.emptyText}>Нажмите кнопку для запуска тестов</Text>
        )}
      </ScrollView>
      
      {isTesting && (
        <Text style={styles.testingText}>Тестирование...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1a1f2e',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ecdc4',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 16,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#2d3436',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#dfe6e9',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    color: '#b2bec3',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  testingText: {
    fontSize: 14,
    color: '#feca57',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});