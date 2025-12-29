module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['PressStart2P-Regular', 'monospace'],
      },
      colors: {
        // Основные цвета фона
        background: "#1a1f2e",     // Основной фон экрана
        card: "#252b3d",           // Фон карточек, виджетов
        
        // Акцентные цвета
        primary: "#4ecdc4",        // Основной акцент (бирюзовый)
        secondary: "#f7fff7",      // Второй акцент (песочный/теплый белый)
        
        // Текст
        text: {
          primary: "#e0e0e0",      // Основной текст
          secondary: "#8a8fa3",    // Второстепенный текст
        },
        
        // Семантические акценты
        danger: "#ff6b6b",         // Опасность, гроза, экстремальная температура
        success: "#6bcf7f",       // Успех, благоприятные условия
        warning: '#F2D768'        
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};