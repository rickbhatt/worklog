import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { InputModeOptions } from "type";

interface FormInputProps {
  label: string;
  name: string;
  value: string | null | number | undefined;
  onChange: (field: string | number, value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoFocus?: boolean;
  autoCorrect?: boolean;
  returnKeyType?: "done" | "go" | "next" | "search" | "send";
  inputMode?: InputModeOptions | undefined;
  maxLength?: number;
  inputType?: "text" | "date";
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
  maxLength,
  inputType = "text",
}: FormInputProps) => {
  const [isDatePicketOpen, setIsDatePickerOpen] = useState(false);

  switch (inputType) {
    case "text":
      return (
        <View className="form-group">
          <Text className="form-label">{label}</Text>
          <Input
            onChangeText={(text) => onChange(name, text)}
            inputMode={inputMode}
            autoCapitalize={autoCapitalize}
            autoFocus={autoFocus}
            placeholder={placeholder}
            value={value}
            className="h-12 text-base"
          />
        </View>
      );
    case "date":
      return (
        <View className="form-group">
          <Text className="form-label">{label}</Text>
          <Pressable className="bg-bg-primary border-input h-12 flex w-full min-w flex-row items-center border px-3 py-1 text-base leading-5 sm:h-9 rounded-md">
            <Text
              className={cn(
                "text-base text-left",
                value ? "text-text-primary" : "text-text-primary/60"
              )}
            >
              {value ?? placeholder}
            </Text>
          </Pressable>
        </View>
      );
  }
};

export default FormInput;
