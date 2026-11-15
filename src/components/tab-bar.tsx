import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable";
import { useTheme } from "@/theme/theme-provider";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import {
  ChartColumn,
  History,
  Plus,
  Settings,
  type LucideIcon,
} from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS: Record<string, { label: string; icon: LucideIcon; iconSize?: number }> = {
  index: { label: "History", icon: History },
  "dummy-create-work-log": { label: "New log", icon: Plus, iconSize: 22 },
  insights: { label: "Insights", icon: ChartColumn },
  "dummy-settings": { label: "Settings", icon: Settings },
};

/** Space content should leave at the bottom so the floating bar doesn't cover it. */
export const TAB_BAR_HEIGHT = 68;
export const useTabBarClearance = () => {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(bottom, 24) + 24;
};

/**
 * Floating pill tab bar: 20px from the sides, 24px above the bottom (or the
 * safe area). The active tab shows icon + label in an accent-soft pill; the
 * others are muted icons. "+" opens a separate screen, so it never shows the
 * active state.
 */
const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { shadows } = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      className="absolute left-5 right-5 h-[68px] flex-row items-center justify-between rounded-[24px] border border-line bg-nav px-2.5"
      style={{ bottom: Math.max(bottom, 24), boxShadow: shadows.nav }}
    >
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;

        const { options } = descriptors[route.key];
        const focused = state.index === index;

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <PressableScale
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
            testID={options.tabBarButtonTestID}
            className={
              focused
                ? "h-12 flex-row items-center gap-2 rounded-2xl bg-accent-soft px-4"
                : "h-12 w-12 items-center justify-center rounded-2xl"
            }
          >
            <Icon
              as={config.icon}
              size={config.iconSize ?? 20}
              strokeWidth={config.iconSize ? 2.2 : 1.8}
              className={focused ? "text-accent" : "text-muted"}
            />
            {focused && (
              <Text
                numberOfLines={1}
                textBreakStrategy="simple"
                className="font-inter-semibold text-sm text-accent"
              >
                {config.label}
              </Text>
            )}
          </PressableScale>
        );
      })}
    </View>
  );
};

export default TabBar;
