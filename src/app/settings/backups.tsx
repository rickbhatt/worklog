import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { backupDatabase, uploadBackupToDrive } from "@/lib/storage/backup";
import {
  signInWithGoogle,
  signOutFromGoogle,
} from "@/services/googleAuthService";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const Backups = () => {
  async function handleSignIn() {
    const result = await signInWithGoogle();
    if (result.success) {
      console.log("🚀Success", `Signed in as ${result.user?.email}`);
    } else {
      console.log("🚀Failed", result.reason);
    }
  }

  async function handleSignOut() {
    const result = await signOutFromGoogle();
    if (result.success) {
      console.log("Signed out");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Backups" backButtonVisible />,
        }}
      />
      <View className="screen flex-col gap-y-6">
        <Button onPress={backupDatabase}>
          <Text>Backup in file system</Text>
        </Button>

        <Button onPress={handleSignIn}>
          <Text>Connect to google</Text>
        </Button>
        <Button onPress={handleSignOut}>
          <Text>Sing out from google</Text>
        </Button>
        <Button onPress={uploadBackupToDrive}>
          <Text>Backup to drive</Text>
        </Button>
      </View>
    </>
  );
};

export default Backups;
