import { ensureBackupDir } from "@/app/storage/backup";
import LoadingScreen from "@/components/loading-screen";
import { createDrizzleDb } from "@/db/client";
import migrations from "@/drizzle/migrations";
import "@/global.css";
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

const DATABASE_NAME = "worklog.db";

const Layout = () => {
  const db = useSQLiteContext();
  useDrizzleStudio(db);

  useEffect(() => {
    ensureBackupDir();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="work-log" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  // Open SQLite DB
  const sqliteDb = openDatabaseSync(DATABASE_NAME, { useNewConnection: true }); // remove useNewConnection in production

  // Create Drizzle instance
  const db = createDrizzleDb(sqliteDb);

  // Run migrations
  const { success, error } = useMigrations(db, migrations);

  return (
    <>
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <KeyboardProvider>
            <Suspense fallback={<LoadingScreen />}>
              <SQLiteProvider
                useSuspense
                databaseName={DATABASE_NAME}
                options={{ enableChangeListener: true }}
              >
                <Layout />
              </SQLiteProvider>
            </Suspense>
            <PortalHost />
            <Toaster position="top-center" />
          </KeyboardProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </>
  );
}
