import DynamicIcon from "@/components/dynamic-icon";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const Backups = () => {
  const { isSignedIn, signIn, signOut } = useAuth();
  console.log("🚀 ~ Backups ~ isSignedIn:", isSignedIn);
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Backups" backButtonVisible />,
        }}
      />
      <View className="screen flex-col pb-safe">
        {isSignedIn ? (
          <Text className="text-white">Signed In</Text>
        ) : (
          <View className="flex-col flex-1 items-center justify-center gap-4">
            <Text className="base-bold text-center text-text-primary">
              Please add google drive account for backup
            </Text>
            <Button
              className="flex-row items-center py-3 px-4"
              onPress={signIn}
            >
              <DynamicIcon name="google" family="AntDesign" color="#FFFFFF" />
              <Text className="btn-label">Sign in with Google</Text>
            </Button>
          </View>
        )}
      </View>
    </>
  );
};

export default Backups;
