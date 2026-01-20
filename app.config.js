export default {
  expo: {
    name: "PIXEL-WEATHER-TEST-SPLASH",
    slug: "Pixel-weather",
    scheme: "pixel-weather-app",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icons/favicon/icon.png",
    version: "1.0.0",
    newArchEnabled: true,
    
    // ⭐ ИКОНКА КАК СПЛЕШ-СКРИН
    splash: {
      image: "./assets/icons/favicon/icon.png", // ← ТА ЖЕ ИКОНКА
      resizeMode: "contain",
      backgroundColor: "#1a1f2e" // ← ФОН КАК У ADAPTIVE ICON
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
        foregroundImage: "./assets/icons/favicon/icon.png", // ← ИКОНКА (НЕ СПЛЕШ!)
        backgroundColor: "#1a1f2e"
      }
    },
    
    web: {
      bundler: "metro",
      favicon: "./public/favicon.ico"
    },
    
    // ⭐ ДОБАВЬТЕ PLUGIN ДЛЯ СПЛЕША
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/icons/favicon/icon.png",
          "backgroundColor": "#1a1f2e",
          "resizeMode": "contain",
          "imageWidth": 200, // Размер иконки на сплеше
          "dark": {
            "image": "./assets/icons/favicon/icon.png",
            "backgroundColor": "#1a1f2e"
          }
        }
      ]
    ],
    
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