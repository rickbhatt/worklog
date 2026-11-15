import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

export type TileTone = "accent" | "success" | "warning" | "raised";

const TILE_TONES: Record<TileTone, { bg: string; icon: string }> = {
  accent: { bg: "bg-accent-soft", icon: "text-accent" },
  success: { bg: "bg-success-soft", icon: "text-success" },
  warning: { bg: "bg-warning-soft", icon: "text-warning" },
  raised: { bg: "bg-raised", icon: "text-muted" },
};

/** Rounded square holding an icon (rows, cards). */
export const IconTile = ({
  icon,
  tone = "raised",
  size = 40,
  iconSize = 18,
  className,
}: {
  icon: LucideIcon;
  tone?: TileTone;
  size?: number;
  iconSize?: number;
  className?: string;
}) => (
  <View
    className={cn(
      "items-center justify-center rounded-xl",
      TILE_TONES[tone].bg,
      className,
    )}
    style={{ width: size, height: size }}
  >
    <Icon
      as={icon}
      size={iconSize}
      strokeWidth={1.8}
      className={TILE_TONES[tone].icon}
    />
  </View>
);

/** Small muted caption above a group ("Goals", "Data", …). */
export const SectionCaption = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Text
    className={cn(
      "px-1 font-inter-semibold text-xs uppercase tracking-[0.6px] text-muted",
      className,
    )}
  >
    {children}
  </Text>
);

/** One card holding rows separated by 1px dividers. */
export const ListGroup = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <Card className={cn("overflow-hidden rounded-[18px]", className)}>
      {rows.map((row, index) => (
        <View key={index} className={cn(index > 0 && "border-t border-line")}>
          {row}
        </View>
      ))}
    </Card>
  );
};

/** Row with icon tile, title, subtitle and chevron. */
export const ListRow = ({
  icon,
  tone = "accent",
  title,
  subtitle,
  onPress,
  right,
}: {
  icon: LucideIcon;
  tone?: TileTone;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) => (
  <PressableScale
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    }}
    accessibilityRole="button"
    accessibilityLabel={title}
    className="min-h-[68px] flex-row items-center gap-3 px-3.5 py-3"
  >
    <IconTile icon={icon} tone={tone} />
    <View className="min-w-0 flex-1 gap-0.5">
      <Text className="font-inter-semibold text-[15px] text-foreground">
        {title}
      </Text>
      {subtitle ? (
        <Text numberOfLines={1} className="font-inter text-[13px] text-muted">
          {subtitle}
        </Text>
      ) : null}
    </View>
    {right ?? (
      <Icon as={ChevronRight} size={16} strokeWidth={2} className="text-muted" />
    )}
  </PressableScale>
);
