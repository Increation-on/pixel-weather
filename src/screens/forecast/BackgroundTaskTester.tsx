import React from 'react';
import { View, Button, Text, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { AppState } from 'react-native';

const TEST_TASK_NAME = 'debug-background-test';

// Определяем тестовую задачу
TaskManager.defineTask(TEST_TASK_NAME, async () => {
  console.log('🔵 [DebugTask] Тестовая фоновая задача выполняется!');
  
  // Логируем в AsyncStorage
  await AsyncStorage.setItem('last_task_execution', JSON.stringify({
    timestamp: Date.now(),
    state: AppState.currentState,
    task: TEST_TASK_NAME
  }));
  
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export default function BackgroundTaskTester() {
  const [logs, setLogs] = React.useState<string[]>([]);
  const [lastExecution, setLastExecution] = React.useState<any>(null);
  const [isTaskRegistered, setIsTaskRegistered] = React.useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const log = `[${timestamp}] ${message}`;
    console.log(log);
    setLogs(prev => [log, ...prev].slice(0, 20));
  };

  // Проверить, зарегистрирована ли задача
  const checkTaskRegistration = async () => {
    try {
      const registered = await TaskManager.isTaskRegisteredAsync(TEST_TASK_NAME);
      setIsTaskRegistered(registered);
      addLog(`📋 Задача зарегистрирована: ${registered ? 'Да' : 'Нет'}`);
      return registered;
    } catch (error: any) {
      addLog(`❌ Ошибка проверки: ${error.message}`);
      return false;
    }
  };

  // 1. Зарегистрировать тестовую задачу
  const registerTestTask = async () => {
    addLog('📝 Регистрируем тестовую задачу...');
    
    try {
      await BackgroundFetch.registerTaskAsync(TEST_TASK_NAME, {
        minimumInterval: 60, // 1 минута минимальный интервал
        stopOnTerminate: false,
        startOnBoot: false,
      });
      addLog('✅ Тестовая задача зарегистрирована');
      setIsTaskRegistered(true);
      
      // Проверить через 2 секунды
      setTimeout(checkTaskRegistration, 2000);
    } catch (error: any) {
      addLog(`❌ Ошибка регистрации: ${error.message}`);
    }
  };

  // 2. Отменить регистрацию
  const unregisterTestTask = async () => {
    addLog('🗑️ Отменяем тестовую задачу...');
    
    try {
      await BackgroundFetch.unregisterTaskAsync(TEST_TASK_NAME);
      addLog('✅ Тестовая задача отменена');
      setIsTaskRegistered(false);
    } catch (error: any) {
      addLog(`❌ Ошибка отмены: ${error.message}`);
    }
  };

  // 3. Запустить задачу ВРУЧНУЮ (имитация системного запуска)
  const executeTaskManually = async () => {
    addLog('🔄 Имитируем системный запуск задачи...');
    
    try {
      // Сохраняем время запроса
      await AsyncStorage.setItem('last_manual_run', Date.now().toString());
      
      addLog('✅ Запрос на выполнение отправлен (система вызовет когда сможет)');
    } catch (error: any) {
      addLog(`❌ Ошибка: ${error.message}`);
    }
  };

  // 4. Проверить статус BackgroundFetch (ИСПРАВЛЕННАЯ ВЕРСИЯ)
  const checkBackgroundFetchStatus = async () => {
    addLog('📱 Проверяем статус BackgroundFetch...');
    
    try {
      const status = await BackgroundFetch.getStatusAsync();
      
      // Используем правильные константы из BackgroundFetch
      let statusText = 'UNKNOWN';
      if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
        statusText = 'AVAILABLE';
      } else if (status === BackgroundFetch.BackgroundFetchStatus.Restricted) {
        statusText = 'RESTRICTED';
      } else if (status === BackgroundFetch.BackgroundFetchStatus.Denied) {
        statusText = 'DENIED';
      }
      
      addLog(`📊 Статус: ${statusText} (код: ${status})`);
      
      // Проверить зарегистрированные задачи
      const tasks = await TaskManager.getRegisteredTasksAsync();
      addLog(`📋 Всего задач: ${tasks.length}`);
      tasks.forEach(task => {
        addLog(`   • ${task.taskName}`);
      });
    } catch (error: any) {
      addLog(`❌ Ошибка: ${error.message}`);
    }
  };

  // 5. Проверить логи из AsyncStorage
  const checkAsyncStorageLogs = async () => {
    addLog('📂 Проверяем AsyncStorage...');
    
    try {
      const executionStr = await AsyncStorage.getItem('last_task_execution');
      const manualStr = await AsyncStorage.getItem('last_manual_run');
      
      if (executionStr) {
        const data = JSON.parse(executionStr);
        setLastExecution(data);
        addLog(`📝 Последнее выполнение: ${new Date(data.timestamp).toLocaleTimeString()}`);
        addLog(`   Состояние: ${data.state}, Задача: ${data.task}`);
      } else {
        addLog('📝 Нет записей о выполнении задачи');
      }
      
      if (manualStr) {
        const time = parseInt(manualStr);
        addLog(`🖱️ Последний ручной запуск: ${new Date(time).toLocaleTimeString()}`);
      }
    } catch (error) {
      addLog('❌ Ошибка чтения логов');
    }
  };

  // 6. Очистка логов
  const clearLogs = async () => {
    await AsyncStorage.multiRemove([
      'last_task_execution',
      'last_manual_run'
    ]);
    setLogs([]);
    setLastExecution(null);
    addLog('🧹 Логи очищены');
  };

  // При загрузке компонента проверить регистрацию
  React.useEffect(() => {
    checkTaskRegistration();
    checkBackgroundFetchStatus();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Тестер фоновых задач (Debug)</Text>
      <Text style={styles.subtitle}>
        AppState: {AppState.currentState} | 
        Задача: {isTaskRegistered ? '✅' : '❌'}
      </Text>
      
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button 
            title={isTaskRegistered ? "🔄 Перерегистрировать" : "📝 Зарегистрировать"} 
            onPress={registerTestTask} 
          />
        </View>
        <View style={styles.button}>
          <Button 
            title="🗑️ Отменить" 
            onPress={unregisterTestTask}
            disabled={!isTaskRegistered}
          />
        </View>
        <View style={styles.button}>
          <Button 
            title="🚀 Запустить" 
            onPress={executeTaskManually}
            disabled={!isTaskRegistered}
          />
        </View>
        <View style={styles.button}>
          <Button title="📱 Статус" onPress={checkBackgroundFetchStatus} />
        </View>
        <View style={styles.button}>
          <Button title="📂 Логи" onPress={checkAsyncStorageLogs} />
        </View>
        <View style={styles.button}>
          <Button title="🧹 Очистить" onPress={clearLogs} color="#ff4444" />
        </View>
      </View>
      
      {lastExecution && (
        <View style={styles.executionInfo}>
          <Text style={styles.executionTitle}>Последнее выполнение:</Text>
          <Text>Время: {new Date(lastExecution.timestamp).toLocaleTimeString()}</Text>
          <Text>Состояние: {lastExecution.state}</Text>
          <Text>Задача: {lastExecution.task}</Text>
        </View>
      )}
      
      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>Логи:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    width: '48%',
    marginBottom: 8,
  },
  executionInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  executionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logsContainer: {
    maxHeight: 200,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
  },
  logsTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  logText: {
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});