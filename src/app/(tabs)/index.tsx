import ScreenHeader from "@/components/screen-header";
import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const History = () => {
  return (
    <>
      <Tabs.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="History" />,
        }}
      />
      <View className="flex-1 bg-bg-primary">
        <Text className="text-text-primary">This is the history body</Text>
      </View>
    </>
  );
};

export default History;
