import AlertDialogBox from "@/components/alert-dialogbox";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { TypeTag } from "@/components/ui/pill";
import { useSheetStyles } from "@/components/ui/sheet";
import { deleteFileLogById } from "@/db/mutations/fileworklog.mutations";
import { getFileLogById } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { convertTimeTakenToHoursMins, formatDateTime } from "@/lib/utils";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Pencil, Trash2 } from "lucide-react-native";

import { RefObject, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import { FileLogsSelectType } from "type";

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

  const sheetStyles = useSheetStyles();

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
        {...sheetStyles}
        onDismiss={() => setIsModalOpen(false)}
        enableContentPanningGesture={true}
        enableDismissOnClose
        enableDynamicSizing={true}
        ref={ref}
      >
        <BottomSheetView className="flex-col gap-5 px-5 pb-safe-offset-6 pt-2">
          {/* Header */}
          <View className="flex-row items-center justify-between gap-3">
            <View className="min-w-0 flex-1 gap-1.5">
              <Text
                numberOfLines={1}
                className="title-pushed text-[22px]"
              >
                {fileLog?.journalId}-{fileLog?.articleId}
              </Text>
              <View className="flex-row gap-1.5">
                <TypeTag
                  label={fileLog?.isSml === 1 ? "SML" : "MNL"}
                  accent
                />
                {fileLog?.isSml === 1 && fileLog?.isND === 1 && (
                  <TypeTag label="ND" />
                )}
                {fileLog?.isOT === 1 && <TypeTag label="OT" />}
                {fileLog?.isQcFile === 1 && <TypeTag label="QC" />}
                {fileLog?.isCompensatedFile === 1 && (
                  <TypeTag label="COMP" />
                )}
              </View>
            </View>
            <View className="flex-row gap-2">
              <Button
                variant="secondary"
                size="icon"
                onPress={handleDelete}
                accessibilityLabel="Delete log"
              >
                <Icon
                  as={Trash2}
                  size={18}
                  strokeWidth={1.8}
                  className="text-accent"
                />
              </Button>
              <Button
                size="icon"
                onPress={handleEditPress}
                accessibilityLabel="Edit log"
              >
                <Icon
                  as={Pencil}
                  size={18}
                  strokeWidth={1.8}
                  className="text-on-accent"
                />
              </Button>
            </View>
          </View>

          {/* Content */}
          <View className="overflow-hidden rounded-[18px] border border-line bg-raised">
            {[
              ["LEP pages", fileLog?.lepPages?.toString()],
              [
                "Time taken",
                convertTimeTakenToHoursMins(fileLog?.timeTaken),
              ],
              [
                "Worked on",
                formatDateTime(fileLog?.workedAt).shortDateWithYear,
              ],
            ].map(([label, value], index) => (
              <View
                key={label}
                className={
                  index > 0
                    ? "flex-row items-center justify-between border-t border-line px-4 py-3"
                    : "flex-row items-center justify-between px-4 py-3"
                }
              >
                <Text className="font-inter text-sm text-muted">{label}</Text>
                <Text className="font-inter-semibold text-sm tabular-nums text-foreground">
                  {value}
                </Text>
              </View>
            ))}
          </View>
          {fileLog?.remarks ? (
            <View className="gap-1.5">
              <Text className="form-label">Remarks</Text>
              <Text className="body leading-[22px]">{fileLog.remarks}</Text>
            </View>
          ) : null}
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
