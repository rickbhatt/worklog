import LoadingScreen from "@/components/loading-screen";
import { DB_NAME } from "@/constants";
import { AuthProvider } from "@/contexts/AuthContext";
import { initialiseDb } from "@/db/client";
import "@/global.css";
import { useDrizzleStudioDev } from "@/hooks/useDrizzleStudioDev";
import { configureGoogleSignIn } from "@/services/googleAuthService";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { Suspense } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Toaster } from "sonner-native";

configureGoogleSignIn();

const Layout = () => {
  useDrizzleStudioDev();
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
              onInit={async (sqlite) => {
                await initialiseDb(sqlite);
              }}
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
