import React from "react";
import { Text, View } from "react-native";

interface ScreenHeaderProps {
  title: string;
}

const ScreenHeader = ({ title }: ScreenHeaderProps) => {
  return (
    <View className="screen-header bg-bg-primary">
      <Text className="screen-title text-text-primary">{title}</Text>
    </View>
  );
};

export default ScreenHeader;
