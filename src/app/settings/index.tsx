import DynamicIcon from "@/components/dynamic-icon";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { useAppInfo } from "@/hooks/useAppInfo";
import { Href, Stack, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { DynamicIconProps } from "type";

const SettingBtns: ReadonlyArray<{
  title: string;
  path: Href;
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
  {
    title: "Import Data",
    path: "/settings/import-data",
    icon: {
      family: "MaterialCommunityIcons",
      name: "database-import",
    },
  },
  {
    title: "Export Data",
    path: "/settings/export-data",
    icon: {
      family: "MaterialCommunityIcons",
      name: "database-export",
    },
  },
  {
    title: "Manage Google Account",
    path: "/settings/manage-google-account",
    icon: {
      family: "MaterialCommunityIcons",
      name: "account",
    },
  },
];

const Settings = () => {
  const router = useRouter();

  const { appName, appVersion, currentYear } = useAppInfo();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Settings" backButtonVisible />,
        }}
      />
      <View className="pt-2 flex-1 flex-col bg-bg-primary pb-safe">
        <View className="screen-x-padding  flex-1 flex-col gap-1">
          {SettingBtns.map((btn) => (
            <Button
              onPress={() => router.push(btn.path)}
              className="py-4"
              variant={"ghost"}
              key={btn.title}
            >
              <View className="flex-between flex-row flex-1">
                <View className="flex-row items-center gap-x-2.5">
                  <DynamicIcon {...btn.icon} size={24} color="#FFFFFF" />

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

        <View className="flex-col justify-center h-10 gap-3 mb-3">
          <View className="bg-[#c3c3c3] h-[1px]" />

          <Text className="screen-x-padding text-sm text-text-secondary">
            © {currentYear} {appName} • v{appVersion}
          </Text>
        </View>
      </View>
    </>
  );
};

export default Settings;
