import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable";
import { useTheme } from "@/theme/theme-provider";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { ScreenHeaderProps } from "type";

/**
 * Pushed-screen header: 44×44 rounded back button (surface + border), then the
 * title, vertically centred, and an optional element on the right.
 */
const ScreenHeader = ({
  title,
  backButtonVisible = false,
  right,
}: ScreenHeaderProps) => {
  const router = useRouter();
  const { shadows } = useTheme();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View className="flex-row items-center gap-3.5 px-5 pb-3 pt-4">
      {backButtonVisible && (
        <PressableScale
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-11 w-11 items-center justify-center rounded-[14px] border border-line bg-surface"
          style={{ boxShadow: shadows.card }}
        >
          <Icon
            as={ChevronLeft}
            size={20}
            strokeWidth={2}
            className="text-foreground"
          />
        </PressableScale>
      )}
      <Text
        numberOfLines={1}
        accessibilityRole="header"
        className="title-pushed min-w-0 flex-1"
      >
        {title}
      </Text>
      {right}
    </View>
  );
};

/** Tab-screen title: 32px title with an optional element aligned to it. */
export const TabTitle = ({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) => (
  <View className="flex-row items-center justify-between pt-3">
    <Text accessibilityRole="header" className="title-tab">
      {title}
    </Text>
    {right}
  </View>
);

export default ScreenHeader;
