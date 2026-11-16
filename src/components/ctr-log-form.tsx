import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { getCurrentDate } from "@/lib/utils";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CtrLogFormProps {
  workedAt: string | undefined;
  onChange: (workedAt: string) => void;
  onSubmit: () => void;
}

/** CTR is logged for record only, so the date is all it needs. */
const CtrLogForm = ({ workedAt, onChange, onSubmit }: CtrLogFormProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <View className="flex-1 px-5 pt-3">
        <FormInput
          label="Worked on"
          name="workedAt"
          placeholder="Select a date"
          value={workedAt}
          onChange={(_, v) => onChange(String(v))}
          inputType="date"
          maxDate={new Date(getCurrentDate())}
        />
      </View>
      <View
        className="bg-background px-5 pt-4"
        style={{ paddingBottom: Math.max(bottom, 16) }}
      >
        <Button className="w-full" onPress={onSubmit}>
          <Text>Save CTR</Text>
        </Button>
      </View>
    </View>
  );
};

export default CtrLogForm;
