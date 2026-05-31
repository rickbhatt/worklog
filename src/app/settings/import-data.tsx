import FormInput from "@/components/form-input";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { useDb } from "@/hooks/useDb";
import { captureException } from "@/lib/sentry";
import { Stack } from "expo-router";
import LottieView from "lottie-react-native";

import { createBulkFileLogs } from "@/db/mutations/fileworklog.mutations";
import { validateHeaders } from "@/lib/utils";
import dataTable from "@assets/images/data-table.json";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { toast } from "sonner-native";

const api_key = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const ImportData = () => {
  const [gSheetUrl, setGSheetUrl] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const db = useDb();

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
    if (!gSheetUrl || !sheetName) {
      toast.info("Both sheet url and sheet name are required");
      return;
    }

    if (!api_key) {
      const error = new Error("EXPO_PUBLIC_GOOGLE_API_KEY is not defined");

      captureException(error, {
        tags: {
          "settings.operation": "importData.googleApiKey",
        },
      });

      toast.error("Google Sheets import is not configured.");
      return;
    }

    setIsLoading(true);
    try {
      const sheetID = gSheetUrl?.split("/")[5];

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}?key=${api_key}`,
      );

      const data = await res.json();
      console.log("🚀 ~ handleSubmit ~ data:", data.values);
      if (!data?.values)
        throw new Error("No data found. Error in link or the sheet name");

      const headers = data.values[0];

      if (!headers || !validateHeaders(data.values))
        throw new Error(
          "Invalid sheet format. Headers are missing or incorrect.",
        );

      const gSheetLogData = data?.values?.slice(1);

      const insertValues = gSheetLogData?.map((item: any) => {
        const fileType = item[4];
        return {
          workedAt: item[0],
          journalId: item[1],
          articleId: item[2],
          lepPages: Number(item[3]),
          isSml: fileType === "manual" ? 0 : 1,
          isND: fileType === "nd-sml" ? 1 : 0,
          timeTaken: Number(item[5]),
        };
      });

      await createBulkFileLogs(db, insertValues);
      toast.success("Data from Google sheet load successfuly");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load data from Google sheet.";
      toast.error(message);
    } finally {
      setIsLoading(false);
      setGSheetUrl(null);
      setSheetName(null);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Import Data" backButtonVisible />,
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="bg-bg-primary flex-1 screen-x-padding pb-safe"
      >
        {!isLoading ? (
          <View className="flex-col gap-4">
            <Text className="text-sm text-text-secondary mt-3.5">
              You can only import data from Google sheets
            </Text>
            {/* form */}
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
              value={sheetName}
            />
            <Button onPress={handleSubmit}>
              <Text className="btn-label">Load Data</Text>
            </Button>
            {/* instruction */}
            <View className="flex-col gap-3 mt-4">
              <Text className="text-sm text-text-secondary">
                Please follow the instructions before importing data:
              </Text>
              <Text className="text-sm text-text-secondary">
                1. Ensure the Google Sheet is publicly accessible.
              </Text>
              <Text className="text-sm text-text-secondary">
                2. Verify the sheet name is correct.
              </Text>
              <Text className="text-sm text-text-secondary">
                3. Before loading the data, make sure that the sheet contains
                the following columns in order:
              </Text>

              <Text className="text-sm text-text-secondary">
                Date | JID | AID | Pages | File type | Minutes
              </Text>
              <Text className="text-sm text-text-secondary">
                • Date: yyyy-mm-dd
              </Text>
              <Text className="text-sm text-text-secondary">
                • JID: Journal ID
              </Text>
              <Text className="text-sm text-text-secondary">
                • AID: Article ID
              </Text>
              <Text className="text-sm text-text-secondary">
                • Pages: Number of pages. For sml pages = 15; for nd-sml pages =
                0
              </Text>
              <Text className="text-sm text-text-secondary">
                • File type: manual/nd-sml/sml
              </Text>
              <Text className="text-sm text-text-secondary">
                • Minutes: Time taken in minutes; for nd-sml time = 0
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-1 flex-col justify-center items-center">
            <LottieView
              autoPlay
              loop
              source={dataTable}
              style={{ width: 150, height: 150 }}
              colorFilters={[
                {
                  keypath: "Layer 5 Outlines.Group 1.Stroke 1",
                  color: "#FFFFFF",
                },
                {
                  keypath: "Layer 11 Outlines.Group 1.Stroke 1",
                  color: "#FFFFFF",
                },
                {
                  keypath: "Layer 9 Outlines.Group 1.Stroke 1",
                  color: "#FFFFFF",
                },
                {
                  keypath: "Layer 6 Outlines.Group 1.Stroke 1",
                  color: "#FFFFFF",
                },
                {
                  keypath: "Layer 12 Outlines.Group 1.Stroke 1",
                  color: "#FFFFFF",
                },
                {
                  keypath: "Layer 10 Outlines.Group 1.Stroke 1",
                  color: "#FFFFFF",
                },
              ]}
            />
            <Text className="base-paragraph">Importing data...</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default ImportData;
