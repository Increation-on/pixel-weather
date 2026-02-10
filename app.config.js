export default {
  "expo": {
    "name": "PIXEL-WEATHER-TEST-SPLASH",
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
    
    "assetBundlePatterns": [
      "assets/icons/*",
      "assets/notifications-icons/*"
    ],
    
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.learning.pixel_weather",
      "infoPlist": {
        "UIBackgroundModes": [
          "fetch",
          "remote-notification",
          "processing"
        ]
      },
      "usesAppleSignIn": false
    },
    
    "android": {
      "permissions": [
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.WAKE_LOCK",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_DATA_SYNC"
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
          "data": [
            {
              "scheme": "pixel-weather-app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    
    "web": {
      "bundler": "metro",
      "favicon": "./public/favicon.ico"
    },
    
    "plugins": [
      "expo-background-task",
      "expo-router",
      "expo-task-manager",
      
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 36,
            "targetSdkVersion": 36,
            "minSdkVersion": 24,
            "googleServicesEnabled": true,
            "enableProguardInReleaseBuilds": false,
            "useFrameworks": "static",
            "packagingOptions": {
              "pickFirst": [
                "**/libc++_shared.so"
              ]
            }
          },
          "ios": {
            "useFrameworks": "static",
            "deploymentTarget": "15.1"
          }
        }
      ],

      [
        "@react-native-firebase/app",
        {
          "googleServicesFile": "./google-services.json"
        }
      ],
      
      [
        "@react-native-firebase/messaging",
        {
          "disableBackgroundHandler": false
        }
      ],

      // ===== ПЛАГИН NOTIFEE С ОБЯЗАТЕЛЬНЫМ ПАРАМЕТРОМ =====
      [
        "@evennit/notifee-expo-plugin",
        {
          "iosDeploymentTarget": "15.1",
          // ДОБАВЬТЕ ЭТУ СТРОКУ:
          "apsEnvMode": "development"
        }
      ],

      [
        "expo-splash-screen",
        {
          "image": "./assets/icons/favicon/icon.png",
          "backgroundColor": "#1a1f2e",
          "resizeMode": "contain",
          "imageWidth": 200,
          "dark": {
            "image": "./assets/icons/favicon/icon.png",
            "backgroundColor": "#1a1f2e"
          }
        }
      ]
    ],
    
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true,
      "tsconfigPaths": true
    },
    
    "extra": {
      "weatherApiKey": process.env.WEATHERAPI_KEY,
      "eas": {
        "projectId": "5caa2ada-44ca-42a5-b0a7-16fe911ad12e"
      }
    }
  }
}