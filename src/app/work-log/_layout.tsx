import { Stack } from "expo-router";
import React from "react";

const WorkLogLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="create" options={{ headerShown: false }} />
      <Stack.Screen name="edit" options={{ headerShown: false }} />
    </Stack>
  );
};

export default WorkLogLayout;
