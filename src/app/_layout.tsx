import LoadingScreen from "@/components/loading-screen";
import { DB_NAME } from "@/constants";
import { AuthProvider } from "@/contexts/AuthContext";
import { initialiseDb, validateDb } from "@/db/client";
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
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { InteractionManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

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

  const startupRanRef = useRef(false);

  const [dbReady, setDbReady] = useState(false);

  /*
   * Validate database connection
   */
  useEffect(() => {
    let mounted = true;

    const validate = async () => {
      try {
        const healthy = await validateDb();

        if (!mounted) return;

        console.log("🚀 DB validation result:", healthy);

        setDbReady(healthy);
      } catch (error) {
        console.error("🚀 DB validation failed:", error);

        if (!mounted) return;

        setDbReady(false);
      }
    };

    validate();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * One-time startup tasks
   */
  useEffect(() => {
    if (!dbReady) return;

    if (startupRanRef.current) return;

    startupRanRef.current = true;

    let mounted = true;

    const task = InteractionManager.runAfterInteractions(() => {
      const startup = async () => {
        try {
          if (!mounted) return;

          console.log("🚀 Startup tasks: begin");

          await ensureBackupDir();

          await setupNotifications();

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
          <SQLiteProvider
            databaseName={DB_NAME}
            options={{ enableChangeListener: true }}
            onInit={async (expoDb) => {
              try {
                await initialiseDb(expoDb);
              } catch (error) {
                captureException(error, {
                  tags: {
                    "db.operation": "SQLiteProvider.onInit",
                  },
                });

                console.error("Db initialisation failed", error);

                throw error;
              }
            }}
            onError={(error) => {
              captureException(error, {
                tags: {
                  "db.operation": "SQLiteProvider.onError",
                },
              });

              console.error("SQLiteProvider error", error);
            }}
          >
            <AuthProvider>
              <Layout />
            </AuthProvider>
          </SQLiteProvider>

          <PortalHost />

          <Toaster position="bottom-center" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};

export default Sentry.wrap(RootLayout);
