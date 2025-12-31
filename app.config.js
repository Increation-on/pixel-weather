// app.config.js
export default {
  expo: {
    name: "Pixel-weather",
    slug: "Pixel-weather",
    orientation: "portrait",
    userInterfaceStyle: "automatic", // Добавьте эту строку
    android: {
      userInterfaceStyle: "automatic" // Добавьте и эту строку для Android
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