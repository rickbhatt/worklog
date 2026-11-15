import { Icon } from "@/components/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { MONTHS } from "@/constants";
import { useTheme } from "@/theme/theme-provider";
import { Calendar } from "lucide-react-native";
import React from "react";
import { Platform, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Month selector pill ("Nov 2026" with a calendar icon and chevron). Opens the
 * existing month picker (a select of the current year's months).
 */
const MonthPill = ({
  month,
  year = new Date().getFullYear(),
  onChange,
}: {
  /** 1-based month as a string ("1".."12"), like the MONTHS constant. */
  month: string | undefined;
  year?: number;
  onChange: (month: string) => void;
}) => {
  const { shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const selected = MONTHS.find((m) => m.value === month);
  const shortLabel = selected ? `${selected.label.slice(0, 3)} ${year}` : "Month";

  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 20,
    right: 20,
  };

  return (
    <Select
      value={selected ? { value: selected.value, label: selected.label } : undefined}
      onValueChange={(option) => option?.value && onChange(option.value)}
    >
      <SelectTrigger
        accessibilityLabel={`Choose month, ${selected?.label ?? ""} ${year} selected`}
        className="h-11 gap-2 px-3.5"
        style={{ boxShadow: shadows.card }}
      >
        <Icon
          as={Calendar}
          size={16}
          strokeWidth={1.8}
          className="text-accent"
        />
        <Text
          numberOfLines={1}
          textBreakStrategy="simple"
          className="font-inter-semibold text-sm text-foreground"
        >
          {shortLabel}
        </Text>
      </SelectTrigger>
      <SelectContent insets={contentInsets} align="end" className="w-44">
        {MONTHS.map((opt) => (
          <SelectItem key={opt.value} label={opt.label} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default MonthPill;
