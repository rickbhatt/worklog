import DynamicIcon from "@/components/dynamic-icon";
import HorzLoader from "@/components/horz-loader";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { backupState, cloudAccount } from "@/db/schema";
import { useDb } from "@/hooks/useDb";
import {
  getBackupMetaFromSecureStore,
  restoreBackupFromDrive,
  uploadBackupToDrive,
} from "@/lib/storage/backup";
import { backupDateTimeDisplay, formatBackupSize } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

const Backups = () => {
  const { isSignedIn, signIn, signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const db = useDb();

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
      await uploadBackupToDrive();
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
            <View className="flex-col gap-2">
              <Text className="base-paragraph">
                Last backup:{" "}
                {backupDateTimeDisplay(backupStateInfo[0]?.lastBackupAt!)}
              </Text>
              <Text className="base-paragraph">
                Size: {formatBackupSize(backupStateInfo[0]?.backupSize || 0)}
              </Text>
            </View>
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

            <Button
              variant={"ghost"}
              className="flex-col gap-1.5 items-start p-0"
              onPress={signIn}
            >
              <Text className="base-paragraph">Google Account</Text>
              <Text className="text-text-secondary text-sm">
                {cloudAccountInfo[0]?.accountEmail}
              </Text>
            </Button>
            <View className="flex-col gap-1.5">
              <Text className="base-paragraph">Automatic Backups</Text>
              <Text className="text-text-secondary text-sm">Daily</Text>
            </View>
            <Button
              onPress={async () => {
                let resp = await getBackupMetaFromSecureStore();
                console.log("🚀 ~ Backups ~ secure store:", resp);
              }}
              className="w-40 p-3 rounded-full"
              disabled={isUploading}
            >
              <Text className="btn-label">Check secure store</Text>
            </Button>
            <Button
              onPress={async () => {
                let resp = await restoreBackupFromDrive();
                console.log("🚀 ~ Backups ~ restoreFromBackup:", resp);
              }}
              className="w-40 p-3 rounded-full"
            >
              <Text className="btn-label">Restore</Text>
            </Button>
          </View>
        ) : (
          <View className="flex-col gap-4">
            <Text className="base-paragraph">
              Please add a Google Drive account for backup
            </Text>
            <Button
              className="flex-row items-center py-3 px-4"
              onPress={signIn}
            >
              <DynamicIcon name="google" family="AntDesign" color="#FFFFFF" />
              <Text className="btn-label">Sign in with Google</Text>
            </Button>
          </View>
        )}
      </View>
    </>
  );
};

export default Backups;
