// app.config.js
export default {
  expo: {
    name: "Pixel-weather",
    slug: "Pixel-weather",
    orientation: "portrait",
    userInterfaceStyle: "automatic", // Добавьте эту строку
    icon: "./assets/icons/favicon/icon.png",
    android: {
      userInterfaceStyle: "automatic",
      package: "com.learning.pixelweather",
      adaptiveIcon: {
        foregroundImage: "./assets/icons/favicon/icon.png", // та же или другая
        backgroundColor: "#FFFFFF" // или другой фон
      } 
    },
    plugins: ["expo-router"],
    extra: {
      weatherApiKey: process.env.WEATHERAPI_KEY,
      eas: {
        projectId: "5caa2ada-44ca-42a5-b0a7-16fe911ad12e"
      }
    },
  },
};