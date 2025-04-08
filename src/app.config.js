
//const isDev = process.env.APP_ENV === "development";
//console.log(`Running in ${isDev ? "development" : "production"} env`);

export default {
  "name": "Novelo",
  "slug": "Novelo",
  "version": "1.2.4",
  "orientation": "default",
  "icon": "./assets/ic_launcher_round.png",
  "scheme": "novels",
  "userInterfaceStyle": "automatic",
  "newArchEnabled": true,
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
    "package": "com.alentoma.Novelo"
  },
  "web": {
    "favicon": "./assets/ic_launcher.png"
  },
  "plugins": [
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
    "expo-sqlite",
    "expo-font",
    "expo-asset"
  ],
  "extra": {
    "eas": {
      "projectId": "a31d9c33-fb94-4252-b9e7-a744705a994e"
    }
  },
  "runtimeVersion": "1.0.0",
  "updates": {
    "enabled": false,
    "url": "https://u.expo.dev/a31d9c33-fb94-4252-b9e7-a744705a994e",
    "checkAutomatically": "NEVER",
  }
}

