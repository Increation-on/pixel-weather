// src/utils/temperature.ts
export function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5/9;
}

export function formatTemperature(
    celsius: number, 
    unit: 'celsius' | 'fahrenheit',
    decimals: number = 1
): string {
    if (unit === 'fahrenheit') {
        const fahrenheit = celsiusToFahrenheit(celsius);
        return `${fahrenheit.toFixed(decimals)}°F`;
    }
    return `${celsius.toFixed(decimals)}°C`;
}

export function getTemperatureUnitSymbol(unit: 'celsius' | 'fahrenheit'): string {
    return unit === 'celsius' ? '°C' : '°F';
}

export function formatTemperatureForDisplay(
    celsius: number,
    unit: 'celsius' | 'fahrenheit',
    options?: {
        showUnit?: boolean;
        decimals?: number;
    }
): string {
    const { showUnit = true, decimals = 0 } = options || {};
    
    if (unit === 'fahrenheit') {
        const fahrenheit = celsiusToFahrenheit(celsius);
        const value = fahrenheit.toFixed(decimals);
        return showUnit ? `${value}°F` : `${value}°`;
    }
    
    const value = celsius.toFixed(decimals);
    return showUnit ? `${value}°C` : `${value}°`;
}