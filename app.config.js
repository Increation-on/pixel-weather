// app.config.js
export default {
  expo: {
    name: "Pixel-weather",
    slug: "Pixel-weather",
    userInterfaceStyle: "automatic", // Добавьте эту строку
    android: {
      userInterfaceStyle: "automatic" // Добавьте и эту строку для Android
    },
    plugins: ["expo-router"],
    extra: {
      weatherApiKey: process.env.WEATHERAPI_KEY,
    },
  },
};