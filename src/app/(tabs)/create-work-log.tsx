import ScreenHeader from "@/components/screen-header";
import { Tabs } from "expo-router";
import React from "react";

const CreateWorkLog = () => {
  return (
    <Tabs.Screen
      options={{
        header: () => <ScreenHeader title="Create Log" />,
        headerShown: true,
      }}
    />
  );
};

export default CreateWorkLog;
