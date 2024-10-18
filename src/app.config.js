
const isDev = process.env.APP_ENV === "development";
console.log(`Running in ${isDev ? "development" : "production"} env`);

export default {
  "name": "Novelo",
  "slug": "Novelo",
  "version": "1.0.9",
  "orientation": "default",
  "icon": "./assets/ic_launcher_round.png",
  "scheme": "novels",
  "userInterfaceStyle": "automatic",
  "splash": {
    "image": "./assets/sp.png",
    "resizeMode": "contain",
    "backgroundColor": "#ffffff"
  },
  "assetBundlePatterns": [
    "**/*"
  ],
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.alentoma.Novelo"
  },
  "android": {
    "softwareKeyboardLayoutMode": "pan",
    "permissions": [
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
      "android.permission.INTERNET",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.VIBRATE",
      "android.permission.WAKE_LOCK",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.MANAGE_EXTERNAL_STORAGE",
      "android.permission.DOWNLOAD_WITHOUT_NOTIFICATION"
    ],
    "adaptiveIcon": {
      "foregroundImage": "./assets/ic_launcher_foreground.png",
      "backgroundColor": "#ffffff"
    },
    "package": isDev ? "com.alentoma.Novelo.dev" : "com.alentoma.Novelo"
  },
  "web": {
    "favicon": "./assets/ic_launcher.png"
  },
  "plugins": [
    [
      "expo-updates",
      {
        "username": "alentoma"
      }
    ],
    [
      "expo-screen-orientation",
      {
        "initialOrientation": "DEFAULT"
      }
    ],
    [
      "expo-build-properties",
      {
        "android": {
          "usesCleartextTraffic": true,
          "requestLegacyExternalStorage": true
        }
      }
    ],
    "expo-font",
    "expo-asset"
  ],
  "extra": {
    env: isDev ? "development" : "production",
    "eas": {
      "projectId": "a31d9c33-fb94-4252-b9e7-a744705a994e"
    }
  },
  "runtimeVersion": "1.0.0",
  "updates": {
    "url": "https://u.expo.dev/a31d9c33-fb94-4252-b9e7-a744705a994e"
  }
}

