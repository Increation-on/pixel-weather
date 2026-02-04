// src/utils/moduleTest.ts
export async function moduleTest() {
  console.log('=== НАЧАЛО ТЕСТА МОДУЛЕЙ ===');
  
  try {
    // 1. Проверяем NativeModules
    const { NativeModules } = require('react-native');
    console.log('📱 NativeModules доступен:', !!NativeModules);
    
    if (NativeModules) {
      const moduleNames = Object.keys(NativeModules);
      console.log(`📱 Всего нативных модулей: ${moduleNames.length}`);
      
      // Ищем модули связанные с задачами
      const taskModules = moduleNames.filter(name => 
        name.includes('Task') || 
        name.includes('Background') ||
        name.includes('task') ||
        name.includes('background')
      );
      
      console.log('📋 Найдены модули задач:', taskModules);
      
      // Выводим все модули для диагностики
      console.log('📋 Все модули (первые 20):');
      moduleNames.slice(0, 20).forEach((name: string, i: number) => {
        console.log(`  ${i + 1}. ${name}`);
      });
    }
    
    // 2. Проверяем expo-task-manager
    console.log('\n🔍 Проверяем expo-task-manager...');
    try {
      const TaskManager = require('expo-task-manager');
      console.log('✅ expo-task-manager доступен');
      
      // Проверяем методы
      console.log('📋 Методы TaskManager:');
      const tmMethods = Object.keys(TaskManager).filter((key: string) => typeof TaskManager[key] === 'function');
      console.log(tmMethods.join(', '));
      
      // Проверяем зарегистрированные задачи
      if (TaskManager.getRegisteredTasksAsync) {
        const tasks = await TaskManager.getRegisteredTasksAsync();
        console.log(`📋 Зарегистрированные задачи: ${tasks?.length || 0}`);
      }
    } catch (error) {
      console.log('❌ expo-task-manager НЕ доступен:', (error as Error).message);
    }
    
    // 3. Проверяем expo-background-fetch
    console.log('\n🔍 Проверяем expo-background-fetch...');
    try {
      const BackgroundFetch = require('expo-background-fetch');
      console.log('✅ expo-background-fetch доступен');
      
      // Проверяем статус
      if (BackgroundFetch.getStatusAsync) {
        const status = await BackgroundFetch.getStatusAsync();
        console.log(`📱 BackgroundFetch статус код: ${status}`);
        
        // Простая проверка без сравнения с числами
        if (status === 0) console.log('📱 Статус: Denied (0)');
        else if (status === 1) console.log('📱 Статус: Restricted (1)');
        else if (status === 2) console.log('📱 Статус: Available (2)');
        else if (status === 3) console.log('📱 Статус: Unknown (3)');
        else console.log(`📱 Статус: ${status}`);
      }
    } catch (error) {
      console.log('❌ expo-background-fetch НЕ доступен:', (error as Error).message);
    }
    
    // 4. Проверяем expo-background-task
    console.log('\n🔍 Проверяем expo-background-task...');
    try {
      const BackgroundTask = require('expo-background-task');
      console.log('✅ expo-background-task доступен');
      
      // Проверяем методы
      console.log('📋 Методы BackgroundTask:');
      const btMethods = Object.keys(BackgroundTask).filter((key: string) => typeof BackgroundTask[key] === 'function');
      console.log(btMethods.join(', '));
      
      // Проверяем доступность
      if (BackgroundTask.isAvailableAsync) {
        const isAvailable = await BackgroundTask.isAvailableAsync();
        console.log(`📱 BackgroundTask доступен: ${isAvailable}`);
      }
    } catch (error) {
      console.log('❌ expo-background-task НЕ доступен:', (error as Error).message);
    }
    
    console.log('=== КОНЕЦ ТЕСТА ===');
    
  } catch (error) {
    console.log('🔥 ОШИБКА В ТЕСТЕ:', (error as Error).message);
  }
}