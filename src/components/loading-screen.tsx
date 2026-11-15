import { useTheme } from "@/theme/theme-provider";
import React from "react";
import { ActivityIndicator, View } from "react-native";

const LoadingScreen = () => {
  const { colors } = useTheme();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

export default LoadingScreen;
