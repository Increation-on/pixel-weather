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
    
    splash: {
      image: "./assets/icons/favicon/icon.png",
      resizeMode: "contain",
      backgroundColor: "#1a1f2e"
    },
    
    assetBundlePatterns: [
      "assets/icons/*",
      "assets/notifications-icons/*"
    ],
    
    ios: {
      supportsTablet: true
    },
    
    android: {
      "permissions": [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK"
      ],
      userInterfaceStyle: "automatic",
      package: "com.learning.pixelweather",
      adaptiveIcon: {
        foregroundImage: "./assets/icons/favicon/icon.png",
        backgroundColor: "#1a1f2e"
      }
    },
    
    web: {
      bundler: "metro",
      favicon: "./public/favicon.ico"
    },
    
    // ⭐ ВАЖНО: Только эти плагины
    plugins: [
      "expo-background-task",
      "expo-router", 
      [
        "expo-splash-screen",
        {
          "image": "./assets/icons/favicon/icon.png",
          "backgroundColor": "#1a1f2e",
          "resizeMode": "contain",
          "imageWidth": 200
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