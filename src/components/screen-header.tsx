import React from "react";
import { Text, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
}

const ScreenHeader = ({ title }: ScreenHeaderProps) => {
  return (
    <View className="screen-header">
      <Text className="screen-title">{title}</Text>
    </View>
  );
};

export default ScreenHeader;
