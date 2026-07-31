import FormInput from "@/components/form-input";
import HorzLoader from "@/components/horz-loader";
import OpenExportSheetUrl from "@/components/open-exported-sheet-alert";
import QrScanner from "@/components/qrscanner/qr-scanner";
import { Button } from "@/components/ui/button";
import { MONTH_NAMES } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import { getFileLogs } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import {
  extractSpreadsheetId,
  formatDateTime,
  formatLogsForSheet,
  getCurrentDate,
} from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import { useRouter } from "expo-router";

import React, { useState } from "react";
import { Text, View } from "react-native";
import {
  KeyboardAwareScrollView,
  useKeyboardState,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
  const keyboard = useKeyboardState();

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
    start: undefined,
    end: formatDateTime(new Date()).dateToISOString,
  });

  const [gsheetUrl, setGsheetUrl] = useState<string | null>(null);

  const [sheetName, setSheetName] = useState<string | null>(null);

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

  const prepareData = () => {
    try {
      const logs = getFileLogs({
        db,
        filters: { startDate: dateRange.start, endDate: dateRange.end },
        sortOrder: "asc",
      }).all();
      if (logs.length < 1) {
        toast.error(
          `No logs found for the selected date range. Please select a different month.`,
        );
        return;
      }

      const formattedLogs = formatLogsForSheet(logs);

      return formattedLogs;
    } catch (error) {
      toast.error("Failed to load logs. Please try again.");
    }
  };
  const ensureSheetExists = async ({
    accessToken,
    spreadsheetId,
    sheetName,
  }: {
    accessToken: string;
    spreadsheetId: string;
    sheetName: string;
  }) => {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!metaRes.ok) {
      const err = await metaRes.json();
      throw new Error(
        err.error?.message ||
          "Could not access this spreadsheet. Check the link and sharing permissions.",
      );
    }

    const meta = await metaRes.json();
    const exists = meta.sheets?.some(
      (s: any) => s.properties.title === sheetName,
    );

    if (!exists) {
      const addRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: sheetName } } }],
          }),
        },
      );
      if (!addRes.ok) {
        const err = await addRes.json();
        throw new Error(
          err.error?.message ||
            "Could not create the tab (edit access required).",
        );
      }
    }
  };

  const appendToExistingSheet = async () => {
    if (dateRange.start === undefined) {
      toast.error("From date is required");
      return;
    }
    if (!gsheetUrl) {
      toast.error("Gsheet url is required");
      return;
    }

    if (!sheetName) {
      toast.error("Sheet name is required");
      return;
    }

    setIsExporting(true);
    setExportedSheetUrl(null);
    try {
      const data = prepareData();

      const spreadsheetId = extractSpreadsheetId(gsheetUrl);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        toast.error("Could not fetch access token");
        return;
      }

      await ensureSheetExists({
        accessToken: accessToken,
        spreadsheetId: spreadsheetId,
        sheetName: sheetName,
      });
      const appendRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          sheetName,
        )}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values: data }),
        },
      );

      if (!appendRes.ok) {
        const err = await appendRes.json();
        throw new Error(err.error?.message || "Append failed");
      }

      setExportedSheetUrl(
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
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
    <View className="bg-bg-primary flex-col gap-3 flex-1 pb-safe">
      <KeyboardAwareScrollView
        bottomOffset={0}
        extraKeyboardSpace={0}
        contentContainerClassName="flex-col gap-5 screen-x-padding"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isSignedIn ? (
          <>
            <View className="form-group gap-y-5">
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
                <View className="form-group">
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
                <>
                  <View className="form-group">
                    <Text className="form-label">G-Sheet Url</Text>
                    <QrScanner value={gsheetUrl} onScan={setGsheetUrl} />
                  </View>
                  <FormInput
                    name="sheetName"
                    label="Sheet Name"
                    placeholder="sheet name or tab name here..."
                    value={sheetName}
                    onChange={(
                      fieldnName: string,
                      rawValue: string | number,
                    ) => {
                      if (typeof rawValue !== "string") return;
                      setSheetName(rawValue);
                    }}
                  />
                </>
              )}
            </View>
            {/* export button */}
            {exportType && !isExporting && (
              <Button
                onPress={
                  exportType === "append"
                    ? appendToExistingSheet
                    : exportToNewSheet
                }
              >
                <Text className="btn-label">Export Data</Text>
              </Button>
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
      </KeyboardAwareScrollView>

      <OpenExportSheetUrl
        open={!!exportedSheetUrl}
        onDismiss={() => setExportedSheetUrl(null)}
        url={exportedSheetUrl}
      />
    </View>
  );
};

export default ExportData;
