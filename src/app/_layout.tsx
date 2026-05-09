import LoadingScreen from "@/components/loading-screen";
import { DB_NAME } from "@/constants";
import { AuthProvider } from "@/contexts/AuthContext";
import { getDbInstance, initialiseDb, validateDb } from "@/db/client";
import "@/global.css";
import { useDb } from "@/hooks/useDb";
import { useDrizzleStudioDev } from "@/hooks/useDrizzleStudioDev";
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
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect, useState } from "react";
import { AppState, InteractionManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

Sentry.init({
  dsn: "https://7334a78670d0235b3427d1e4c7e0e344@o4509792171393024.ingest.us.sentry.io/4511359683067904",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

configureGoogleSignIn();

let hasInitializedStartupTasks = false;

const Layout = () => {
  const db = useDb();

  useDrizzleStudioDev();

  const [dbReady, setDbReady] = useState(false);

  /*
   * Validate database connection
   */
  useEffect(() => {
    let mounted = true;

    try {
      const sqlite = getDbInstance();

      if (!sqlite) {
        setDbReady(false);
        return;
      }

      const healthy = validateDb(db);

      if (!mounted) return;

      console.log("🚀 DB validation result:", healthy);

      setDbReady(healthy);
    } catch (error) {
      console.error("🚀 DB validation failed:", error);

      if (!mounted) return;

      setDbReady(false);
    }

    return () => {
      mounted = false;
    };
  }, [db]);

  /*
   * One-time startup tasks
   */
  useEffect(() => {
    if (!dbReady) return;

    if (hasInitializedStartupTasks) return;

    let mounted = true;

    /*
     * Defer non-critical startup work until after the initial
     * React Native render, navigation mount, animations, and
     * interaction lifecycle settle.
     *
     * This helps avoid SQLite/Drizzle lifecycle races during:
     * - React StrictMode remounts (dev)
     * - Expo dev reload cycles
     * - SQLiteProvider reinitialization
     * - database restore/restart flows
     *
     * We intentionally run backup/sync startup tasks here because
     * they are not required for first paint or initial navigation.
     */

    const task = InteractionManager.runAfterInteractions(() => {
      const startup = async () => {
        try {
          if (!mounted) return;

          console.log("🚀 Startup tasks: begin");

          ensureBackupDir();

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
          checkAndAutoBackup(db);

          if (!mounted) return;

          hasInitializedStartupTasks = true;

          console.log("🚀 Startup tasks: complete");
        } catch (error) {
          console.error("🚀 Startup tasks failed:", error);
        }
      };

      startup();
    });

    return () => {
      mounted = false;

      task.cancel();
    };
  }, [db, dbReady]);

  /*
   * Foreground auto-backup checks
   */
  useEffect(() => {
    if (!dbReady) return;

    const subscription = AppState.addEventListener("change", async (state) => {
      if (state !== "active") return;

      await checkAndAutoBackup(db);
    });

    return () => {
      subscription.remove();
    };
  }, [db, dbReady]);

  /*
   * Optional loading guard
   */
  if (!dbReady) {
    return <LoadingScreen />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "ios_from_right",
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
  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Suspense fallback={<LoadingScreen />}>
            <SQLiteProvider
              useSuspense
              databaseName={DB_NAME}
              options={{ enableChangeListener: true }}
              onInit={initialiseDb}
            >
              <AuthProvider>
                <Layout />
              </AuthProvider>
            </SQLiteProvider>
          </Suspense>
          <PortalHost />
          <Toaster position="bottom-center" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};

export default Sentry.wrap(RootLayout);
