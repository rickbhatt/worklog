import { Input } from "@/components/ui/input";
import { cn, formatDateTime } from "@/lib/utils";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FieldName, InputModeOptions } from "type";

interface FormInputProps {
  label: string;
  name: FieldName;
  value: string | null | number | undefined;
  onChange: (field: FieldName, rawValue: string) => void;
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
  inputType?: "text" | "date";
  inputClassname?: string;
  rowMode?: boolean;
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
  name,
  maxDate = undefined,
  minDate = undefined,
  maxLength = undefined,
  inputType = "text",
  inputClassname,
  rowMode = false,
}: FormInputProps) => {
  const [isDatePicketOpen, setIsDatePickerOpen] = useState(false);
  const numericFields: FieldName[] = ["articleId", "lepPages", "timeTaken"];

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

  switch (inputType) {
    case "text":
      return (
        <View className={cn("form-group", rowMode && "flex-1")}>
          <Text className="form-label">{label}</Text>
          <Input
            onChangeText={(text) => handleOnChangeTextInput(name, text)}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            maxLength={maxLength}
            placeholder={placeholder}
            value={value?.toString()}
            className={cn(
              rowMode ? "flex-1 w-full" : "w-full",
              "h-12 text-base py-0",
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
              onChange={(event, selectedDate) => {
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
  }
};

export default FormInput;
