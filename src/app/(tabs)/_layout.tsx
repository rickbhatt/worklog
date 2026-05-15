import AlertDialogBox from "@/components/alert-dialogbox";
import DynamicIcon from "@/components/dynamic-icon";
import { checkTargetInfoExists } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { clsx } from "clsx";
import * as Haptics from "expo-haptics";
import { Tabs, useRouter } from "expo-router";
import { useState } from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBarIconProps } from "type";

const ICON_SIZE = 24;
const ICON_COLOR = "#FFFFFF";

const ACTIVE_COLOR = "#F36040";

const TabIconAndLabel = ({ focused, icon, title }: TabBarIconProps) => (
  <View className="tab-icon">
    <View className={clsx("tabs-pill", focused && "tabs-active")}>{icon}</View>
  </View>
);

const TabsLayout = () => {
  const [isTargetAlertOpen, setIsTargetAlertOpen] = useState<boolean>(false);

  const router = useRouter();

  const db = useDb();

  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            bottom: Math.max(insets.bottom, 20),
            height: 62,
            marginHorizontal: 20,
            borderRadius: 32,
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: "#242424",
          },
          tabBarItemStyle: {
            paddingVertical: 62 / 2 - 58 / 1.6,
          },
          tabBarIconStyle: {
            width: 58,
            height: 58,
            alignItems: "center",
          },

          tabBarButton: ({ children, onPress }) => (
            <Pressable
              onPress={(event: GestureResponderEvent) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.(event);
              }}
              className="flex-row items-center justify-center"
            >
              {children}
            </Pressable>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIconAndLabel
                focused={focused}
                title="History"
                icon={
                  <DynamicIcon
                    family="MaterialIcons"
                    name="history"
                    size={ICON_SIZE}
                    color={focused ? ACTIVE_COLOR : ICON_COLOR}
                  />
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dummy-create-work-log"
          listeners={() => ({
            tabPress: async (e) => {
              e.preventDefault();
              let latestTargetInfo = await checkTargetInfoExists(db);
              if (!latestTargetInfo) {
                setIsTargetAlertOpen(true);
              } else {
                router.push("/work-log/create");
              }
            },
          })}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIconAndLabel
                focused={focused}
                title="Add"
                icon={
                  <DynamicIcon
                    family="MaterialIcons"
                    name="add"
                    size={ICON_SIZE}
                    color={focused ? ACTIVE_COLOR : ICON_COLOR}
                  />
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            href: null,
            tabBarIcon: ({ focused }) => (
              <TabIconAndLabel
                focused={focused}
                title="Insights"
                icon={
                  <DynamicIcon
                    family="MaterialIcons"
                    name="insights"
                    size={ICON_SIZE}
                    color={focused ? ACTIVE_COLOR : ICON_COLOR}
                  />
                }
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dummy-settings"
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              router.push("/settings");
            },
          })}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIconAndLabel
                focused={focused}
                title="Settings"
                icon={
                  <DynamicIcon
                    family="Feather"
                    name="settings"
                    size={ICON_SIZE}
                    color={focused ? ACTIVE_COLOR : ICON_COLOR}
                  />
                }
              />
            ),
          }}
        />
      </Tabs>
      <AlertDialogBox
        open={isTargetAlertOpen}
        onOpenChange={setIsTargetAlertOpen}
        title="LEP target not set"
        description="You need to set a LEP target first"
        cancelText="Cancel"
        actionText="Okay"
        onAction={() => router.push("/settings/target-hour")}
      />
    </>
  );
};

export default TabsLayout;
