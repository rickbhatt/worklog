import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";

type CardProps = ViewProps & { className?: string };

/** Surface card: 1px line border, 20px radius, soft shadow. */
export const Card = ({ className, style, ...props }: CardProps) => {
  const { shadows } = useTheme();
  return (
    <View
      className={cn("rounded-[20px] border border-line bg-surface", className)}
      style={[{ boxShadow: shadows.card }, style]}
      {...props}
    />
  );
};

/** Gradient hero card (24px radius, coloured shadow). Text on it is white. */
export const HeroCard = ({ className, style, children, ...props }: CardProps) => {
  const { gradient, shadows } = useTheme();
  return (
    <View
      className={cn("rounded-[24px] p-[22px]", className)}
      style={[{ boxShadow: shadows.glow }, style]}
      {...props}
    >
      <LinearGradient
        pointerEvents="none"
        colors={gradient.colors}
        start={gradient.start}
        end={gradient.end}
        style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
      />
      {children}
    </View>
  );
};
