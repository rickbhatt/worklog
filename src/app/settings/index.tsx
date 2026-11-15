import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollView } from "@/components/ui/gesture-scroll";
import { ListGroup, ListRow, SectionCaption } from "@/components/ui/list-group";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { getLatestTargetHour } from "@/db/queries/fileworklog.queries";
import { backupState, cloudAccount } from "@/db/schema";
import { useAppInfo } from "@/hooks/useAppInfo";
import { useDb } from "@/hooks/useDb";
import { backupDateTimeDisplay } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { CloudUpload, Download, Target, Upload } from "lucide-react-native";
import React from "react";
import { Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Settings = () => {
  const router = useRouter();

  const db = useDb();

  const { bottom } = useSafeAreaInsets();

  const { isSignedIn } = useAuth();

  const { appName, appVersion, currentYear } = useAppInfo();

  const { data: cloudAccountInfo } = useLiveQuery(
    db.select().from(cloudAccount).limit(1),
  );

  const { data: backupStateInfo } = useLiveQuery(
    db
      .select()
      .from(backupState)
      .where(eq(backupState.id, "gdrive_backup"))
      .limit(1),
  );

  const { data: targetData } = useLiveQuery(getLatestTargetHour(db));

  const email = isSignedIn ? cloudAccountInfo[0]?.accountEmail : undefined;
  const target = targetData[0];
  const lastBackupAt = backupStateInfo[0]?.lastBackupAt;

  return (
    <Screen header={<ScreenHeader title="Settings" backButtonVisible />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-5 pt-2"
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
      >
        {/* Google account */}
        <Card className="flex-row items-center gap-3.5 p-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
            <RNText className="font-manrope-extrabold text-lg text-accent">
              {email ? email.charAt(0).toUpperCase() : "G"}
            </RNText>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <RNText
              numberOfLines={1}
              ellipsizeMode="middle"
              className="font-inter-semibold text-[15px] text-foreground"
            >
              {email ?? "Not signed in"}
            </RNText>
            <RNText numberOfLines={2} className="caption">
              Google account · backups and Sheets
            </RNText>
          </View>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => router.push("/settings/manage-google-account")}
          >
            <Text>{isSignedIn ? "Manage" : "Sign in"}</Text>
          </Button>
        </Card>

        <View className="gap-2">
          <SectionCaption>Goals</SectionCaption>
          <ListGroup>
            <ListRow
              icon={Target}
              tone="accent"
              title="Target and hours"
              subtitle={
                target
                  ? `${target.targetLepPages} LEP pages · ${target.pagesPerHour} pages / hour`
                  : "No target set yet"
              }
              onPress={() => router.push("/settings/target-hour")}
            />
          </ListGroup>
        </View>

        <View className="gap-2">
          <SectionCaption>Data</SectionCaption>
          <ListGroup>
            <ListRow
              icon={CloudUpload}
              tone="success"
              title="Backups"
              subtitle={
                lastBackupAt
                  ? `Last backup ${backupDateTimeDisplay(lastBackupAt)}`
                  : "No backups yet"
              }
              onPress={() => router.push("/settings/backups")}
            />
            <ListRow
              icon={Download}
              tone="warning"
              title="Import data"
              subtitle="Load logs from a Google Sheet"
              onPress={() => router.push("/settings/import-data")}
            />
            <ListRow
              icon={Upload}
              tone="accent"
              title="Export data"
              subtitle="Send logs to a Google Sheet"
              onPress={() => router.push("/settings/export-data")}
            />
          </ListGroup>
        </View>

        <RNText className="caption pt-2 text-center text-xs">
          {appName} v{appVersion} · © {currentYear}
        </RNText>
      </ScrollView>
    </Screen>
  );
};

export default Settings;
