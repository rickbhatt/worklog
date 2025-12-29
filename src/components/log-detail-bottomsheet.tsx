import DynamicIcon from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { getFileLogById } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { convertTimeTakenToHoursMins, formatDateTime } from "@/lib/utils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";

import { RefObject, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import { FileLogsSelectType } from "type";

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.6}
  />
);

const LogDetailBottomsheet = ({
  ref,
  id,
}: {
  ref: RefObject<BottomSheetModal | null>;
  id: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fileLog, setFileLog] = useState<FileLogsSelectType | null>(null);

  const db = useDb();

  const modalOnChange = () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  const getFileLog = async () => {
    try {
      const row = await getFileLogById(db, id);
      setFileLog(row);
    } catch (error) {
      toast.error("Failed to get log");
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      getFileLog();
    }
  }, [isModalOpen]);

  return (
    <BottomSheetModal
      name="log-detail"
      onChange={modalOnChange}
      backdropComponent={renderBackdrop}
      onDismiss={() => setIsModalOpen(false)}
      enableContentPanningGesture={true}
      enableDismissOnClose
      enableDynamicSizing={false}
      snapPoints={["32%"]}
      handleIndicatorStyle={{
        backgroundColor: "#FFFFFF",
        width: 40,
      }}
      ref={ref}
      backgroundStyle={{ backgroundColor: "#242424" }}
    >
      <BottomSheetView className="py-4 mt-2 screen-x-padding flex-1 flex-col">
        {/* Header */}
        <View className="flex-between flex-row">
          <Text className="text-2xl font-bold text-text-primary">
            {fileLog?.journalId}-{fileLog?.articleId}
          </Text>
          <View className="flex-row gap-x-3">
            <Button
              className="rounded-full flex-row items-center justify-center h-14 w-14 border-light-100 border"
              variant={"ghost"}
            >
              <DynamicIcon
                family="MaterialIcons"
                name="delete-outline"
                color="#EF4444"
                size={24}
              />
            </Button>
            <Button className="rounded-full flex-row items-center justify-center h-14 w-14">
              <DynamicIcon
                family="Entypo"
                name="edit"
                color="#FFFFFF"
                size={24}
              />
            </Button>
          </View>
        </View>

        {/* Content */}
        <View className="mt-3.5 flex-col gap-3">
          <Text className="text-base text-text-primary">
            LEP Pages: {fileLog?.lepPages}
          </Text>
          <Text className="text-base text-text-primary">
            Time taken to complete:{" "}
            {convertTimeTakenToHoursMins(fileLog?.timeTaken)}
          </Text>
          <Text className="text-base text-text-primary">
            Worked At: {formatDateTime(fileLog?.workedAt).shortDateWithYear}
          </Text>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default LogDetailBottomsheet;
