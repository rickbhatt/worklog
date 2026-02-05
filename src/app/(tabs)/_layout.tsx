import DynamicIcon from "@/components/dynamic-icon";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { Tabs, useRouter } from "expo-router";
import { GestureResponderEvent, Pressable, Text, View } from "react-native";
import { TabBarIconProps } from "type";

const ICON_SIZE = 24;
const ICON_COLOR = "#FFFFFF";

const ACTIVE_COLOR = "#F36040";

const TabIconAndLabel = ({ focused, icon, title }: TabBarIconProps) => (
  <View className="tab-btn">
    {icon}
    <Text
      className={cn(
        "text-xs",
        focused
          ? "font-bold text-tab-acitve-tint"
          : "font-normal text-text-primary",
      )}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: 110,
          backgroundColor: "#242424",
          borderColor: "#242424",
        },

        tabBarButton: ({ children, onPress }) => (
          <Pressable
            onPress={(event: GestureResponderEvent) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPress?.(event);
            }}
            className="flex-1 items-center justify-center"
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
          tabPress: (e) => {
            e.preventDefault();
            router.push("/work-log/create");
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
  );
};

export default TabsLayout;
