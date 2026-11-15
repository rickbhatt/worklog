import HorzLoader from "@/components/horz-loader";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollView } from "@/components/ui/gesture-scroll";
import { Icon } from "@/components/ui/icon";
import { IconTile } from "@/components/ui/list-group";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { backupState, cloudAccount } from "@/db/schema";
import { useDb } from "@/hooks/useDb";
import { backupDateTimeDisplay, formatBackupSize } from "@/lib/utils";
import {
  deleteAllDriveFiles,
  listAppDataFiles,
  uploadBackupToDrive,
} from "@/services/backupService";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useRouter } from "expo-router";
import { Check, CloudUpload } from "lucide-react-native";
import { useState } from "react";
import { Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DetailRow = ({
  label,
  value,
  first,
}: {
  label: string;
  value: string;
  first?: boolean;
}) => (
  <View
    className={
      first
        ? "flex-row items-center justify-between gap-4 px-[18px] py-4"
        : "flex-row items-center justify-between gap-4 border-t border-line px-[18px] py-4"
    }
  >
    <RNText className="font-inter text-sm text-muted">{label}</RNText>
    <RNText
      numberOfLines={1}
      ellipsizeMode="middle"
      className="flex-shrink font-inter-semibold text-sm tabular-nums text-foreground"
    >
      {value}
    </RNText>
  </View>
);

const Backups = () => {
  const { isSignedIn, signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const db = useDb();

  const router = useRouter();

  const { bottom } = useSafeAreaInsets();

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

  const handleManualBackup = async () => {
    setIsUploading(true);
    try {
      await uploadBackupToDrive(db);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const hasBackup = backupStateInfo.length > 0;

  return (
    <Screen header={<ScreenHeader title="Backups" backButtonVisible />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-[22px] px-5 pt-2"
        contentContainerStyle={{ paddingBottom: bottom + 24 }}
      >
        {isSignedIn ? (
          <>
            {/* status */}
            <Card className="items-center gap-3.5 rounded-[24px] px-5 py-6">
              <IconTile
                icon={CloudUpload}
                tone="accent"
                size={72}
                iconSize={34}
                className="rounded-[24px]"
              />
              <View className="items-center gap-1">
                {hasBackup ? (
                  <Pill
                    tone="success"
                    className="self-center px-2.5"
                    icon={
                      <Icon
                        as={Check}
                        size={14}
                        strokeWidth={2.4}
                        className="text-success"
                      />
                    }
                  >
                    Backed up
                  </Pill>
                ) : (
                  <Pill tone="neutral" className="self-center px-2.5">
                    Not backed up yet
                  </Pill>
                )}
                <RNText className="mt-2 text-center font-manrope-extrabold text-[22px] text-foreground">
                  {hasBackup
                    ? backupDateTimeDisplay(backupStateInfo[0]?.lastBackupAt!)
                    : "No backups yet"}
                </RNText>
                <RNText className="text-center font-inter text-sm text-muted">
                  {hasBackup
                    ? "Last backup to Google Drive"
                    : "Back up now to keep your logs safe"}
                </RNText>
              </View>
            </Card>

            {/* details */}
            <Card className="overflow-hidden">
              <DetailRow
                first
                label="Backup size"
                value={
                  hasBackup
                    ? formatBackupSize(backupStateInfo[0]?.backupSize || 0)
                    : "—"
                }
              />
              <DetailRow
                label="Google account"
                value={cloudAccountInfo[0]?.accountEmail ?? "—"}
              />
            </Card>

            <RNText className="px-1 font-inter text-sm leading-[22px] text-muted">
              Your logs are saved to your Google Drive. Install Worklog on a
              new phone and sign in to restore them.
            </RNText>

            {isUploading ? (
              <View className="gap-3 py-2">
                <RNText className="caption text-center">Backing up…</RNText>
                <HorzLoader loading={isUploading} duration={1000} />
              </View>
            ) : (
              <Button onPress={handleManualBackup} disabled={isUploading}>
                <Icon
                  as={CloudUpload}
                  size={20}
                  strokeWidth={2}
                  className="text-on-accent"
                />
                <Text>Back up now</Text>
              </Button>
            )}

            {__DEV__ && (
              <View className="gap-2.5">
                <Button
                  variant="secondary"
                  onPress={async () => {
                    let resop = await listAppDataFiles();
                    console.log(
                      "🚀 ~ Backups ~ resop:",
                      JSON.stringify(resop[0], null, 2),
                    );
                  }}
                >
                  <Text>List Drive Files</Text>
                </Button>
                <Button
                  variant="secondary"
                  onPress={async () => {
                    await deleteAllDriveFiles(db);
                  }}
                >
                  <Text>Delete Drive Files</Text>
                </Button>
                <Button variant="secondary" onPress={signOut}>
                  <Text>Sign out</Text>
                </Button>
              </View>
            )}
          </>
        ) : (
          <Card className="items-center gap-4 rounded-[24px] px-5 py-6">
            <IconTile
              icon={CloudUpload}
              tone="accent"
              size={72}
              iconSize={34}
              className="rounded-[24px]"
            />
            <RNText className="text-center font-inter text-sm leading-[22px] text-muted">
              Backup your logs to Google Drive storage. Sign in with your
              Google account to enable backup and restore.
            </RNText>
            <Button
              className="self-stretch"
              onPress={() => router.push("/settings/manage-google-account")}
            >
              <Text>Manage Google account</Text>
            </Button>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
};

export default Backups;
