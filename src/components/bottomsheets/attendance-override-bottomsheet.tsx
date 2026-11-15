import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useSheetStyles } from "@/components/ui/sheet";
import { Text as UIText } from "@/components/ui/text";
import { ATTENDANCE_TYPE_OPTIONS } from "@/constants";
import {
  deleteAttendanceOverrideByDate,
  upsertAttendanceOverride,
} from "@/db/mutations/attendance.mutations";
import { getAttendanceOverrideByDate } from "@/db/queries/attendance.queries";
import { useDb } from "@/hooks/useDb";
import { formatDateTime } from "@/lib/utils";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { RefObject, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import { AttendanceOverrideSelectType } from "type";

const AttendanceOverrideBottomsheet = ({
  ref,
  date,
}: {
  ref: RefObject<BottomSheetModal | null>;
  date: string;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [override, setOverride] =
    useState<AttendanceOverrideSelectType | null>(null);
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined,
  );

  const db = useDb();

  const sheetStyles = useSheetStyles();

  const modalOnChange = () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  // fetch the existing override (if any) for this date
  const getOverride = async () => {
    try {
      const row = await getAttendanceOverrideByDate(db, date);

      setOverride(row ?? null);
      setSelectedType(row?.type);
    } catch {
      toast.error("Failed to get attendance");
    }
  };

  // handles save button press
  const handleSave = async () => {
    if (!selectedType) {
      toast.error("Please select an attendance option");
      return;
    }

    try {
      await upsertAttendanceOverride(db, {
        date,
        type: selectedType as "full" | "half" | "absent",
      });

      toast.success("Attendance updated");
      ref.current?.close();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  // handles reset to auto button press
  const handleResetToAuto = async () => {
    try {
      await deleteAttendanceOverrideByDate(db, date);

      toast.success("Attendance reset to auto");
      ref.current?.close();
    } catch {
      toast.error("Failed to reset attendance");
    }
  };

  // fetch override when modal is opened
  useEffect(() => {
    if (isModalOpen) {
      getOverride();
    }
  }, [isModalOpen, date]);

  return (
    <BottomSheetModal
      ref={ref}
      name="attendance-override"
      onChange={modalOnChange}
      {...sheetStyles}
      onDismiss={() => setIsModalOpen(false)}
      enableContentPanningGesture={true}
      enableDismissOnClose
      enablePanDownToClose
      enableDynamicSizing={true}
    >
      <BottomSheetView className="flex-col gap-5 px-5 pb-safe-offset-6 pt-2">
        <View className="gap-1">
          <Text className="title-pushed text-[22px]">Update attendance</Text>
          <Text className="caption">
            {formatDateTime(date).shortDateWithYear}
          </Text>
        </View>

        {/* attendance options — an in-sheet picker instead of a dropdown,
        since a floating popover can't escape the bottom sheet's own clipped,
        animated container */}
        <SegmentedControl
          options={ATTENDANCE_TYPE_OPTIONS}
          value={selectedType}
          onChange={setSelectedType}
        />

        <View className="flex-col gap-2.5">
          <Button onPress={handleSave} className="w-full">
            <UIText>Save</UIText>
          </Button>

          {override && (
            <Button
              onPress={handleResetToAuto}
              variant="secondary"
              className="w-full"
            >
              <UIText>Reset to auto</UIText>
            </Button>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default AttendanceOverrideBottomsheet;
