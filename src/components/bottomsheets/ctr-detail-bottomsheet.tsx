import AlertDialogBox from "@/components/alert-dialogbox";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSheetStyles } from "@/components/ui/sheet";
import { Text as UIText } from "@/components/ui/text";
import {
  deleteCtrLogById,
  DuplicateCtrLogError,
  updateCtrLogDate,
} from "@/db/mutations/ctr.mutations";
import { useDb } from "@/hooks/useDb";
import { formatDateTime, getCurrentDate } from "@/lib/utils";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { Pencil, Trash2 } from "lucide-react-native";

import { RefObject, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import { CtrLogsSelectType } from "type";

/**
 * Details of a CTR log. A CTR only has a date, so editing happens right here:
 * the pencil swaps the date for a date picker and a Save button.
 */
const CtrDetailBottomsheet = ({
  ref,
  ctr,
}: {
  ref: RefObject<BottomSheetModal | null>;
  ctr: CtrLogsSelectType;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [workedAt, setWorkedAt] = useState(ctr.workedAt);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);

  const db = useDb();

  const sheetStyles = useSheetStyles();

  const date = formatDateTime(ctr.workedAt).shortDateWithYear;

  const resetEdit = () => {
    setIsEditing(false);
    setWorkedAt(ctr.workedAt);
  };

  const handleSave = async () => {
    if (workedAt === ctr.workedAt) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCtrLogDate(db, ctr.id, workedAt);
      ref.current?.close();
      toast.success("CTR updated successfully");
    } catch (error) {
      if (error instanceof DuplicateCtrLogError) {
        toast.error(error.message);
        return;
      }
      console.error("Failed to update CTR log", error);
      toast.error("Failed to update CTR");
    }
  };

  // handles delete button press and opens alert dialog
  const handleDelete = () => {
    ref.current?.close();
    setIsAlertDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteCtrLogById(db, ctr.id);
      setIsAlertDialogOpen(false);
      toast.success(`CTR for ${date} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete CTR log", error);
      toast.error("Failed to delete CTR");
    }
  };

  return (
    <>
      <BottomSheetModal
        name="ctr-detail"
        {...sheetStyles}
        onDismiss={resetEdit}
        enableContentPanningGesture={true}
        enableDismissOnClose
        enableDynamicSizing={true}
        ref={ref}
      >
        <BottomSheetView className="flex-col gap-5 px-5 pb-safe-offset-6 pt-2">
          {/* Header */}
          <View className="flex-row items-center justify-between gap-3">
            <Text numberOfLines={1} className="title-pushed flex-1 text-[22px]">
              CTR analysis
            </Text>
            {!isEditing && (
              <View className="flex-row gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onPress={handleDelete}
                  accessibilityLabel="Delete CTR"
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
                  onPress={() => setIsEditing(true)}
                  accessibilityLabel="Edit CTR"
                >
                  <Icon
                    as={Pencil}
                    size={18}
                    strokeWidth={1.8}
                    className="text-on-accent"
                  />
                </Button>
              </View>
            )}
          </View>

          {/* Content */}
          {isEditing ? (
            <>
              <FormInput
                label="Worked on"
                name="workedAt"
                placeholder="Select a date"
                value={workedAt}
                onChange={(_, v) => setWorkedAt(String(v))}
                inputType="date"
                maxDate={new Date(getCurrentDate())}
              />
              <View className="flex-row gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={resetEdit}
                >
                  <UIText>Cancel</UIText>
                </Button>
                <Button className="flex-1" onPress={handleSave}>
                  <UIText>Save</UIText>
                </Button>
              </View>
            </>
          ) : (
            <View className="flex-row items-center justify-between overflow-hidden rounded-[18px] border border-line bg-raised px-4 py-3">
              <Text className="font-inter text-sm text-muted">Worked on</Text>
              <Text className="font-inter-semibold text-sm tabular-nums text-foreground">
                {date}
              </Text>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
      <AlertDialogBox
        open={isAlertDialogOpen}
        onOpenChange={setIsAlertDialogOpen}
        title={`Delete CTR for ${date}?`}
        description="Deleting this CTR cannot be undone"
        cancelText="Cancel"
        actionText="Delete"
        onAction={handleConfirmDelete}
      />
    </>
  );
};

export default CtrDetailBottomsheet;
