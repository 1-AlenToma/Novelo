/**
 * react-native.config.js
 *
 * This config disables codegen for react-native-config
 * to prevent CMake build errors on Android with New Architecture.
 */

module.exports = {
  dependencies: {
    'onnxruntime-react-native': {
      root: './node_modules/onnxruntime-react-native',
      platforms: {
        android: {
          sourceDir: './android',
          packageImportPath: 'import ai.onnxruntime.reactnative.OnnxruntimePackage;',
          packageInstance: 'new OnnxruntimePackage()',
        },
      },
    },
    'react-native-config': {
      platforms: {
        android: null, // disables auto-linking/codegen for Android
        ios: null,     // optional, if you also want to skip iOS
      },
    },
  },
};
