import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "dev";

const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.ritankar.worklog.dev";
  }
  if (IS_PREVIEW) {
    return "com.ritankar.worklog.preview";
  }

  return "com.ritankar.worklog";
};

const getAppName = () => {
  if (IS_DEV) {
    return "Worklog (Dev)";
  }
  if (IS_PREVIEW) {
    return "Worklog (Preview)";
  }

  return "Worklog";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "worklog",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "worklog",
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff",
      foregroundImage: "./assets/images/adaptive-icon.png",
      monochromeImage: "./assets/images/adaptive-icon.png",
    },
    allowBackup: false,
    predictiveBackGestureEnabled: false,
    package: getUniqueIdentifier(),
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon-dark.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
          image: "./assets/images/splash-icon-light.png",
        },
      },
    ],
    "expo-sqlite",
    "@react-native-community/datetimepicker",
    "expo-secure-store",
    "@react-native-google-signin/google-signin",
    "expo-background-task",
    [
      "expo-notifications",
      {
        icon: "./assets/images/adaptive-icon.png",
        color: "#ffffff",
        defaultChannel: "backup",
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
      projectId: "e2690177-7b5d-49d3-9c34-7fd1834a163d",
    },
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/e2690177-7b5d-49d3-9c34-7fd1834a163d",
  },
  owner: "ritankar",
});
