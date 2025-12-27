import React from "react";
import { ActivityIndicator, View } from "react-native";

const LoadingScreen = () => {
  return (
    <View className="flex-1 items-center justify-center bg-bg-primary">
      <ActivityIndicator size="large" color="#FFFFFF" />
    </View>
  );
};

export default LoadingScreen;
