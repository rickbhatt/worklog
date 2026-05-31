import HorzLoader from "@/components/horz-loader";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
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
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

const Backups = () => {
  const { isSignedIn, signIn, signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const db = useDb();

  const router = useRouter();

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

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Backups" backButtonVisible />,
        }}
      />
      <View className="screen flex-col pb-safe gap-4">
        <View className="flex-row">
          <Text className="text-sm text-text-secondary">
            Backup your logs to Google Drive storage. You can restore them on
            new phone after you download Worklog on it.
          </Text>
        </View>
        {isSignedIn ? (
          <View className="flex-col gap-4">
            {backupStateInfo.length < 1 ? (
              <View className="flex-row">
                <Text className="base-paragraph">No backups yet</Text>
              </View>
            ) : (
              <View className="flex-col gap-2">
                <Text className="base-paragraph">
                  Last backup:{" "}
                  {backupDateTimeDisplay(backupStateInfo[0]?.lastBackupAt!)}
                </Text>
                <Text className="base-paragraph">
                  Size: {formatBackupSize(backupStateInfo[0]?.backupSize || 0)}
                </Text>
              </View>
            )}
            {isUploading ? (
              <HorzLoader
                loading={isUploading}
                duration={1000}
                className="mt-2"
                trackClassName="h-1 bg-dark-200"
                indicatorClassName="bg-accent"
              />
            ) : (
              <Button
                onPress={handleManualBackup}
                className="w-40 p-3 rounded-full"
                disabled={isUploading}
              >
                <Text className="btn-label">Back up</Text>
              </Button>
            )}

            <View className="flex-col gap-1.5 items-start p-0">
              <Text className="base-paragraph">Google Account</Text>
              <Text className="text-text-secondary text-sm">
                {cloudAccountInfo[0]?.accountEmail}
              </Text>
            </View>
          </View>
        ) : (
          <View className="flex-col gap-4">
            <Text className="base-paragraph">
              Please singn in with your Google account to enable backup and
              restore features.
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
      {__DEV__ && (
        <View className="screen flex-1 flex-row gap-2.5 pb-safe">
          <View className="flex-1 flex-col gap-2.5">
            <Button
              onPress={async () => {
                let resop = await listAppDataFiles();
                console.log(
                  "🚀 ~ Backups ~ resop:",
                  JSON.stringify(resop[0], null, 2),
                );
              }}
            >
              <Text className="btn-label">List Drive Files</Text>
            </Button>
            <Button
              onPress={async () => {
                await deleteAllDriveFiles(db);
              }}
            >
              <Text className="btn-label">Delete Drive Files</Text>
            </Button>
            <Button onPress={signOut}>
              <Text className="btn-label">Sign out</Text>
            </Button>
          </View>
        </View>
      )}
    </>
  );
};

export default Backups;
