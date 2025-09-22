/**
 * react-native.config.js
 *
 * This config disables codegen for react-native-config
 * to prevent CMake build errors on Android with New Architecture.
 */

module.exports = {
  dependencies: {
    'react-native-config': {
      platforms: {
        android: null, // disables auto-linking/codegen for Android
        ios: null,     // optional, if you also want to skip iOS
      },
    },
  },
};
