import FormInput from "@/components/form-input";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Stack } from "expo-router";

import React, { useState } from "react";
import { Text, View } from "react-native";

//docs.google.com/spreadsheets/d/1EntsPS8Y0_5Wij-tEQ5tNLAphJcD9jtyVnytSNta-U0/edit?usp=sharing

const api_key = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

if (!api_key) {
  throw new Error("GOOGLE_API_KEY is not defined");
}

const LoadData = () => {
  const [gSheetUrl, setGSheetUrl] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);

  const handleOnChangeText = (fieldName: string, rawValue: string | number) => {
    if (typeof rawValue !== "string") return;
    switch (fieldName) {
      case "gsheet_url":
        setGSheetUrl(rawValue);
        break;
      case "sheet_name":
        setSheetName(rawValue);
        break;
    }
  };

  const handleSubmit = async () => {
    const sheetID = gSheetUrl?.split("/")[5];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${api_key}`,
    );

    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  };
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Load Data" backButtonVisible />,
        }}
      />
      <View className="bg-bg-primary flex-1 screen-x-padding">
        <View className="flex-col gap-4">
          <FormInput
            label="Public Google Sheet URL"
            name="gsheet_url"
            onChange={handleOnChangeText}
            autoFocus
            value={gSheetUrl}
          />
          <FormInput
            label="Sheet Name"
            name="sheet_name"
            onChange={handleOnChangeText}
            autoFocus
            value={sheetName}
          />
          <Button onPress={handleSubmit}>
            <Text className="btn-label">Load Data</Text>
          </Button>
        </View>
      </View>
    </>
  );
};

export default LoadData;
