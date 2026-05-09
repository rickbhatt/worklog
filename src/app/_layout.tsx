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
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect, useState } from "react";
import { AppState, InteractionManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

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

    const task = InteractionManager.runAfterInteractions(() => {
      const startup = async () => {
        try {
          if (!mounted) return;

          console.log("🚀 Startup tasks: begin");

          ensureBackupDir();

          setupNotifications();

          /*
           * Allow SQLiteProvider + React lifecycle
           * to fully settle before DB work.
           */
          await new Promise((resolve) => setTimeout(resolve, 0));

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

export default function RootLayout() {
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
}
