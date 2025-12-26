import { createDrizzleDb } from "@/db/client";
import migrations from "@/drizzle/migrations";
import "@/global.css";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack } from "expo-router";
import {
  SQLiteProvider,
  openDatabaseSync,
  useSQLiteContext,
} from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

const DATABASE_NAME = "worklog.db";

const Layout = () => {
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default function RootLayout() {
  // Open SQLite DB
  const sqliteDb = openDatabaseSync(DATABASE_NAME);

  // Create Drizzle instance
  const db = createDrizzleDb(sqliteDb);

  // Run migrations
  const { success, error } = useMigrations(db, migrations);
  console.log("🚀 ~ RootLayout ~ error:", error);
  console.log("🚀 ~ RootLayout ~ success:", success);
  return (
    <KeyboardProvider>
      <GestureHandlerRootView>
        <Suspense fallback={<ActivityIndicator />}>
          <SQLiteProvider
            useSuspense
            databaseName={DATABASE_NAME}
            options={{ enableChangeListener: true }}
          >
            <Layout />
          </SQLiteProvider>
        </Suspense>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}
