import DynamicIcon from "@/components/dynamic-icon";
import FormInput from "@/components/form-input";
import HorzLoader from "@/components/horz-loader";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { MONTH_NAMES, MONTHS } from "@/constants";
import { getFileLogs } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { formatLogsForSheet, getMonthRange } from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Linking, Text, View } from "react-native";

const ExportData = () => {
  const [logsForSheet, setLogsForSheet] = useState<
    (string | number | undefined)[][] | null
  >(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportReady, setIsExportReady] = useState(false);

  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);

  const db = useDb();

  const onSelect = (fieldName: string, rawValue: string | number) => {
    if (typeof rawValue !== "string") return;

    setIsExportReady(false);
    setExportedSheetUrl(null);
    setSelectedMonth(rawValue);
    try {
      const monthRange = getMonthRange(
        rawValue,
        new Date().getFullYear().toString(),
      );
      // using all() after the function because drizzle query builder returns a reference to the query which needs to be executed to get the data
      const logs = getFileLogs({
        db,
        filters: { startDate: monthRange.start, endDate: monthRange.end },
        sortOrder: "asc",
      }).all();

      const formattedData = formatLogsForSheet(logs);

      setLogsForSheet(formattedData);
      setIsExportReady(true);
    } catch (error) {
      console.log("🚀 ~ export data onSelect ~ error:", error);
    }
  };

  const exportToGoogleSheet = async () => {
    setIsExporting(true);
    try {
      const accessToken = await getAccessToken();

      //Create a new spreadsheet
      const createRes = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              title: `Worklog Export-${MONTH_NAMES[selectedMonth!]}`,
            },
          }),
        },
      );
      const sheet = await createRes.json();
      const spreadsheetId = sheet.spreadsheetId;
      // Write data

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:Z1000?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: logsForSheet }),
        },
      );

      console.log(
        "🚀 ~ exportToGoogleSheet ~ sheet.spreadsheetUrl:",
        sheet.spreadsheetUrl,
      );

      setExportedSheetUrl(sheet.spreadsheetUrl);
    } catch (error) {
      console.log("🚀 ~ export data exportToGoogleSheet ~ error:", error);
    } finally {
      setIsExporting(false);
      setIsExportReady(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Export Data" backButtonVisible />,
        }}
      />
      <View className="bg-bg-primary flex-col gap-3 flex-1 screen-x-padding pb-safe">
        <View className="flex-col gap-2.5 mt-3">
          <Text className="base-paragraph">Select a month to export data</Text>
          <FormInput
            onChange={onSelect}
            name="month"
            inputType="select"
            placeholder="Select a month"
            selectOptions={MONTHS}
            value={selectedMonth}
            className="max-w-52"
            icon={
              <DynamicIcon
                family="Ionicons"
                name={"calendar"}
                size={20}
                color="#c3c3c3"
              />
            }
          />
        </View>
        {isExportReady && (
          <>
            {!isExporting ? (
              <View className="flex-col gap-4">
                <Text className="base-paragraph">
                  Data is ready to be exported. Click the button below to export
                  to Google Sheets.
                </Text>
                <Button onPress={exportToGoogleSheet} disabled={isExporting}>
                  <Text className="btn-label">Export to Sheets</Text>
                </Button>
              </View>
            ) : (
              <View className="flex-col gap-4 mt-5">
                <Text className="base-paragraph">
                  Exporting to Google Sheets...
                </Text>
                <HorzLoader
                  loading={isExporting}
                  duration={1000}
                  className="mt-2"
                  trackClassName="h-1 bg-dark-200"
                  indicatorClassName="bg-accent"
                />
              </View>
            )}
          </>
        )}
        {exportedSheetUrl && (
          <View className="flex-col gap-3.5">
            <Text className="base-paragraph">
              Exported data can be found here
            </Text>
            <Button
              className="flex-row items-center gap-x-2.5"
              onPress={() => Linking.openURL(exportedSheetUrl)}
            >
              <DynamicIcon
                family="Ionicons"
                name={"link"}
                size={20}
                color="#FFFFFF"
              />
              <Text className="btn-label">Open Sheet</Text>
            </Button>
          </View>
        )}
      </View>
    </>
  );
};

export default ExportData;
