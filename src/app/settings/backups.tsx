import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { backupDatabase } from "@/lib/storage/backup";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const Backups = () => {
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

        {__DEV__ && (
          <Button>
            <Text>Backup as json</Text>
          </Button>
        )}
      </View>
    </>
  );
};

export default Backups;
