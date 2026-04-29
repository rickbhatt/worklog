import LoadingScreen from "@/components/loading-screen";
import { DB_NAME } from "@/constants";
import { AuthProvider } from "@/contexts/AuthContext";
import { getDb } from "@/db/client";
import migrations from "@/drizzle/migrations";
import "@/global.css";
import { ensureBackupDir } from "@/lib/storage/backup";
import { configureGoogleSignIn } from "@/services/googleAuthService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import {
  SQLiteProvider,
  openDatabaseSync,
  useSQLiteContext,
} from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

configureGoogleSignIn();

const Layout = () => {
  const db = useSQLiteContext();
  useDrizzleStudio(db);

  useEffect(() => {
    ensureBackupDir();
  }, []);

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
  // Open SQLite DB
  const sqliteDb = openDatabaseSync(DB_NAME, { useNewConnection: true }); // remove useNewConnection in production

  // Create Drizzle instance
  const db = getDb();

  // Run migrations
  const { success, error } = useMigrations(db, migrations);

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
            <Toaster position="top-center" />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </>
  );
}
