import DynamicIcon from "@/components/dynamic-icon";
import FormInput from "@/components/form-input";
import HorzLoader from "@/components/horz-loader";
import QrScanner from "@/components/qrscanner/qr-scanner";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { MONTH_NAMES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getFileLogs } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import {
  formatDateTime,
  formatLogsForSheet,
  getCurrentDate,
  getMonthRange,
} from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Linking, Text, View } from "react-native";
import { toast } from "sonner-native";

const EXPORT_TYPES = [
  {
    label: "Append To Existing Sheet",
    value: "append",
  },
  {
    label: "Create New Sheet",
    value: "create",
  },
];

const ExportData = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const db = useDb();
  const [logsForSheet, setLogsForSheet] = useState<
    (string | number | undefined)[][] | null
  >(null);

  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"append" | "create" | null>(
    null,
  );
  const [dateRange, setDateRange] = useState<{
    start: string | undefined;
    end: string | undefined;
  }>({
    start: formatDateTime(new Date()).dateToISOString,
    end: formatDateTime(new Date()).dateToISOString,
  });

  const [gsheetUrl, setGsheetUrl] = useState<string | null>(null);

  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);

  const onSelectExportType = (fieldName: string, rawValue: string | number) => {
    if (typeof rawValue !== "string") return;
    setExportType(rawValue as "append" | "create");
  };

  const handleOnChangeDateRange = (
    fieldName: string,
    rawValue: string | number,
  ) => {
    if (typeof rawValue !== "string") return;
    setDateRange((prev) => ({ ...prev, [fieldName]: rawValue }));
  };

  const onSelectMonthOnly = (fieldName: string, rawValue: string | number) => {
    if (typeof rawValue !== "string") return;

    setExportedSheetUrl(null);
    setSelectedMonth(rawValue);

    try {
      const monthRange = getMonthRange(
        rawValue,
        new Date().getFullYear().toString(),
      );
      const logs = getFileLogs({
        db,
        filters: { startDate: monthRange.start, endDate: monthRange.end },
        sortOrder: "asc",
      }).all();

      if (logs.length < 1) {
        toast.error(
          `No logs found for ${MONTH_NAMES[rawValue]}. Please select a different month.`,
        );
      }

      setLogsForSheet(formatLogsForSheet(logs));
    } catch (error) {
      toast.error("Failed to load logs. Please try again.");
    }
  };

  const exportToNewSheet = async () => {
    setIsExporting(true);
    setExportedSheetUrl(null);

    try {
      const accessToken = await getAccessToken();
      const title = selectedMonth
        ? `Worklog Export-${MONTH_NAMES[selectedMonth]}`
        : "Worklog Export";

      const createRes = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties: { title } }),
        },
      );

      const sheet = await createRes.json();

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheet.spreadsheetId}/values/Sheet1!A1:Z1000?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: logsForSheet }),
        },
      );

      setExportedSheetUrl(sheet.spreadsheetUrl);
    } catch (error) {
      toast.error("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
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
        {isSignedIn ? (
          <>
            <View className="flex-col gap-5 mt-3">
              {/* header */}

              <FormInput
                onChange={onSelectExportType}
                name="exportType"
                label="Export Type"
                inputType="select"
                placeholder="Select an export type"
                selectOptions={EXPORT_TYPES}
                value={exportType}
              />

              {exportType && (
                <View className="flex-col gap-y-2">
                  <Text className="form-label">Select a date range</Text>
                  <View className="flex-row items-center gap-x-2">
                    <FormInput
                      inputType="date"
                      label="From"
                      name="start"
                      placeholder="YYYY-MM-DD"
                      value={dateRange.start}
                      onChange={handleOnChangeDateRange}
                      rowMode
                    />
                    <FormInput
                      inputType="date"
                      label="To"
                      name="end"
                      placeholder="YYYY-MM-DD"
                      value={dateRange.end}
                      onChange={handleOnChangeDateRange}
                      maxDate={new Date(getCurrentDate())}
                      rowMode
                    />
                  </View>
                </View>
              )}

              {exportType === "append" && (
                <View className="form-group">
                  <Text className="form-label">G-Sheet Url</Text>
                  <QrScanner value={gsheetUrl} onScan={setGsheetUrl} />
                </View>
              )}
              {/* <Text className="base-paragraph">
                Select a month to export data
              </Text>
              <FormInput
                onChange={onSelectMonthOnly}
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
              /> */}
            </View>
            {logsForSheet &&
              logsForSheet.length > 1 &&
              !isExporting &&
              !exportedSheetUrl && (
                <View className="flex-col gap-4">
                  <Text className="base-paragraph">
                    Data is ready to be exported. Click the button below to
                    export to Google Sheets.
                  </Text>
                  <Button onPress={exportToNewSheet}>
                    <Text className="btn-label">Export to Sheets</Text>
                  </Button>
                </View>
              )}
            {isExporting && (
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
          </>
        ) : (
          <View className="flex-col gap-4">
            <Text className="base-paragraph">
              Please singn in with your Google account to export data to Google
              Sheets.
            </Text>
            <Button
              className="flex-row items-center py-3 px-4"
              onPress={() => router.push("/settings/manage-google-account")}
            >
              <Text className="btn-label">Manage Google Account</Text>
            </Button>
          </View>
        )}
      </View>
    </>
  );
};

export default ExportData;
