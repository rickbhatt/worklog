import ScreenHeader from "@/components/screen-header";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

const CreateWorkLog = () => {
  return (
    <>
      <Tabs.Screen
        options={{
          header: () => <ScreenHeader title="Create Log" />,
          headerShown: true,
        }}
      />
      <View className="screen-x-padding pt-2 flex-1 bg-bg-primary"></View>
    </>
  );
};
export default CreateWorkLog;
