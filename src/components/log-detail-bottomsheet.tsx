import AlertDialogBox from "@/components/alert-dialogbox";
import DynamicIcon from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { deleteFileLogById } from "@/db/mutations/fileworklog.mutations";
import { getFileLogById } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { convertTimeTakenToHoursMins, formatDateTime } from "@/lib/utils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";

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
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState<boolean>(false);

  const db = useDb();

  const router = useRouter();

  const modalOnChange = () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  // fetch file log by id
  const getFileLog = async () => {
    try {
      const row = await getFileLogById(db, id);
      setFileLog(row);
    } catch (error) {
      toast.error("Failed to get log");
    }
  };

  // handles edit button press
  const handleEditPress = () => {
    ref.current?.close();
    router.push(`/work-log/edit/${id}`);
  };

  // handles delete button press and opens alert dialog
  const handleDelete = async () => {
    ref.current?.close();
    setIsAlertDialogOpen(true);
  };

  // handles confirm delete in alert dialog
  const handleConfirmDelete = async () => {
    try {
      let row = await deleteFileLogById(db, id);

      setIsAlertDialogOpen(false);
      toast.success(`${row?.journalId}-${row?.articleId} deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete log");
    }
  };

  // fetch file log when modal is opened
  useEffect(() => {
    if (isModalOpen) {
      getFileLog();
    }
  }, [isModalOpen]);

  return (
    <>
      <BottomSheetModal
        name="log-detail"
        onChange={modalOnChange}
        backdropComponent={renderBackdrop}
        onDismiss={() => setIsModalOpen(false)}
        enableContentPanningGesture={true}
        enableDismissOnClose
        enableDynamicSizing={true}
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
                onPress={handleDelete}
                className="rounded-full flex-row items-center justify-center h-14 w-14 border-light-100 border"
                variant={"outline"}
              >
                <DynamicIcon
                  family="MaterialIcons"
                  name="delete-outline"
                  color="#EF4444"
                  size={24}
                />
              </Button>
              <Button
                onPress={handleEditPress}
                className="rounded-full flex-row items-center justify-center h-14 w-14"
              >
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
          <View className="mt-3.5 flex-col gap-3 pb-safe-offset-3">
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
            <Text className="text-base text-text-primary">
              File type: {fileLog?.isSml === 1 ? "SML" : "Manual"}
            </Text>
            {fileLog?.isSml === 1 && (
              <Text className="text-base text-text-primary">
                ND File: {fileLog?.isND === 1 ? "Yes" : "No"}
              </Text>
            )}
            {fileLog?.isOT === 1 && (
              <Text className="text-base text-text-primary">OT File: Yes</Text>
            )}
            {fileLog?.remarks && (
              <Text className="text-base text-text-primary">
                Remarks: {fileLog.remarks}
              </Text>
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
      <AlertDialogBox
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        title={`Delete ${fileLog?.journalId}-${fileLog?.articleId}?`}
        description="Deleting this log cannot be undone"
        cancelText="Cancel"
        actionText="Delete"
        onAction={handleConfirmDelete}
      />
    </>
  );
};

export default LogDetailBottomsheet;
