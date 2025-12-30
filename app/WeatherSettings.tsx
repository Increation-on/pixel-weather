// app/WeatherSettings.tsx
import {
    View,
    Text,
    Switch,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { WeatherNotificationService } from '@/src/api/services/WeatherNotificationService';

export default function WeatherSettings() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [useCelsius, setUseCelsius] = useState(true);
    const [permissionStatus, setPermissionStatus] = useState<string>('undetermined');

    useEffect(() => {
        loadAllSettings();
    }, []);

    const loadAllSettings = async () => {
        try {
            // Загружаем настройки уведомлений
            const settings = await WeatherNotificationService.getSettings();
            setNotificationsEnabled(settings.enabled);
            
            // Загружаем статус разрешений
            const status = await WeatherNotificationService.getPermissionStatus();
            setPermissionStatus(status);
            
            console.log('Настройки загружены:', { enabled: settings.enabled, permissionStatus: status });
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    };

    const toggleNotifications = async (value: boolean) => {
        try {
            // Если включаем уведомления - проверяем/запрашиваем разрешения
            if (value) {
                const hasPermission = await WeatherNotificationService.requestPermissions();
                
                if (!hasPermission) {
                    // Если разрешение не дано - выключаем и обновляем статус
                    const status = await WeatherNotificationService.getPermissionStatus();
                    setPermissionStatus(status);
                    setNotificationsEnabled(false);
                    return;
                }
                
                // Обновляем статус разрешений
                setPermissionStatus('granted');
            }
            
            // Сохраняем настройку
            setNotificationsEnabled(value);
            await WeatherNotificationService.saveSettings({ enabled: value });
            
            console.log(`Уведомления ${value ? 'включены' : 'выключены'}`);
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
            // В случае ошибки возвращаем переключатель в исходное состояние
            setNotificationsEnabled(!value);
        }
    };

    const handleRequestPermission = async () => {
        const hasPermission = await WeatherNotificationService.requestPermissions();
        const status = await WeatherNotificationService.getPermissionStatus();
        setPermissionStatus(status);
        
        if (hasPermission) {
            setNotificationsEnabled(true);
            await WeatherNotificationService.saveSettings({ enabled: true });
        }
    };

    const getPermissionText = () => {
        // Проверяем Expo Go
        if (Constants.appOwnership === 'expo') {
            return '📱 EXPO GO';
        }
        
        switch (permissionStatus) {
            case 'granted': return '✅ РАЗРЕШЕНО';
            case 'denied': return '❌ ОТКЛОНЕНО';
            default: return '❓ НЕ ОПРЕДЕЛЕНО';
        }
    };

    // Проверяем, нужно ли показывать кнопку запроса разрешений
    const shouldShowRequestButton = () => {
        // В Expo Go не показываем кнопку запроса
        if (Constants.appOwnership === 'expo') {
            return false;
        }
        
        return permissionStatus === 'denied' && !notificationsEnabled;
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar
                barStyle="light-content"
                backgroundColor="#1a1f2e"
                translucent={false}
            />

            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Заголовок в пиксельном стиле */}
                <View className="mb-6 mt-8">
                    <View className="flex-row items-center mb-2">
                        <Image
                            source={require('@/assets/icons/settings.png')}
                            style={{ width: 48, height: 48, marginRight: 12 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-white text-3xl">НАСТРОЙКИ</Text>
                    </View>
                </View>

                {/* Секция: Уведомления с иконкой */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={require('@/assets/icons/notification.png')}
                            style={{ width: 48, height: 48, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-white text-xl">УВЕДОМЛЕНИЯ</Text>
                    </View>

                    <View className="bg-card rounded-lg p-4 border-2 border-card">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 mr-4">
                                <Text className="font-pixel text-white text-base mb-1">
                                    УВЕДОМЛЕНИЯ О ПОГОДЕ
                                </Text>
                                <Text className="font-pixel text-text-secondary text-xs">
                                    ОПОВЕЩЕНИЯ ОБ ИЗМЕНЕНИИ ТЕМПЕРАТУРЫ И ОСАДКОВ
                                </Text>
                            </View>
                            <Switch
                                value={notificationsEnabled}
                                onValueChange={toggleNotifications}
                                trackColor={{ false: '#767577', true: '#4ecdc4' }}
                                thumbColor={notificationsEnabled ? '#f7fff7' : '#f4f3f4'}
                                disabled={permissionStatus === 'denied' && !notificationsEnabled}
                            />
                        </View>

                        {/* Статус разрешений */}
                        <View className="mt-3 p-2 bg-background/50 rounded">
                            <Text className="font-pixel text-text-secondary text-xs mb-1">
                                СТАТУС РАЗРЕШЕНИЙ: {getPermissionText()}
                            </Text>
                            <Text className="font-pixel text-text-secondary text-xs">
                                УВЕДОМЛЕНИЯ: {notificationsEnabled ? '✅ ВКЛЮЧЕНЫ' : '❌ ВЫКЛЮЧЕНЫ'}
                            </Text>
                            
                            {/* Кнопка запроса разрешений если отклонено (только не в Expo Go) */}
                            {shouldShowRequestButton() && (
                                <TouchableOpacity 
                                    className="mt-2 p-2 bg-primary/20 rounded border border-primary"
                                    onPress={handleRequestPermission}
                                >
                                    <Text className="font-pixel text-primary text-xs text-center">
                                        ЗАПРОСИТЬ РАЗРЕШЕНИЕ СНОВА
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>

                {/* Секция: Внешний вид с иконкой */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={require('@/assets/icons/pallete.png')}
                            style={{ width: 48, height: 48, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-white text-xl">ВНЕШНИЙ ВИД</Text>
                    </View>

                    {/* Темная тема */}
                    <View className="bg-card rounded-lg p-4 mb-4 border-2 border-card">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 mr-4">
                                <Text className="font-pixel text-white text-base mb-1">
                                    ТЕМНАЯ ТЕМА
                                </Text>
                                <Text className="font-pixel text-text-secondary text-xs">
                                    ПЕРЕКЛЮЧЕНИЕ МЕЖДУ СВЕТЛОЙ И ТЕМНОЙ ТЕМОЙ
                                </Text>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: '#767577', true: '#4ecdc4' }}
                                thumbColor={darkMode ? '#f7fff7' : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    {/* Единицы измерения */}
                    <View className="bg-card rounded-lg p-4 border-2 border-card">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1 mr-4">
                                <Text className="font-pixel text-white text-base mb-1">
                                    ГРАДУСЫ ЦЕЛЬСИЯ
                                </Text>
                                <Text className="font-pixel text-text-secondary text-xs">
                                    ПОКАЗЫВАТЬ ТЕМПЕРАТУРУ В °C ВМЕСТО °F
                                </Text>
                            </View>
                            <Switch
                                value={useCelsius}
                                onValueChange={setUseCelsius}
                                trackColor={{ false: '#767577', true: '#4ecdc4' }}
                                thumbColor={useCelsius ? '#f7fff7' : '#f4f3f4'}
                            />
                        </View>

                        {/* Индикатор выбранной единицы */}
                        <View className="mt-3 flex-row space-x-2">
                            <View className={`flex-1 p-2 rounded ${useCelsius ? 'bg-primary' : 'bg-background/50'}`}>
                                <Text className={`font-pixel text-center ${useCelsius ? 'text-white' : 'text-text-secondary'} text-xs`}>
                                    °C
                                </Text>
                            </View>
                            <View className={`flex-1 p-2 rounded ${!useCelsius ? 'bg-primary' : 'bg-background/50'}`}>
                                <Text className={`font-pixel text-center ${!useCelsius ? 'text-white' : 'text-text-secondary'} text-xs`}>
                                    °F
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Секция: Информация с иконкой */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Image
                            source={require('@/assets/icons/info.png')}
                            style={{ width: 48, height: 48, marginRight: 8 }}
                            resizeMode="contain"
                        />
                        <Text className="font-pixel text-white text-xl">ИНФОРМАЦИЯ</Text>
                    </View>

                    <View className="bg-card/70 rounded-lg p-4 border border-card">
                        <Text className="font-pixel text-text-secondary text-sm mb-2">
                            ℹ️ УВЕДОМЛЕНИЯ ТРЕБУЮТ РАЗРЕШЕНИЯ
                        </Text>
                        <Text className="font-pixel text-text-secondary text-sm">
                            🔔 ПРОВЕРКА: КАЖДЫЕ 30 МИНУТ
                        </Text>
                        
                        {/* Информация о Expo Go */}
                        {Constants.appOwnership === 'expo' && (
                            <Text className="font-pixel text-yellow-400 text-sm mt-2">
                                ⚠️ EXPO GO: PUSH-УВЕДОМЛЕНИЯ НЕДОСТУПНЫ
                            </Text>
                        )}
                        
                        {/* Информация о разрешениях (только не в Expo Go) */}
                        {Constants.appOwnership !== 'expo' && permissionStatus === 'denied' && (
                            <Text className="font-pixel text-red-400 text-sm mt-2">
                                ⚠️ РАЗРЕШЕНИЕ ОТКЛОНЕНО. ЗАЙДИТЕ В НАСТРОЙКИ УСТРОЙСТВА.
                            </Text>
                        )}
                        
                        {/* Для Development Build */}
                        {Constants.appOwnership !== 'expo' && permissionStatus === 'granted' && (
                            <Text className="font-pixel text-green-400 text-sm mt-2">
                                ✅ PUSH-УВЕДОМЛЕНИЯ ДОСТУПНЫ
                            </Text>
                        )}
                    </View>
                </View>

                {/* Кнопка назад в пиксельном стиле */}
                <View className="mt-4 mb-8">
                    <Link href="/" asChild>
                        <TouchableOpacity className="bg-card border-2 border-primary rounded-lg p-4 active:opacity-80">
                            <Text className="font-pixel text-primary text-center text-base">
                                ← НАЗАД К ПОГОДЕ
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Футер с версией */}
                <View className="mt-12 pt-6 border-t border-card/50">
                    <Text className="font-pixel text-text-secondary text-xs text-center">
                        PIXEL WEATHER v1.0
                    </Text>
                    <Text className="font-pixel text-text-secondary text-xs text-center mt-1">
                        RETRO WEATHER APP
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}