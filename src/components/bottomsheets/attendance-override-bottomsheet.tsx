import { Button } from "@/components/ui/button";
import { ATTENDANCE_TYPE_OPTIONS } from "@/constants";
import {
  deleteAttendanceOverrideByDate,
  upsertAttendanceOverride,
} from "@/db/mutations/attendance.mutations";
import { getAttendanceOverrideByDate } from "@/db/queries/attendance.queries";
import { useDb } from "@/hooks/useDb";
import { cn } from "@/lib/utils";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { RefObject, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { toast } from "sonner-native";
import { AttendanceOverrideSelectType } from "type";

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.6}
  />
);

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
    } catch (error) {
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
    } catch (error) {
      toast.error("Failed to update attendance");
    }
  };

  // handles reset to auto button press
  const handleResetToAuto = async () => {
    try {
      await deleteAttendanceOverrideByDate(db, date);

      toast.success("Attendance reset to auto");
      ref.current?.close();
    } catch (error) {
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
      backdropComponent={renderBackdrop}
      onDismiss={() => setIsModalOpen(false)}
      enableContentPanningGesture={true}
      enableDismissOnClose
      enablePanDownToClose
      enableDynamicSizing={true}
      handleIndicatorStyle={{
        backgroundColor: "#FFFFFF",
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: "#242424" }}
    >
      <BottomSheetView className="pt-4 mt-2 screen-x-padding flex-col gap-y-4 pb-safe-offset-6">
        <Text className="text-2xl font-bold text-text-primary">
          Update Attendance
        </Text>

        {/* attendance options — a plain in-sheet picker instead of a
        dropdown, since a floating popover can't escape the bottom sheet's
        own clipped, animated container */}
        <View className="flex-row gap-x-2">
          {ATTENDANCE_TYPE_OPTIONS.map((option) => {
            const isSelected = selectedType === option.value;

            return (
              <Button
                key={option.value}
                onPress={() => setSelectedType(option.value)}
                variant="outline"
                className={cn(
                  "flex-1 py-3 border-light-100",
                  isSelected ? "bg-white" : "bg-transparent",
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-bold",
                    isSelected ? "text-black" : "text-text-primary",
                  )}
                >
                  {option.label}
                </Text>
              </Button>
            );
          })}
        </View>

        <View className="flex-col gap-y-3 mt-2">
          <Button onPress={handleSave} className="py-3 w-full">
            <Text className="btn-label">Save</Text>
          </Button>

          {override && (
            <Button
              onPress={handleResetToAuto}
              variant="outline"
              className="py-3 w-full border-light-100"
            >
              <Text className="base-bold text-text-primary">
                Reset to Auto
              </Text>
            </Button>
          )}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default AttendanceOverrideBottomsheet;
