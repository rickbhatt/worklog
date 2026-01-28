import DynamicIcon from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { ScreenHeaderProps } from "type";

const ScreenHeader = ({
  title,
  backButtonVisible = false,
  rightButtons = [],
}: ScreenHeaderProps) => {
  const router = useRouter();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    router.back();
  };

  return (
    <View className="screen-header flex-row flex-between bg-bg-primary">
      <View className="flex-row items-center gap-x-4">
        {backButtonVisible && (
          <Pressable
            onPress={handleBackPress}
            className="btn-touch-scale flex-row items-center justify-center rounded-full h-14 w-14 bg-dark-200"
          >
            <DynamicIcon
              family="Ionicons"
              name="chevron-back"
              color="#FFFFFF"
            />
          </Pressable>
        )}
        <Text className="screen-title text-text-primary">{title}</Text>
      </View>
      <View className="flex flex-row items-center justify-end gap-x-2">
        {rightButtons.map((button) => (
          <Button
            variant={"outline"}
            className="h-12 w-12 rounded-full bg-dark-200"
            key={button.name}
            onPress={() => button.onPress()}
          >
            {button.icon}
          </Button>
        ))}
      </View>
    </View>
  );
};

export default ScreenHeader;
