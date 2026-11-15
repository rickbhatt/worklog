import { Button } from "@/components/ui/button";
import { IconTile } from "@/components/ui/list-group";
import { useSheetStyles } from "@/components/ui/sheet";
import { Text as UIText } from "@/components/ui/text";
import { backupDateTimeDisplay, formatBackupSize } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CloudDownload } from "lucide-react-native";
import React, { RefObject, useState } from "react";

import { restoreBackupFromDrive } from "@/services/backupService";
import LottieView from "lottie-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const { colors } = useTheme();

  const { backgroundStyle } = useSheetStyles();

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
      backgroundStyle={{ ...backgroundStyle, backgroundColor: colors.bg }}
      ref={ref}
      enableOverDrag={false}
    >
      <View className="flex-1 flex-col items-center px-5 p-safe">
        <View className="flex-col items-center pt-4">
          <Text className="title-pushed">Restore backup</Text>
        </View>

        {!isRestoring ? (
          <>
            <View className="flex-1 flex-col gap-10 items-center justify-center">
              <View className="flex-col items-center gap-2">
                <IconTile
                  icon={CloudDownload}
                  tone="accent"
                  size={72}
                  iconSize={34}
                  className="mb-2 rounded-[24px]"
                />
                <Text className="section-title text-xl">Backup found</Text>
                <Text className="font-manrope-extrabold text-[22px] text-foreground">
                  {backupDateTimeDisplay(data.lastBackedUpDate)}
                </Text>
                <Text className="caption">
                  {formatBackupSize(parseInt(data?.size || "0"))}
                </Text>
              </View>
              <View className="flex-row justify-center px-4">
                <Text className="body text-center leading-[22px] text-muted">
                  Restore your data from Google Drive now. If you don’t restore
                  now, you won’t be able to restore later.
                </Text>
              </View>
            </View>
            <View className="flex-row justify-center gap-3 pb-4">
              <Button
                onPress={() => ref.current?.close()}
                className="flex-1 basis-0"
                variant="secondary"
              >
                <UIText>Skip</UIText>
              </Button>
              <Button onPress={handleRestore} className="flex-1 basis-0">
                <UIText>Restore</UIText>
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
                  color: colors.accent,
                },
                {
                  keypath: "Layer 11 Outlines",
                  color: colors.accent,
                },
              ]}
            />
            <Text className="body">
              Please wait while we restore your data...
            </Text>
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
};

export default RestoreBottomsheet;
