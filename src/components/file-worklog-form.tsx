import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { FileLogsInsertType } from "type";

const FileWorklogForm = () => {
  const [formData, setFormData] = useState<Partial<FileLogsInsertType>>({
    journalId: undefined,
    articleId: undefined,
    pageCount: undefined,
    timeTaken: undefined,
    workedAt: undefined,
  });

  const handleInputChange = (field: string | number, value: string) => {
    console.log(field, value);
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Handle form submission logic here

    console.log(formatDateTime(new Date()).shortDateWithYear);
  };

  return (
    <View className="flex-col gap-5">
      <FormInput
        label="Journal ID"
        autoCapitalize="words"
        name="journalId"
        autoFocus={true}
        placeholder="NPP2, MDR2,..."
        value={formData.journalId}
        onChange={handleInputChange}
      />
      <FormInput
        label="Article ID"
        name="articleId"
        placeholder="2345"
        value={formData.articleId}
        onChange={handleInputChange}
      />
      <FormInput
        label="Lep Pages"
        value={formData.pageCount}
        placeholder="63"
        name="pageCount"
        onChange={handleInputChange}
      />
      <FormInput
        label="Time taken (minutes)"
        name="timeTaken"
        value={formData.timeTaken}
        placeholder="60"
        onChange={handleInputChange}
      />
      <FormInput
        label="Worked At"
        name="workedAt"
        placeholder={"2024-06-01"}
        value={formData.workedAt}
        onChange={handleInputChange}
        inputType="date"
      />
      <Button className="py-3 mt-2" onPress={handleSubmit}>
        <Text className="text-text-primary font-bold text-base">Save</Text>
      </Button>
    </View>
  );
};

export default FileWorklogForm;
