import { ConfigContext, ExpoConfig } from "expo/config";

const variant = process.env.APP_VARIANT;

const getUniqueIdentifier = () => {
  switch (variant) {
    case "development":
      return "com.ritankar.worklog.dev";
    case "preview":
      return "com.ritankar.worklog.preview";
    default:
      return "com.ritankar.worklog";
  }
};
const getAppName = () => {
  switch (variant) {
    case "development":
      return "Worklog Dev";
    case "preview":
      return "Worklog Preview";
    default:
      return "Worklog";
  }
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "worklog",
  version: "2.4.0",
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
    versionCode: 15,
  },
  // Turn off Android's grey contrast scrim behind the 3-button navigation
  // bar; the bar is transparent over the app background and its button
  // colour follows the theme (NavigationBar.setStyle in src/app/_layout.tsx).
  androidNavigationBar: {
    enforceContrast: false,
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
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow $(PRODUCT_NAME) to access your camera to scan QR codes.",
      },
    ],
    "expo-sqlite",
    "@react-native-community/datetimepicker",
    // Themes the native date picker dialog for light and dark mode.
    "./plugins/with-date-picker-theme",
    "expo-secure-store",
    "@react-native-google-signin/google-signin",
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png",
        color: "#ffffff",
        defaultChannel: "backup",
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        url: "https://sentry.io/",
        project: "worlog",
        organization: "ritankar",
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
