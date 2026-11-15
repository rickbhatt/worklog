import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable";
import { cn } from "@/lib/utils";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import React from "react";
import { Text } from "react-native";

/** Multi-select chip, 44px tall and fully rounded. */
export const ToggleChip = ({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) => (
  <PressableScale
    onPress={() => {
      Haptics.selectionAsync();
      onToggle();
    }}
    accessibilityRole="checkbox"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={label}
    className={cn(
      "h-11 flex-row items-center gap-1.5 rounded-full border px-4",
      selected ? "border-accent bg-accent-soft" : "border-line bg-surface",
    )}
  >
    {selected && (
      <Icon as={Check} size={16} strokeWidth={2.4} className="text-accent" />
    )}
    <Text
      numberOfLines={1}
      textBreakStrategy="simple"
      className={cn(
        "text-sm",
        selected
          ? "font-inter-semibold text-accent"
          : "font-inter-medium text-foreground",
      )}
    >
      {label}
    </Text>
  </PressableScale>
);
