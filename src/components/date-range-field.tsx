import { Icon } from "@/components/ui/icon";
import { PressableScale } from "@/components/ui/pressable";
import { cn, formatDateTime } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ArrowRight, Calendar } from "lucide-react-native";
import React, { useState } from "react";
import { Text, View } from "react-native";

type Field = "start" | "end";

/**
 * One combined date range field: [calendar] From → To. Each half opens the
 * native date picker; values are ISO (yyyy-MM-dd) strings.
 */
const DateRangeField = ({
  label,
  start,
  end,
  maxDate,
  onChange,
}: {
  label?: string;
  start: string | undefined;
  end: string | undefined;
  maxDate?: Date;
  onChange: (field: Field, value: string) => void;
}) => {
  const { shadows } = useTheme();
  const [openField, setOpenField] = useState<Field | null>(null);

  const Half = ({ field, value }: { field: Field; value?: string }) => (
    <PressableScale
      onPress={() => setOpenField(field)}
      accessibilityRole="button"
      accessibilityLabel={`${field === "start" ? "From" : "To"} date, ${value ?? "not set"}`}
      className="h-full flex-1 items-center justify-center"
    >
      {/* centred block, so the arrow sits evenly between From and To */}
      <View className="gap-0.5">
        <Text className="font-inter text-[11px] text-muted">
          {field === "start" ? "From" : "To"}
        </Text>
        <Text
          numberOfLines={1}
          className={cn(
            "font-inter-semibold text-[15px]",
            value ? "text-foreground" : "text-muted",
          )}
        >
          {value ? formatDateTime(value).shortDateWithYear : "Select date"}
        </Text>
      </View>
    </PressableScale>
  );

  const current = openField === "start" ? start : end;

  return (
    <View className="form-group">
      {label ? <Text className="form-label">{label}</Text> : null}
      <View
        className="h-[60px] flex-row items-center gap-3 rounded-[14px] border border-line bg-surface px-4"
        style={{ boxShadow: shadows.card }}
      >
        <Icon as={Calendar} size={18} strokeWidth={1.8} className="text-accent" />
        <Half field="start" value={start} />
        <Icon as={ArrowRight} size={16} strokeWidth={2} className="text-muted" />
        <Half field="end" value={end} />
      </View>

      {openField && (
        <DateTimePicker
          value={current ? new Date(current) : new Date()}
          mode="date"
          display="calendar"
          maximumDate={maxDate}
          onChange={(event, selectedDate) => {
            const field = openField;
            setOpenField(null);
            // Android passes the initial date on cancel too; only "set" is a pick.
            if (event.type === "set" && selectedDate) {
              onChange(field, formatDateTime(selectedDate).dateToISOString);
            }
          }}
        />
      )}
    </View>
  );
};

export default DateRangeField;
