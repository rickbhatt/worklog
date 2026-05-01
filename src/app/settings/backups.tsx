import DynamicIcon from "@/components/dynamic-icon";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { backupState, cloudAccount } from "@/db/schema";
import { useDb } from "@/hooks/useDb";
import { uploadBackupToDrive } from "@/lib/storage/backup";
import { formatBackupSize, formatDateTime } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const Backups = () => {
  const { isSignedIn, signIn, signOut } = useAuth();

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
                {
                  formatDateTime(backupStateInfo[0]?.lastBackupAt!)
                    .dateTimeToISOString
                }
              </Text>
              <Text className="base-paragraph">
                Size: {formatBackupSize(backupStateInfo[0]?.backupSize || 0)}
              </Text>
            </View>
            <Button
              onPress={uploadBackupToDrive}
              className="w-40 p-3 rounded-full"
            >
              <Text className="btn-label">Back up</Text>
            </Button>
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
