import ScreenHeader from "@/components/screen-header";
import { Stack } from "expo-router";
import React from "react";

const SettingsLayout = () => {
  return (
    <Stack
      screenOptions={{
        header: ({ options }) => (
          <ScreenHeader title={options.title ?? ""} backButtonVisible />
        ),

        animation: "ios_from_right",
        contentStyle: { backgroundColor: "#000" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Settings" }} />
      <Stack.Screen name="backups" options={{ title: "Backups" }} />
      <Stack.Screen name="target-hour" options={{ title: "Target and Hour" }} />
      <Stack.Screen name="import-data" options={{ title: "Import Data" }} />
      <Stack.Screen name="export-data" options={{ title: "Export Data" }} />
      <Stack.Screen
        name="manage-google-account"
        options={{ title: "Manage Account" }}
      />
    </Stack>
  );
};

export default SettingsLayout;
