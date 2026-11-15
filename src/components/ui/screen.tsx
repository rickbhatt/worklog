import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const GLOW_HEIGHT = 420;

/**
 * Soft radial glow fading out from the top-left corner
 * (≈ CSS `radial-gradient(700px 460px at 10% -80px, glow, transparent 70%)`).
 */
export const ScreenGlow = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={styles.glow}>
      <Svg width={width} height={GLOW_HEIGHT}>
        <Defs>
          <RadialGradient
            id="screen-glow"
            cx={width * 0.1}
            cy={-80}
            rx={700}
            ry={460}
            fx={width * 0.1}
            fy={-80}
            gradientUnits="userSpaceOnUse"
          >
            <Stop
              offset="0"
              stopColor={colors.glow.color}
              stopOpacity={colors.glow.opacity}
            />
            <Stop offset="0.7" stopColor={colors.glow.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={width} height={GLOW_HEIGHT} fill="url(#screen-glow)" />
      </Svg>
    </View>
  );
};

/**
 * Screen shell: `bg` + top-left glow, top safe-area padding and an optional
 * header above the content.
 */
export const Screen = ({
  children,
  header,
  className,
  safeTop = true,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  safeTop?: boolean;
}) => {
  const { top } = useSafeAreaInsets();

  return (
    <View className={cn("flex-1 bg-background", className)}>
      <ScreenGlow />
      <View className="flex-1" style={{ paddingTop: safeTop ? top : 0 }}>
        {header}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: GLOW_HEIGHT,
  },
});
