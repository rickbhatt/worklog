import { useTheme } from "@/theme/theme-provider";
import { Stack } from "expo-router";
import React from "react";

const WorkLogLayout = () => {
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
      <Stack.Screen name="create" options={{ title: "Create Log" }} />
      <Stack.Screen name="edit/[id]" options={{ title: "Edit Log" }} />
    </Stack>
  );
};

export default WorkLogLayout;
