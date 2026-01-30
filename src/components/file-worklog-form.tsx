import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { getCurrentDate } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";
import { FieldName, FileWorklogFormProps } from "type";

const FileWorklogForm = ({
  value,
  onSubmit,
  onChange,
}: FileWorklogFormProps) => {
  const handleInputChange = (field: FieldName, rawValue: string | number) => {
    if (field === "isSml") {
      let smlValue = Number(rawValue);

      onChange({
        ...value,
        isSml: smlValue,
        lepPages: smlValue === 1 ? 15 : undefined,
      });
    } else {
      onChange({
        ...value,
        [field]: rawValue,
      });
    }
  };

  return (
    <View className="flex-col pb-safe flex-1 gap-5">
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
        inputType="checkbox"
        label="SML file?"
        name="isSml"
        value={value.isSml}
        onChange={handleInputChange}
      />

      <FormInput
        label="LEP Pages"
        value={value.lepPages}
        inputMode="numeric"
        maxLength={3}
        placeholder="63"
        editable={value.isSml === 0}
        name="lepPages"
        onChange={handleInputChange}
      />

      <FormInput
        inputType="checkbox"
        label="OT file?"
        name="isOT"
        value={value.isOT}
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
        maxDate={new Date(getCurrentDate())}
      />
      <FormInput
        label="Remarks"
        name="remarks"
        inputType="textarea"
        placeholder="Type your remarks here..."
        value={value.remarks}
        onChange={handleInputChange}
      />
      <Button className="py-3 mt-2" onPress={() => onSubmit(value)}>
        <Text className="text-text-primary font-bold text-base">Save</Text>
      </Button>
    </View>
  );
};

export default FileWorklogForm;
