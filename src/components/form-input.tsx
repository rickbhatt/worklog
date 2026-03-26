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
import { cn, convertTimeTakenToHoursMins, formatDateTime } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { TriggerRef } from "@rn-primitives/select";
import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FieldName, InputModeOptions } from "type";

interface FormInputProps {
  label?: string;
  name: FieldName;
  value?: string | null | number | undefined;
  onChange: (field: FieldName, rawValue: string | number) => void;
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
  inputClassname?: string;
  rowMode?: boolean;
  selectOptions?: { label: string; value: string }[];
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const FormInput = ({
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
  inputClassname,
  rowMode = false,
  onBlur,
  onFocus,
}: FormInputProps) => {
  const [isDatePicketOpen, setIsDatePickerOpen] = useState(false);
  const numericFields: FieldName[] = ["articleId", "lepPages", "timeTaken"];
  const [isChecked, setIsChecked] = useState(false);

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

  const handleOnChangeTextInput = (field: FieldName, rawValue: string) => {
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
          <Text className="form-label">
            {label}{" "}
            {timePreview &&
              `${value ? "| " + convertTimeTakenToHoursMins(Number(value)) : ""}`}
          </Text>
          <Input
            onChangeText={(text) => handleOnChangeTextInput(name, text)}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            maxLength={maxLength}
            editable={editable}
            placeholder={placeholder}
            value={value?.toString()}
            onFocus={onFocus}
            onBlur={onBlur}
            className={cn(
              "h-12 text-base py-0 bg-bg-primary",
              rowMode ? "flex-1 w-full" : "w-full",
              inputClassname, // Override if passed
            )}
          />
        </View>
      );
    case "date":
      return (
        <>
          <View className={cn("form-group", rowMode && "flex-1")}>
            <Text className="form-label">{label}</Text>
            <Pressable
              onPress={() => setIsDatePickerOpen(true)}
              className={cn(
                "bg-bg-primary border-input h-12 flex flex-row items-center border px-3 py-1 text-base leading-5 sm:h-9 rounded-md",
                rowMode ? "flex-1 w-full" : "w-full",
                "h-12 text-base py-0",
              )}
            >
              <Text
                className={cn(
                  "text-base text-left",
                  value ? "text-text-primary" : "text-text-primary/60",
                )}
              >
                {value ?? placeholder}
              </Text>
            </Pressable>
          </View>

          {isDatePicketOpen && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display="calendar"
              maximumDate={maxDate}
              minimumDate={minDate}
              onChange={(_, selectedDate) => {
                if (selectedDate) {
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
              className="text-base text-text-primary font-semibold"
            >
              {label}
            </Label>
          </View>
        </View>
      );

    case "textarea":
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          <Text className="form-label">{label}</Text>
          <Textarea
            value={value}
            placeholder={placeholder}
            className="bg-bg-primary"
            onChangeText={(text) => handleOnChangeTextInput(name, text)}
          />
        </View>
      );

    case "select":
      const valueStr = value?.toString() || "";
      const selectedOption = React.useMemo(
        () => selectOptions.find((opt) => opt.value.toString() === valueStr),
        [valueStr, selectOptions],
      );
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          <Select
            onValueChange={(selectedValue) =>
              onChange(name, selectedValue?.value ? selectedValue.value : "")
            }
            value={selectedOption}
          >
            <SelectTrigger onTouchStart={onTouchStart}>
              <SelectValue placeholder={placeholder} />
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
};

export default FormInput;
