import ScreenHeader from "@/components/screen-header";
import { Stack } from "expo-router";
import React from "react";

const WorkLogLayout = () => {
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
      <Stack.Screen name="create" options={{ title: "Create Log" }} />
      <Stack.Screen name="edit/[id]" options={{ title: "Edit Log" }} />
    </Stack>
  );
};

export default WorkLogLayout;
