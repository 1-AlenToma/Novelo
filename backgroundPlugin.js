const {
  AndroidConfig,
  ConfigPlugin,
  createRunOncePlugin,
  withInfoPlist,
  withAndroidManifest
} = require("@expo/config-plugins");

const pkg = {
  name: "react-native-background-actions",
  version: "UNVERSIONED"
};
const withBackgroundActions = config => {
  // iOS
  config = withInfoPlist(config, newConfig => {
    if (
      !newConfig.modResults
        .BGTaskSchedulerPermittedIdentifiers
    ) {
      newConfig.modResults.BGTaskSchedulerPermittedIdentifiers =
        [];
    }

    if (
      Array.isArray(
        newConfig.modResults
          .BGTaskSchedulerPermittedIdentifiers
      )
    ) {
      newConfig.modResults.BGTaskSchedulerPermittedIdentifiers.push(
        "$(PRODUCT_BUNDLE_IDENTIFIER)"
      );
    }

    if (!newConfig.modResults.UIBackgroundModes) {
      newConfig.modResults.UIBackgroundModes = [];
    }

    if (
      Array.isArray(
        newConfig.modResults.UIBackgroundModes
      )
    ) {
      newConfig.modResults.UIBackgroundModes.push(
        "processing"
      );
    }

    return newConfig;
  });

  // Android
  config =
    AndroidConfig.Permissions.withPermissions(
      config,
      [
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.WAKE_LOCK"
      ]
    );

  config = withAndroidManifest(
    config,
    newConfig => {
      if (
        newConfig.modResults.manifest.application
      ) {
        if (
          !newConfig.modResults.manifest
            .application[0].service
        ) {
          newConfig.modResults.manifest.application[0].service =
            [];
        }

        newConfig.modResults.manifest.application[0].service.push(
          {
            $: {
              "android:name":
                "com.asterinet.react.bgactions.RNBackgroundActionsTask"
            }
          }
        );
      }
      return newConfig;
    }
  );

  return config;
};

module.exports = createRunOncePlugin(
  withBackgroundActions,
  pkg.name,
  pkg.version
);
