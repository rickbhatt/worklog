import { PressableScale } from "@/components/ui/pressable";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Option<T extends string> = { label: string; value: T };

/**
 * Two-option switch in a surface container (4px padding). The selected option
 * is filled with the gradient and white text.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly Option<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  className?: string;
}) {
  const { gradient, shadows } = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      className={cn(
        "flex-row gap-1 rounded-2xl border border-line bg-surface p-1",
        className,
      )}
      style={{ boxShadow: shadows.card }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync();
              onChange(option.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className="h-11 flex-1 items-center justify-center rounded-xl"
          >
            {selected && (
              // The shadow lives on a plain rounded View: on the pressable
              // itself Android draws it with square corners.
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { borderRadius: 12, boxShadow: shadows.glow },
                ]}
              >
                <LinearGradient
                  colors={gradient.colors}
                  start={gradient.start}
                  end={gradient.end}
                  style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                />
              </View>
            )}
            <Text
              numberOfLines={1}
              textBreakStrategy="simple"
              className={cn(
                "font-inter-semibold text-sm",
                selected ? "text-on-accent" : "text-muted",
              )}
            >
              {option.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
