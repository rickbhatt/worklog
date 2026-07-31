import RestoreBottomsheet from "@/components/bottomsheets/restore-bottomsheet";
import DynamicIcon from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { backupState, cloudAccount } from "@/db/schema";
import { useDb } from "@/hooks/useDb";
import { listAppDataFiles } from "@/services/backupService";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import React, { useRef, useState } from "react";
import { Text, View } from "react-native";

const ManageAccount = () => {
  const db = useDb();
  const { signIn, signOut, isSignedIn } = useAuth();
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
  const restoreBottomsheetRef = useRef<BottomSheetModal | null>(null);
  const [restoreData, setRestoreData] = useState<{
    lastBackedUpDate: string;
    size: string;
    checksum: string;
    driveFileId: string;
    name: string;
  } | null>(null);

  const checkAndTriggerRestore = async () => {
    if (backupStateInfo.length < 1) {
      const files = await listAppDataFiles();
      if (files.length > 0) {
        setRestoreData({
          lastBackedUpDate: files[0].modifiedTime,
          size: files[0].size,
          checksum: files[0].md5Checksum,
          driveFileId: files[0].id,
          name: files[0].name,
        });
        restoreBottomsheetRef.current?.present();
      }
    }
  };

  const handleSignIn = async () => {
    await signIn();
    await checkAndTriggerRestore();
  };

  return (
    <>
      <View className="bg-bg-primary flex-col gap-3 flex-1 screen-x-padding pb-safe">
        <View className="flex-col mt-3">
          <Text className="text-sm text-text-secondary">
            We need your Google account to upload and download your backups and
            to create and access Google sheets.
          </Text>
        </View>
        {isSignedIn ? (
          <View className="flex-col gap-3">
            <View className="flex-col gap-1.5">
              <Text className="base-paragraph">Google Account</Text>
              <Text className="text-text-secondary text-sm">
                {cloudAccountInfo[0]?.accountEmail}
              </Text>
            </View>
            <Button onPress={signOut}>
              <Text className="btn-label">Sign out</Text>
            </Button>
          </View>
        ) : (
          <>
            <Button
              className="flex-row items-center py-3 px-4"
              onPress={handleSignIn}
            >
              <DynamicIcon name="google" family="AntDesign" color="#FFFFFF" />
              <Text className="btn-label">Sign in with Google</Text>
            </Button>
          </>
        )}
      </View>
      <RestoreBottomsheet
        data={{
          lastBackedUpDate: restoreData?.lastBackedUpDate || "",
          size: restoreData?.size || "",
          checksum: restoreData?.checksum || "",
          driveFileId: restoreData?.driveFileId || "",
          name: restoreData?.name || "",
        }}
        ref={restoreBottomsheetRef}
      />
    </>
  );
};

export default ManageAccount;
