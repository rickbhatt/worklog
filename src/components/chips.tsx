import React from "react";
import { Text, View } from "react-native";

const Chips = ({ label }: { label: string }) => {
  return (
    <View className="self-start rounded-sm px-2 py-1 bg-dark-300">
      <Text className="text-xs text-dark-100 font-bold">{label}</Text>
    </View>
  );
};

export default Chips;
