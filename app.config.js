export default {
  expo: {
    name: "PIXEL-WEATHER-TEST-SPLASH",
    slug: "Pixel-weather",
    scheme: "pixel-weather-app",
    version: "1.0.0",
    
    // ⚠️ ВРЕМЕННО отключи новую архитектуру
    newArchEnabled: false,
    
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icons/favicon/icon.png",
    
    // SPLASH - правильно
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
      package: "com.learning.pixelweather",
      permissions: [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK"
      ],
      userInterfaceStyle: "automatic",
      adaptiveIcon: {
        foregroundImage: "./assets/icons/favicon/icon.png",
        backgroundColor: "#1a1f2e"
      }
    },
    
    web: {
      bundler: "metro",
      favicon: "./public/favicon.ico"
    },
    
    // ⭐ ВАЖНО: ПРАВИЛЬНЫЕ ПЛАГИНЫ
    plugins: [
      "expo-background-task",
      "expo-router",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 23,
            enableProguardInReleaseBuilds: false,
            extraMavenRepos: [
              "../../node_modules/@notifee/react-native/android/libs"
            ]
          },
          ios: {
            deploymentTarget: "15.1"
          }
        }
      ]
    ],
    
    experiments: {
      typedRoutes: true,
      // ⚠️ ВРЕМЕННО отключи reactCompiler
      // reactCompiler: true
    },
    
    extra: {
      weatherApiKey: process.env.WEATHERAPI_KEY,
      eas: {
        projectId: "5caa2ada-44ca-42a5-b0a7-16fe911ad12e"
      }
    }
  }
};