export default {
  expo: {
    name: "PIXEL-WEATHER-TEST-SPLASH",
    slug: "pixel-weather",
    
    // ⭐ ДОБАВЬТЕ ЭТУ СТРОКУ (любое уникальное имя)
    scheme: "pixel-weather-app",
    
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icons/favicon/icon.png",
    version: "1.0.0",
    newArchEnabled: true,
    
    splash: {
      image: "./assets/splashscreen.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    
    assetBundlePatterns: [
      "assets/icons/*",
      "assets/notifications-icons/*"
    ],
    
    ios: {
      supportsTablet: true
    },
    
    android: {
      userInterfaceStyle: "automatic",
      package: "com.learning.pixelweather",
      adaptiveIcon: {
        foregroundImage: "./assets/splashscreen.png",
        backgroundColor: "#1a1f2e"
      }
    },
    
    web: {
      bundler: "metro",
      favicon: "./public/favicon.ico"
    },
    
    plugins: ["expo-router"],
    
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    
    extra: {
      weatherApiKey: process.env.WEATHERAPI_KEY,
      eas: {
        projectId: "5caa2ada-44ca-42a5-b0a7-16fe911ad12e"
      }
    },
  },
};