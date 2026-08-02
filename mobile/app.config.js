const APP_VARIANT = process.env.APP_VARIANT ?? "production";
const isPreview = APP_VARIANT === "preview";

const androidPackage = isPreview ? "ng.gov.kogi.adoza.datacentre.preview" : "ng.gov.kogi.adoza.datacentre";

module.exports = {
  expo: {
    name: isPreview ? "ADOZA Data Centre (Preview)" : "ADOZA Data Centre",
    slug: "adoza-data-center-qtgth8",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "adozadatacentre",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: androidPackage,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "ADOZA uses your location to record where a youth is registered during door-to-door visits.",
      },
    },
    android: {
      package: androidPackage,
      adaptiveIcon: {
        backgroundColor: "#0f3d24",
        foregroundImage: "./assets/images/android-icon-foreground.png",
      },
      predictiveBackGestureEnabled: false,
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
      versionCode: 2,
    },
    web: {
      output: "single",
      favicon: "./assets/images/kogi-logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "ADOZA uses your location to record where a youth is registered during door-to-door visits.",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#0f3d24",
          image: "./assets/images/kogi-logo.png",
          imageWidth: 120,
        },
      ],
      "@react-native-community/datetimepicker",
      [
        "expo-image-picker",
        {
          cameraPermission: "ADOZA uses your camera to capture a photo of the youth during door-to-door registration.",
          photosPermission: false,
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            buildArchs: ["arm64-v8a"],
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "63d897ab-f1e5-4139-aa16-c71f936e0d90",
      },
    },
    owner: "kruddpippins-inc",
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/63d897ab-f1e5-4139-aa16-c71f936e0d90",
    },
  },
};
