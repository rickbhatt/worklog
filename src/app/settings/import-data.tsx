import FormInput from "@/components/form-input";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { useDb } from "@/hooks/useDb";
import { useTheme } from "@/theme/theme-provider";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";

import QrScanner from "@/components/qrscanner/qr-scanner";
import { useAuth } from "@/contexts/AuthContext";
import { createBulkFileLogs } from "@/db/mutations/fileworklog.mutations";
import {
  ensureSheetExists,
  extractSpreadsheetId,
  validateHeaders,
} from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import dataTable from "@assets/images/data-table.json";
import React, { useState } from "react";
import { ScrollView } from "@/components/ui/gesture-scroll";
import { Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";

// Required sheet columns, in order, with the existing hint text.
const REQUIRED_COLUMNS = [
  { name: "Date", hint: "yyyy-mm-dd" },
  { name: "JID", hint: "Journal ID" },
  { name: "AID", hint: "Article ID" },
  { name: "Pages", hint: "Number of pages. For sml pages = 15; for nd-sml pages = 0" },
  { name: "File type", hint: "manual/nd-sml/sml" },
  { name: "Minutes", hint: "Time taken in minutes; for nd-sml time = 0" },
  { name: "Compensated file", hint: "yes/no (optional)" },
  { name: "QC file", hint: "yes/no (optional)" },
];

const ImportData = () => {
  const { isSignedIn } = useAuth();
  const db = useDb();
  const router = useRouter();
  const [gsheetUrl, setGsheetUrl] = useState<string | null>(null);
  const [sheetName, setSheetName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  const handleOnChangeText = (fieldName: string, rawValue: string | number) => {
    if (typeof rawValue !== "string") return;
    switch (fieldName) {
      case "gsheet_url":
        setGsheetUrl(rawValue);
        break;
      case "sheet_name":
        setSheetName(rawValue);
        break;
    }
  };

  const handleSubmit = async () => {
    if (!gsheetUrl || !sheetName) {
      toast.info("Both sheet url and sheet name are required");
      return;
    }
    setIsLoading(true);

    const accessToken = await getAccessToken();

    if (!accessToken) {
      toast.error("Could not fetch access token");
      return;
    }

    const spreadsheetId = extractSpreadsheetId(gsheetUrl);

    try {
      await ensureSheetExists({
        accessToken: accessToken,
        spreadsheetId: spreadsheetId,
        sheetName: sheetName,
      });

      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
          sheetName,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await res.json();

      if (!data?.values)
        throw new Error("No data found. Error in link or the sheet name");

      const headers = data.values[0];

      if (!headers || !validateHeaders(data.values))
        throw new Error(
          "Invalid sheet format. Headers are missing or incorrect.",
        );

      const gSheetLogData = data?.values?.slice(1);
      const compensatedFileIndex = headers.indexOf("Compensated file");
      const qcFileIndex = headers.indexOf("QC file");
      const parseBooleanCell = (value: unknown) =>
        ["1", "true", "yes", "y"].includes(
          value?.toString().trim().toLowerCase() ?? "",
        )
          ? 1
          : 0;

      const insertValues = gSheetLogData?.map((item: any) => {
        const fileType = item[4];
        const isCompensatedFile = parseBooleanCell(item[compensatedFileIndex]);
        const isQcFile = parseBooleanCell(item[qcFileIndex]);

        return {
          workedAt: item[0],
          journalId: item[1],
          articleId: item[2],
          lepPages: Number(item[3]),
          isSml: fileType === "manual" ? 0 : 1,
          isND: fileType === "nd-sml" ? 1 : 0,
          timeTaken: Number(item[5]),
          isCompensatedFile,
          isQcFile,
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
      setGsheetUrl(null);
      setSheetName(null);
    }
  };

  return (
    <Screen header={<ScreenHeader title="Import data" backButtonVisible />}>
      {isSignedIn ? (
        <>
          {!isLoading ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              className="flex-1"
              contentContainerClassName="gap-5 px-5 pt-2"
              contentContainerStyle={{ paddingBottom: bottom + 24 }}
            >
              {/* form */}
              <Card className="gap-4 p-4">
                <View className="form-group">
                  <RNText className="form-label">Sheet URL</RNText>
                  <QrScanner value={gsheetUrl} onScan={setGsheetUrl} />
                </View>
                <FormInput
                  label="Sheet name"
                  name="sheet_name"
                  placeholder="Sheet1"
                  onChange={handleOnChangeText}
                  value={sheetName}
                />
                <Button onPress={handleSubmit}>
                  <Text>Load data</Text>
                </Button>
              </Card>

              {/* instructions */}
              <View className="gap-3">
                <RNText accessibilityRole="header" className="section-title px-1">
                  Before you import
                </RNText>
                <RNText className="caption px-1 leading-5">
                  Sign in with the Google account that has access to the sheet,
                  and check the sheet name is correct. The sheet must contain
                  these columns, in this order:
                </RNText>
                <Card className="overflow-hidden rounded-[18px]">
                  {REQUIRED_COLUMNS.map((column, index) => (
                    <View
                      key={column.name}
                      className={
                        index > 0
                          ? "flex-row items-start gap-3 border-t border-line px-4 py-3"
                          : "flex-row items-start gap-3 px-4 py-3"
                      }
                    >
                      <View className="h-6 w-6 items-center justify-center rounded-lg bg-accent-soft">
                        <RNText className="font-manrope-bold text-xs tabular-nums text-accent">
                          {index + 1}
                        </RNText>
                      </View>
                      <View className="min-w-0 flex-1 gap-0.5">
                        <RNText className="font-inter-semibold text-sm text-foreground">
                          {column.name}
                        </RNText>
                        <RNText className="caption">{column.hint}</RNText>
                      </View>
                    </View>
                  ))}
                </Card>
              </View>
            </ScrollView>
          ) : (
            <View className="flex-1 flex-col items-center justify-center gap-2">
              <LottieView
                autoPlay
                loop
                source={dataTable}
                style={{ width: 150, height: 150 }}
                colorFilters={[
                  {
                    keypath: "Layer 5 Outlines.Group 1.Stroke 1",
                    color: colors.accent,
                  },
                  {
                    keypath: "Layer 11 Outlines.Group 1.Stroke 1",
                    color: colors.accent,
                  },
                  {
                    keypath: "Layer 9 Outlines.Group 1.Stroke 1",
                    color: colors.accent,
                  },
                  {
                    keypath: "Layer 6 Outlines.Group 1.Stroke 1",
                    color: colors.accent,
                  },
                  {
                    keypath: "Layer 12 Outlines.Group 1.Stroke 1",
                    color: colors.accent,
                  },
                  {
                    keypath: "Layer 10 Outlines.Group 1.Stroke 1",
                    color: colors.accent,
                  },
                ]}
              />
              <RNText className="body">Importing data…</RNText>
            </View>
          )}
        </>
      ) : (
        <View className="gap-4 px-5 pt-2">
          <RNText className="body text-muted">
            Please sign in with your Google account to import data from Google
            Sheets.
          </RNText>
          <Button onPress={() => router.push("/settings/manage-google-account")}>
            <Text>Manage Google account</Text>
          </Button>
        </View>
      )}
    </Screen>
  );
};

export default ImportData;
