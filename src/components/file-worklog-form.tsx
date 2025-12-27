import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Text, View } from "react-native";

const FileWorklogForm = () => {
  const [formData, setFormData] = useState({
    journalId: null,
    articleId: null,
    lepPages: null,
    timeTaken: null,
    workedAt: null,
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
        value={formData.lepPages}
        placeholder="63"
        name="lepPages"
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
