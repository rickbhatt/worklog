import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { PressableScale } from "@/components/ui/pressable";
import {
  cn,
  convertTimeTakenToHoursMins,
  formatDateTime,
  getCurrentDate,
} from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { Calendar } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { TriggerRef } from "@rn-primitives/select";
import React, { useState } from "react";
import { Platform, Text, TextInputProps, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FieldName, InputModeOptions } from "type";

interface FormInputProps<TExtraFields extends Record<string, unknown> = Record<never, never>> {
  label?: string;
  name: FieldName<TExtraFields>;
  value?: string | null | number | undefined;
  onChange: (field: FieldName<TExtraFields>, rawValue: string | number) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
  autoCorrect?: boolean;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  maxDate?: Date | undefined;
  minDate?: Date | undefined;
  inputMode?: InputModeOptions | undefined;
  maxLength?: number;
  timePreview?: boolean;
  inputType?: "text" | "date" | "checkbox" | "textarea" | "select";
  className?: string;
  rowMode?: boolean;
  selectOptions?: { label: string; value: string }[];
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  icon?: React.ReactNode;
  /** Muted unit inside the field ("pages", "min"). */
  suffix?: string;
  /** Element at the right edge inside the field (e.g. a QR button). */
  right?: React.ReactNode;
  /** Large Manrope number style. */
  numeric?: boolean;
  /** Swap the TextInput, e.g. BottomSheetTextInput inside a bottom sheet. */
  as?: React.ComponentType<TextInputProps>;
}

const FormInput = <TExtraFields extends Record<string, unknown> = Record<never, never>>({
  label,
  value,
  onChange,
  placeholder = "",
  secureTextEntry,
  autoCapitalize,
  autoCorrect,
  autoFocus = false,
  returnKeyType,
  inputMode,
  selectOptions = [{ label: "Option 1", value: "option1" }],
  name,
  maxDate = undefined,
  minDate = undefined,
  timePreview = false,
  maxLength = undefined,
  inputType = "text",
  editable = true,
  className,
  rowMode = false,
  icon,
  suffix,
  right,
  numeric,
  as,
  onBlur,
  onFocus,
}: FormInputProps<TExtraFields>) => {
  const { shadows } = useTheme();
  const [isDatePicketOpen, setIsDatePickerOpen] = useState(false);
  const numericFields = ["articleId", "lepPages", "timeTaken"];

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  const ref = React.useRef<TriggerRef>(null);

  function onTouchStart() {
    ref.current?.open();
  }

  const handleOnChangeTextInput = (
    field: FieldName<TExtraFields>,
    rawValue: string,
  ) => {
    let sanitizedValue = rawValue;

    if (numericFields.includes(field)) {
      sanitizedValue = rawValue.replace(/\D+/g, "");
    }

    if (field === "journalId") {
      sanitizedValue = sanitizedValue.toUpperCase();
    }

    onChange(name, sanitizedValue);
  };

  const boolToInt = (value: boolean) => (value ? 1 : 0);

  switch (inputType) {
    case "text":
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          {label ? (
            <Text className="form-label">
              {label}
              {timePreview && value ? (
                <Text className="font-inter text-muted">
                  {"  ·  " + convertTimeTakenToHoursMins(Number(value))}
                </Text>
              ) : null}
            </Text>
          ) : null}
          <Input
            onChangeText={(text) => handleOnChangeTextInput(name, text)}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            maxLength={maxLength}
            editable={editable}
            placeholder={placeholder}
            numberOfLines={1}
            multiline={false}
            value={value?.toString()}
            onFocus={onFocus}
            onBlur={onBlur}
            suffix={suffix}
            right={right}
            numeric={numeric}
            as={as}
            left={icon}
            containerClassName={className}
          />
        </View>
      );
    case "date":
      return (
        <>
          <View className={cn("form-group", rowMode && "flex-1")}>
            {label ? <Text className="form-label">{label}</Text> : null}
            <PressableScale
              onPress={() => setIsDatePickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`${label ?? "Date"}, ${value ?? "not set"}`}
              className={cn(
                "h-[52px] w-full flex-row items-center gap-2.5 rounded-[14px] border border-line bg-surface px-4",
                className,
              )}
              style={{ boxShadow: shadows.card }}
            >
              <Icon
                as={Calendar}
                size={18}
                strokeWidth={1.8}
                className="text-accent"
              />
              <Text
                numberOfLines={1}
                className={cn(
                  "flex-1 font-inter-medium text-base",
                  value ? "text-foreground" : "text-muted",
                )}
              >
                {value
                  ? formatDateTime(value.toString()).shortDateWithYear
                  : placeholder}
              </Text>
              {value === getCurrentDate() && <Pill tone="accent">Today</Pill>}
            </PressableScale>
          </View>

          {isDatePicketOpen && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display="calendar"
              maximumDate={maxDate}
              minimumDate={minDate}
              onChange={(event, selectedDate) => {
                // Android passes the initial date on cancel too; only "set" is a pick.
                if (event.type === "set" && selectedDate) {
                  let timestamp = formatDateTime(selectedDate).dateToISOString;

                  onChange(name, timestamp);
                }
                setIsDatePickerOpen(false);
              }}
            />
          )}
        </>
      );

    case "checkbox":
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          <View className="flex-row items-center gap-x-3.5">
            <Checkbox
              id={name}
              checked={value === 1}
              onCheckedChange={(checked) => onChange(name, boolToInt(checked))}
              className="w-5 h-5"
            />
            <Label
              onPress={Platform.select({
                native: () => onChange(name, value === 1 ? 0 : 1),
              })}
              htmlFor={name}
              className="font-inter-medium text-[15px] text-foreground"
            >
              {label}
            </Label>
          </View>
        </View>
      );

    case "textarea":
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          {label ? <Text className="form-label">{label}</Text> : null}
          <Textarea
            value={value?.toString()}
            placeholder={placeholder}
            numberOfLines={4}
            onChangeText={(text) => handleOnChangeTextInput(name, text)}
          />
        </View>
      );

    case "select": {
      const valueStr = value?.toString() || "";
      const selectedOption = selectOptions.find(
        (opt) => opt.value.toString() === valueStr,
      );
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          {label && <Text className="form-label">{label}</Text>}
          <Select
            onValueChange={(selectedValue) =>
              onChange(name, selectedValue?.value ? selectedValue.value : "")
            }
            value={selectedOption}
          >
            <SelectTrigger
              className={cn(className)}
              onTouchStart={onTouchStart}
            >
              <View
                className={cn(
                  "flex-row items-center",
                  className,
                  icon && "gap-3",
                )}
              >
                {icon}
                <SelectValue placeholder={placeholder} />
              </View>
            </SelectTrigger>
            <SelectContent insets={contentInsets}>
              {selectOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  label={opt.label}
                  value={opt.value.toString()}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </View>
      );
    }
  }
};

export default FormInput;
