import DateRangeField from "@/components/date-range-field";
import FormInput from "@/components/form-input";
import HorzLoader from "@/components/horz-loader";
import OpenExportSheetUrl from "@/components/open-exported-sheet-alert";
import QrScanner from "@/components/qrscanner/qr-scanner";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Screen } from "@/components/ui/screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { getFileLogs } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import {
  ensureSheetExists,
  extractSpreadsheetId,
  formatDateTime,
  formatLogsForSheet,
  getCurrentDate,
} from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import { useRouter } from "expo-router";

import { Info } from "lucide-react-native";
import React, { useState } from "react";
import { Text as RNText, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const EXPORT_TYPES = [
  { label: "Existing sheet", value: "append" },
  { label: "New sheet", value: "create" },
] as const;

const ExportData = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const db = useDb();

  const { bottom } = useSafeAreaInsets();
  const [isExporting, setIsExporting] = useState(false);
  // the segmented control always has a selection; "Existing sheet" first
  const [exportType, setExportType] = useState<"append" | "create">("append");
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

  const [fileName, setFileName] = useState<string | null>(null);

  const handleOnChangeDateRange = (
    fieldName: string,
    rawValue: string | number,
  ) => {
    if (typeof rawValue !== "string") return;
    setDateRange((prev) => ({ ...prev, [fieldName]: rawValue }));
  };

  // formats data for export to google sheet
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

      const formattedLogs = formatLogsForSheet({
        logs,
        exportType: exportType!,
      });

      return formattedLogs;
    } catch (error) {
      toast.error("Failed to load logs. Please try again.");
    }
  };

  // appeds data to an existing sheet in a google spreadsheet.
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

  // creates a new google sheet and exports data to it.
  const exportToNewSheet = async () => {
    setIsExporting(true);
    setExportedSheetUrl(null);

    try {
      const accessToken = await getAccessToken();

      const data = prepareData();

      const createRes = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties: { title: fileName } }),
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
          body: JSON.stringify({ values: data }),
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
    <Screen header={<ScreenHeader title="Export data" backButtonVisible />}>
      <KeyboardAwareScrollView
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="flex-col gap-5 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {isSignedIn ? (
          <>
            <SegmentedControl
              options={EXPORT_TYPES}
              value={exportType}
              onChange={setExportType}
            />

            <DateRangeField
              label="Date range"
              start={dateRange.start}
              end={dateRange.end}
              maxDate={new Date(getCurrentDate())}
              onChange={(field, value) =>
                handleOnChangeDateRange(field, value)
              }
            />

            {/* append fields */}
            {exportType === "append" && (
              <>
                <View className="form-group">
                  <RNText className="form-label">Sheet URL</RNText>
                  <QrScanner value={gsheetUrl} onScan={setGsheetUrl} />
                </View>
                <FormInput
                  name="sheetName"
                  label="Sheet or tab name"
                  placeholder="Sheet1"
                  value={sheetName}
                  onChange={(fieldnName: string, rawValue: string | number) => {
                    if (typeof rawValue !== "string") return;
                    setSheetName(rawValue);
                  }}
                />
              </>
            )}

            {/* create fields */}
            {exportType === "create" && (
              <FormInput
                name="fileName"
                label="File name"
                placeholder="Worklog November"
                value={fileName}
                onChange={(fieldnName: string, rawValue: string | number) => {
                  if (typeof rawValue !== "string") return;
                  setFileName(rawValue);
                }}
              />
            )}

            {/* info */}
            <View className="flex-row gap-3 rounded-2xl bg-raised p-4">
              <Icon
                as={Info}
                size={18}
                strokeWidth={1.8}
                className="mt-0.5 text-accent"
              />
              <RNText className="flex-1 font-inter text-[13px] leading-5 text-muted">
                {exportType === "append"
                  ? "Logs in this date range are added as new rows at the end of the sheet. Make sure the account you signed in with can edit it."
                  : "A new Google Sheet is created in your Drive with a header row and the logs in this date range."}
              </RNText>
            </View>

            {/* export button */}
            {isExporting ? (
              <View className="gap-3 py-2">
                <RNText className="caption text-center">
                  Exporting to Google Sheets…
                </RNText>
                <HorzLoader loading={isExporting} duration={1000} />
              </View>
            ) : (
              <Button
                onPress={
                  exportType === "append"
                    ? appendToExistingSheet
                    : exportToNewSheet
                }
              >
                <Text>Export data</Text>
              </Button>
            )}
          </>
        ) : (
          <View className="gap-4">
            <RNText className="body text-muted">
              Please sign in with your Google account to export data to Google
              Sheets.
            </RNText>
            <Button
              onPress={() => router.push("/settings/manage-google-account")}
            >
              <Text>Manage Google account</Text>
            </Button>
          </View>
        )}
      </KeyboardAwareScrollView>

      <OpenExportSheetUrl
        open={!!exportedSheetUrl}
        onDismiss={() => setExportedSheetUrl(null)}
        url={exportedSheetUrl}
      />
    </Screen>
  );
};

export default ExportData;
