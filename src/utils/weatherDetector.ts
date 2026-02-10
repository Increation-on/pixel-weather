// src/utils/weatherDetector.ts

/**
 * Определяет КАТЕГОРИЮ погоды по WMO коду
 * Категории: ясно, облачно, дождь, снег, ливень, гроза, туман
 */
export function getWeatherCategory(weatherCode: number): string {
  // Ясно
  if (weatherCode === 0) return 'ясно';
  
  // Облачно
  if (weatherCode >= 1 && weatherCode <= 3) return 'облачно';
  
  // Туман, изморозь
  if (weatherCode >= 45 && weatherCode <= 48) return 'туман';
  
  // Дождь (морось, дождь, ледяной дождь)
  if (weatherCode >= 51 && weatherCode <= 67) return 'дождь';
  
  // Снег (снег, снежные зерна)
  if (weatherCode >= 71 && weatherCode <= 77) return 'снег';
  
  // Ливень
  if (weatherCode >= 80 && weatherCode <= 82) return 'ливень';
  
  // Снегопад
  if (weatherCode >= 85 && weatherCode <= 86) return 'снегопад';
  
  // Гроза
  if (weatherCode >= 95 && weatherCode <= 99) return 'гроза';
  
  return 'неизвестно';
}

/**
 * Определяет ТИП осадков
 */
export function getPrecipitationType(weatherCode: number): string {
  if (weatherCode >= 51 && weatherCode <= 55) return 'морось';
  if (weatherCode >= 56 && weatherCode <= 57) return 'ледяная морось';
  if (weatherCode >= 61 && weatherCode <= 65) return 'дождь';
  if (weatherCode >= 66 && weatherCode <= 67) return 'ледяной дождь';
  if (weatherCode >= 71 && weatherCode <= 75) return 'снег';
  if (weatherCode === 77) return 'снежные зерна';
  if (weatherCode >= 80 && weatherCode <= 82) return 'ливень';
  if (weatherCode >= 85 && weatherCode <= 86) return 'снегопад';
  if (weatherCode >= 95 && weatherCode <= 99) return 'гроза';
  return 'none'; // нет осадков
}

/**
 * Определяет интенсивность осадков
 */
export function getPrecipitationIntensity(weatherCode: number): string {
  // Легкий
  if ([51, 56, 61, 66, 71, 80, 85].includes(weatherCode)) return 'легкий';
  
  // Умеренный
  if ([53, 63, 73, 81, 86].includes(weatherCode)) return 'умеренный';
  
  // Сильный
  if ([55, 57, 65, 67, 75, 77, 82].includes(weatherCode)) return 'сильный';
  
  // Гроза
  if (weatherCode >= 95 && weatherCode <= 99) return 'гроза';
  
  return 'нет';
}

/**
 * Человеко-читаемое описание погоды
 */
export function getWeatherDescription(weatherCode: number): string {
  const descriptions: Record<number, string> = {
    0: 'Ясно ☀️',
    1: 'Преимущественно ясно',
    2: 'Переменная облачность ⛅', 
    3: 'Пасмурно ☁️',
    45: 'Туман 🌫️',
    48: 'Изморозь',
    51: 'Легкая морось 🌧️',
    53: 'Умеренная морось 🌧️',
    55: 'Сильная морось 🌧️',
    56: 'Легкая ледяная морось 🌧️❄️',
    57: 'Сильная ледяная морось 🌧️❄️',
    61: 'Небольшой дождь 🌧️',
    63: 'Умеренный дождь 🌧️',
    65: 'Сильный дождь 🌧️💦',
    66: 'Легкий ледяной дождь 🌧️❄️',
    67: 'Сильный ледяной дождь 🌧️❄️',
    71: 'Небольшой снег ❄️',
    73: 'Умеренный снег ❄️',
    75: 'Сильный снег ❄️💨',
    77: 'Снежные зерна ❄️',
    80: 'Небольшой ливень 🌧️💦',
    81: 'Умеренный ливень 🌧️💦',
    82: 'Сильный ливень 🌧️💦',
    85: 'Небольшой снегопад ❄️💨',
    86: 'Сильный снегопад ❄️💨',
    95: 'Гроза ⚡',
    96: 'Гроза с градом ⚡🧊',
    99: 'Сильная гроза с градом ⚡🧊💥'
  };
  return descriptions[weatherCode] || `Код: ${weatherCode}`;
}

/**
 * Детектирует значимые изменения погоды
 */
