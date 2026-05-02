import LoadingScreen from "@/components/loading-screen";
import { DB_NAME } from "@/constants";
import { AuthProvider } from "@/contexts/AuthContext";
import { initDb } from "@/db/client";
import migrations from "@/drizzle/migrations";
import "@/global.css";
import { ensureBackupDir, syncPendingRestoreState } from "@/lib/storage/backup";
import { configureGoogleSignIn } from "@/services/googleAuthService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import { SQLiteProvider, useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

configureGoogleSignIn();

const Layout = () => {
  const sqliteDb = useSQLiteContext();

  // Initialize the singleton with SQLiteProvider's connection
  const db = initDb(sqliteDb);

  // Run migrations using the same connection
  const { success } = useMigrations(db, migrations);

  useDrizzleStudio(sqliteDb);

  useEffect(() => {
    if (!success) return;

    const sync = async () => {
      await syncPendingRestoreState(db);
    };

    sync();
    ensureBackupDir();
  }, [success]);

  if (!success) return <LoadingScreen />;

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
    <>
      <KeyboardProvider>
        <GestureHandlerRootView>
          <BottomSheetModalProvider>
            <Suspense fallback={<LoadingScreen />}>
              <SQLiteProvider
                useSuspense
                databaseName={DB_NAME}
                options={{ enableChangeListener: true }}
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
    </>
  );
}
