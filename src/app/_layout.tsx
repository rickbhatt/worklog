import { DB_NAME } from "@/constants";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { ThemeProvider, useTheme } from "@/theme/theme-provider";
import { useFonts } from "expo-font";
import { PressableProvider } from "@/components/ui/pressable";
import { AuthProvider } from "@/contexts/AuthContext";
import { initialiseDb } from "@/db/client";
import { clearStaleExportSheets } from "@/db/mutations/export-sheet.mutations";
import "@/global.css";
import { useDb } from "@/hooks/useDb";
import { useDrizzleStudioDev } from "@/hooks/useDrizzleStudioDev";
import { captureException } from "@/lib/sentry";
import {
  checkAndAutoBackup,
  ensureBackupDir,
  syncPendingRestoreState,
} from "@/services/backupService";
import { configureGoogleSignIn } from "@/services/googleAuthService";
import { setupNotifications } from "@/services/notificationService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { InteractionManager, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://7334a78670d0235b3427d1e4c7e0e344@o4509792171393024.ingest.us.sentry.io/4511359683067904",

  sendDefaultPii: true,

  enableLogs: true,

  // spotlight: __DEV__,
});

configureGoogleSignIn();

const Layout = () => {
  const db = useDb();

  useDrizzleStudioDev();

  const { colors, isDark } = useTheme();

  const startupRanRef = useRef(false);

  // Android 3-button navigation bar: dark buttons in light mode, light buttons
  // in dark mode. ("light" here means a light bar with dark content.)
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setStyle(isDark ? "dark" : "light");
    }
  }, [isDark]);

  /*
   * One-time startup tasks
   */
  useEffect(() => {
    if (startupRanRef.current) return;

    startupRanRef.current = true;

    let mounted = true;

    const task = InteractionManager.runAfterInteractions(() => {
      const startup = async () => {
        try {
          if (!mounted) return;

          ensureBackupDir();

          /*
           * Forget the export sheet saved for a previous month
           */
          await clearStaleExportSheets(db);

          if (!mounted) return;

          setupNotifications();

          if (!mounted) return;

          /*
           * Sync pending restore metadata
           */
          await syncPendingRestoreState(db);

          if (!mounted) return;

          /*
           * Auto backup check
          
           */

          await checkAndAutoBackup(db);

          if (!mounted) return;
        } catch (error) {
          captureException(error, {
            tags: {
              "startup.operation": "runStartupTasks",
            },
          });

          console.error("🚀 Startup tasks failed:", error);
        }
      };

      startup();
    });

    return () => {
      mounted = false;

      task.cancel();
    };
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "ios_from_right",
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="work-log" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
};

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const handleInit = async (db: SQLiteDatabase) => {
    await initialiseDb(db);
    await SplashScreen.hideAsync();
  };
  const handleError = (err: Error) => {
    captureException(err, {
      tags: {
        "db.operation": "SQLiteProvider.onError",
      },
    });

    console.error("SQLiteProvider error", err);
  };

  // Keep the splash screen up until fonts are ready (it's hidden after the
  // database initialises). On a font error, fall back to system fonts.
  if (!fontsLoaded && !fontError) return null;

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
        <PressableProvider>
          <BottomSheetModalProvider>
            <SQLiteProvider
              databaseName={DB_NAME}
              options={{ enableChangeListener: true }}
              onInit={handleInit}
              onError={handleError}
            >
              <AuthProvider>
                <Layout />
              </AuthProvider>
            </SQLiteProvider>

            <PortalHost />

            <Toaster position="top-center" offset={70} richColors />
          </BottomSheetModalProvider>
        </PressableProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};

export default Sentry.wrap(RootLayout);