export function detectWeatherChanges(
  oldSnapshot: { weatherCode: number; precipitation: number; windSpeed: number,  temperature?: number } | null,
  newData: { weatherCode: number; precipitation: number; windSpeed: number,  temperature?: number }
): string[] {
  const changes: string[] = [];
  
  if (!oldSnapshot) {
    return changes; // Первый запуск
  }
  
  console.log('🔍 ДЕТЕКТИРОВАНИЕ ИЗМЕНЕНИЙ ПОГОДЫ:');
  console.log('  Старое:', getWeatherDescription(oldSnapshot.weatherCode));
  console.log('  Новое:', getWeatherDescription(newData.weatherCode));

   // 👇 ДОБАВЬТЕ ПРОВЕРКУ ТЕМПЕРАТУРЫ
  if (oldSnapshot.temperature !== undefined && newData.temperature !== undefined) {
    const tempDiff = Math.abs(newData.temperature - oldSnapshot.temperature);
    if (tempDiff >= 3) { // Порог 3°C
      const direction = newData.temperature > oldSnapshot.temperature ? '↑' : '↓';
      changes.push(`Температура ${direction} на ${tempDiff.toFixed(1)}°C`);
    }
  }

  // 1. ИЗМЕНЕНИЕ КАТЕГОРИИ ПОГОДЫ (самое важное!)
  const oldCategory = getWeatherCategory(oldSnapshot.weatherCode);
  const newCategory = getWeatherCategory(newData.weatherCode);
  
  if (oldCategory !== newCategory) {
    // Особые случаи
    if (oldCategory === 'ясно' && newCategory === 'гроза') {
      changes.push('Началась гроза ⚡');
    } else if (oldCategory === 'снег' && newCategory === 'дождь') {
      changes.push('Снег сменился дождем ❄️→🌧️');
    } else if (oldCategory === 'дождь' && newCategory === 'снег') {
      changes.push('Дождь сменился снегом 🌧️→❄️');
    } else {
      changes.push(`${oldCategory} → ${newCategory}`);
    }
    console.log(`✅ Смена категории: ${oldCategory} → ${newCategory}`);
  }

  // 2. ИЗМЕНЕНИЕ ИНТЕНСИВНОСТИ (если категория не изменилась)
  else if (oldCategory === newCategory && oldCategory !== 'ясно' && oldCategory !== 'облачно' && oldCategory !== 'туман') {
    const oldIntensity = getPrecipitationIntensity(oldSnapshot.weatherCode);
    const newIntensity = getPrecipitationIntensity(newData.weatherCode);
    
    if (oldIntensity !== newIntensity && oldIntensity !== 'нет' && newIntensity !== 'нет') {
      const type = getPrecipitationType(newData.weatherCode);
      if (newIntensity === 'сильный') {
        changes.push(`Усилился ${type} 💪`);
      } else if (oldIntensity === 'сильный' && newIntensity !== 'сильный') {
        changes.push(`${type} ослаб`);
      } else {
        changes.push(`${type}: ${oldIntensity} → ${newIntensity}`);
      }
      console.log(`✅ Изменение интенсивности: ${oldIntensity} → ${newIntensity}`);
    }
  }

  // 3. НАЧАЛО/КОНЕЦ ОСАДКОВ (простая проверка)
  const oldPrecip = oldSnapshot.precipitation > 0;
  const newPrecip = newData.precipitation > 0;
  
  if (oldPrecip && !newPrecip) {
    const oldType = getPrecipitationType(oldSnapshot.weatherCode);
    changes.push(`${oldType} прекратился`);
    console.log(`✅ Осадки прекратились`);
  } else if (!oldPrecip && newPrecip) {
    const newType = getPrecipitationType(newData.weatherCode);
    changes.push(`Начался ${newType}`);
    console.log(`✅ Начались осадки: ${newType}`);
  }

  // 4. ЭКСТРЕМАЛЬНЫЕ УСЛОВИЯ
  // Сильный ветер (порог 15 м/с вместо 20)
  const wasStrongWind = oldSnapshot.windSpeed > 15;
  const isStrongWind = newData.windSpeed > 15;
  
  if (!wasStrongWind && isStrongWind) {
    changes.push('Усилился ветер 💨');
    console.log('✅ Ветер усилился');
  } else if (wasStrongWind && !isStrongWind) {
    changes.push('Ветер ослаб 💨');
    console.log('✅ Ветер ослаб');
  }

  // Переход в "сильные" осадки
  const oldIntensity = getPrecipitationIntensity(oldSnapshot.weatherCode);
  const newIntensity = getPrecipitationIntensity(newData.weatherCode);
  
  if (newIntensity === 'сильный' && oldIntensity !== 'сильный') {
    const type = getPrecipitationType(newData.weatherCode);
    changes.push(`Сильный ${type} 🌊`);
    console.log(`✅ Сильные осадки: ${type}`);
  }
  

  console.log('🔔 Итог изменений:', changes.length > 0 ? changes : 'нет изменений');
  return changes;
}