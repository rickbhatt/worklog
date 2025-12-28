import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import React from "react";
import { Text, View } from "react-native";
import { FieldName, FileWorklogFormProps } from "type";

const FileWorklogForm = ({
  value,
  onSubmit,
  onChange,
}: FileWorklogFormProps) => {
  const numericFields: FieldName[] = ["articleId", "lepPages", "timeTaken"];

  const handleInputChange = (field: FieldName, rawValue: string) => {
    let sanitizedValue = rawValue;

    if (numericFields.includes(field)) {
      sanitizedValue = rawValue.replace(/\D+/g, "");
    }

    if (field === "journalId") {
      sanitizedValue = sanitizedValue.toUpperCase();
    }

    onChange({
      ...value,
      [field]: sanitizedValue,
    });
  };

  return (
    <View className="flex-col gap-5">
      <FormInput
        label="Journal ID"
        autoCapitalize="words"
        name="journalId"
        maxLength={4}
        autoFocus={true}
        placeholder="NPP2, MDR2,..."
        value={value.journalId}
        onChange={handleInputChange}
      />
      <FormInput
        label="Article ID"
        name="articleId"
        inputMode="numeric"
        maxLength={5}
        placeholder="2345"
        value={value.articleId}
        onChange={handleInputChange}
      />
      <FormInput
        label="LEP Pages"
        value={value.lepPages}
        inputMode="numeric"
        maxLength={3}
        placeholder="63"
        name="lepPages"
        onChange={handleInputChange}
      />
      <FormInput
        label="Time taken (minutes)"
        name="timeTaken"
        inputMode="numeric"
        maxLength={3}
        value={value.timeTaken}
        placeholder="60"
        onChange={handleInputChange}
      />
      <FormInput
        label="Worked At"
        name="workedAt"
        placeholder={"YYYY-MM-DD"}
        value={value.workedAt}
        onChange={handleInputChange}
        inputType="date"
      />
      <Button className="py-3 mt-2" onPress={() => onSubmit(value)}>
        <Text className="text-text-primary font-bold text-base">Save</Text>
      </Button>
    </View>
  );
};

export default FileWorklogForm;
