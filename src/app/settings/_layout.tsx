import { useTheme } from "@/theme/theme-provider";
import { Stack } from "expo-router";
import React from "react";

const SettingsLayout = () => {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        // Screens render their own header (ScreenHeader) over the glow.
        headerShown: false,

        animation: "ios_from_right",
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="backups" options={{ title: "Backups" }} />
      <Stack.Screen name="target-hour" options={{ title: "Target and Hour" }} />
      <Stack.Screen name="import-data" options={{ title: "Import Data" }} />
      <Stack.Screen name="export-data" options={{ title: "Export Data" }} />
      <Stack.Screen name="manage-jid" options={{ title: "Manage JID" }} />
      <Stack.Screen
        name="manage-google-account"
        options={{ title: "Manage Account" }}
      />
    </Stack>
  );
};

export default SettingsLayout;
