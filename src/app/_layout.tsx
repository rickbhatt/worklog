import LoadingScreen from "@/components/loading-screen";
import { DB_NAME } from "@/constants";
import { AuthProvider } from "@/contexts/AuthContext";
import { initialiseDb } from "@/db/client";
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
import { Suspense, useEffect } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

configureGoogleSignIn();

const Layout = () => {
  const db = useDb(); // Drizzle Db
  useDrizzleStudioDev();

  // Startup tasks
  useEffect(() => {
    const sync = async () => {
      try {
        ensureBackupDir();

        setupNotifications();

        // Sync any pending restore metadata into the DB
        await syncPendingRestoreState(db);

        // Kick off auto-backup if needed (non-blocking)
        checkAndAutoBackup(db);
      } catch (error) {
        console.error("🚀 Startup tasks failed:", error);
      }
    };

    sync();
  }, [db]);

  // On foreground: fire-and-forget auto-backup check
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      checkAndAutoBackup(db);
    });

    return () => subscription.remove();
  }, [db]);
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
