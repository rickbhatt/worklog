import RestoreBottomsheet from "@/components/bottomsheets/restore-bottomsheet";
import DynamicIcon from "@/components/dynamic-icon";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/AuthContext";
import { backupState, cloudAccount } from "@/db/schema";
import { useDb } from "@/hooks/useDb";
import { listAppDataFiles } from "@/services/backupService";
import { useTheme } from "@/theme/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { LogOut } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { Text as RNText, View } from "react-native";

const ManageAccount = () => {
  const db = useDb();
  const { colors } = useTheme();
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

  const email = cloudAccountInfo[0]?.accountEmail;

  return (
    <>
      <Screen
        header={<ScreenHeader title="Google account" backButtonVisible />}
      >
        <View className="gap-5 px-5 pt-2">
          {isSignedIn ? (
            <Card className="gap-4 p-4">
              <View className="flex-row items-center gap-3.5">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                  <RNText className="font-manrope-extrabold text-lg text-accent">
                    {email ? email.charAt(0).toUpperCase() : "G"}
                  </RNText>
                </View>
                <View className="min-w-0 flex-1 gap-0.5">
                  <RNText
                    numberOfLines={1}
                    className="font-inter-semibold text-[15px] text-foreground"
                  >
                    {email}
                  </RNText>
                  <RNText className="caption">Signed in</RNText>
                </View>
              </View>
              <Button variant="secondary" size="sm" onPress={signOut}>
                <Icon
                  as={LogOut}
                  size={16}
                  strokeWidth={1.8}
                  className="text-foreground"
                />
                <Text>Sign out</Text>
              </Button>
            </Card>
          ) : (
            <Button onPress={handleSignIn}>
              <DynamicIcon
                name="google"
                family="AntDesign"
                size={20}
                color={colors.onAccent}
              />
              <Text>Sign in with Google</Text>
            </Button>
          )}

          <RNText className="px-1 font-inter text-sm leading-[22px] text-muted">
            We need your Google account to upload and download your backups and
            to create and access Google Sheets.
          </RNText>
        </View>
      </Screen>
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
