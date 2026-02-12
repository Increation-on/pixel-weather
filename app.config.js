export default{
  "expo": {
    "name": "Pixel Weather",
    "slug": "Pixel-weather",
    "scheme": "pixel-weather-app",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "icon": "./assets/icons/favicon/icon.png",
    "version": "1.0.0",
    "newArchEnabled": true,
    
    "splash": {
      "image": "./assets/icons/favicon/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#1a1f2e"
    },
    
    "assetBundlePatterns": ["assets/icons/*", "assets/notifications-icons/*"],
    
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.learning.pixel_weather",
      "usesAppleSignIn": false
    },
    
    "android": {
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.VIBRATE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK"
      ],
      "userInterfaceStyle": "automatic",
      "package": "com.learning.pixel_weather",
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/favicon/icon.png",
        "backgroundColor": "#1a1f2e"
      },
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{"scheme": "pixel-weather-app"}],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    
    "web": {
      "bundler": "metro",
      "favicon": "./public/favicon.ico"
    },
    
    "plugins": [
      "expo-router",
      
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 36,
            "targetSdkVersion": 36,
            "minSdkVersion": 24,
            "googleServicesEnabled": true,
            "enableProguardInReleaseBuilds": false,
            "useFrameworks": "static"
          },
          "ios": {
            "useFrameworks": "static",
            "deploymentTarget": "15.1"
          }
        }
      ],
      
    ],
    
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true,
      "tsconfigPaths": true
    },
    
    "extra": {
      "eas": {
        "projectId": "5caa2ada-44ca-42a5-b0a7-16fe911ad12e"
      }
    }
  }
}