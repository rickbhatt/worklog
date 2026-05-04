import DynamicIcon from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { backupDateTimeDisplay, formatBackupSize } from "@/lib/utils";
import { BottomSheetBackdrop, BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { RefObject, useState } from "react";

import { restoreBackupFromDrive } from "@/services/backupService";
import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.6}
  />
);

const RestoreBottomsheet = ({
  ref,
  data,
}: {
  ref: RefObject<BottomSheetModal | null>;
  data: {
    lastBackedUpDate: string;
    size: string;
    checksum: string;
    driveFileId: string;
    name: string;
  };
}) => {
  const [isRestoring, setIsRestoring] = useState(false);

  const { bottom } = useSafeAreaInsets();

  const handleRestore = async () => {
    setIsRestoring(true);
    await restoreBackupFromDrive({
      id: data.driveFileId,
      md5Checksum: data.checksum,
      size: data.size,
      name: data.name,
      modifiedTime: data.lastBackedUpDate,
    });
  };

  return (
    <BottomSheetModal
      enableDynamicSizing={false}
      name="restore-backup"
      snapPoints={["100%"]}
      enablePanDownToClose={false}
      handleComponent={null}
      backgroundStyle={{ backgroundColor: "#242424" }}
      ref={ref}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
    >
      <View className="flex-1 screen-x-padding flex-col items-center p-safe">
        <View className="flex-col items-center">
          <Text className="h2-bold text-text-primary">Restore Backup</Text>
        </View>

        {!isRestoring ? (
          <>
            <View className="flex-1 flex-col gap-10 items-center justify-center">
              <View className="flex-col items-center gap-3">
                <DynamicIcon
                  family="AntDesign"
                  name="cloud-upload"
                  size={75}
                  color="#ffffff"
                />
                <Text className="h3-bold text-text-primary">Backup found</Text>
                <Text className="base-paragraph">
                  {backupDateTimeDisplay(data.lastBackedUpDate)}
                </Text>
                <Text className="base-paragraph">
                  {formatBackupSize(parseInt(data?.size || "0"))}
                </Text>
              </View>
              <View className="flex-row justify-center px-4">
                <Text className="base-paragraph text-center">
                  Restore your data from Google Drive now. If you don't restore
                  now, you won't be able to restore later.
                </Text>
              </View>
            </View>
            <View className="flex-row screen-x-padding justify-center gap-3">
              <Button
                onPress={() => ref.current?.close()}
                className="flex-1 basis-0 py-4"
                variant={"outline"}
              >
                <Text className="btn-label">Skip</Text>
              </Button>
              <Button onPress={handleRestore} className="flex-1 basis-0 py-4">
                <Text className="btn-label">Restore</Text>
              </Button>
            </View>
          </>
        ) : (
          <View className="flex-1 flex-col items-center mt-28">
            <LottieView
              autoPlay
              loop
              source={require("@assets/images/cloud-download.json")}
              style={{ width: 180, height: 180 }}
              colorFilters={[
                {
                  keypath: "Layer 7 Outlines",
                  color: "#ffffff",
                },
                {
                  keypath: "Layer 11 Outlines",
                  color: "#ffffff",
                },
              ]}
            />
            <Text className="base-paragraph">
              Please wait while we restore your data...
            </Text>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
};

export default RestoreBottomsheet;
