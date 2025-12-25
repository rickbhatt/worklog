import { Tabs } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const CreateWorkLog = () => {
  return (
    <Tabs.Screen
      options={{
        header: () => (
          <View>
            <Text>Create Work Log</Text>
          </View>
        ),
        headerShown: true,
      }}
    />
  );
};

export default CreateWorkLog;
