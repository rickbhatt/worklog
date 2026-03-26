import DynamicIcon from "@/components/dynamic-icon";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { DynamicIconProps } from "type";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SettingBtns: ReadonlyArray<{
  title: string;
  path: "/settings/backups" | "/settings/target-hour";
  icon: DynamicIconProps;
}> = [
  {
    title: "Backups",
    path: "/settings/backups",
    icon: {
      family: "MaterialIcons",
      name: "backup",
    },
  },
  {
    title: "Target and Hour",
    path: "/settings/target-hour",
    icon: {
      family: "Feather",
      name: "target",
    },
  },
];

const Settings = () => {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Settings" backButtonVisible />,
        }}
      />
      <View className="screen-x-padding pt-2 flex-1 bg-bg-primary">
        {SettingBtns.map((btn) => (
          <Button
            onPress={() => router.push(btn.path)}
            className="py-4"
            variant={"ghost"}
            key={btn.title}
          >
            <View className="flex-between flex-row flex-1">
              <View className="flex-row items-center gap-x-2.5">
                <DynamicIcon
                  {...btn.icon}
                  size={24}
                  color="#FFFFFF"
                />

                <Text className="text-text-primary font-bold text-base">
                  {btn.title}
                </Text>
              </View>
              <DynamicIcon
                family="Entypo"
                name="chevron-right"
                size={24}
                color="#FFFFFF"
              />
            </View>
          </Button>
        ))}
      </View>
    </>
  );
};

export default Settings;
