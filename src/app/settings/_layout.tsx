import { Stack } from "expo-router";
import React from "react";

const SettingsLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "ios_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="backups" />
      <Stack.Screen name="target-hour" />
      <Stack.Screen name="load-data" />
    </Stack>
  );
};

export default SettingsLayout;
