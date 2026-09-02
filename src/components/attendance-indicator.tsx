import AttendanceOverrideBottomsheet from "@/components/bottomsheets/attendance-override-bottomsheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { Pressable, View } from "react-native";

type AttendanceIndicatorProps = {
  type: "filled" | "stripped" | "outline";
  date?: string;
};

const AttendanceIndicator = ({ type, date }: AttendanceIndicatorProps) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  }, []);

  let indicator: React.ReactNode;

  switch (type) {
    case "filled":
      indicator = <View className="h-5 w-5 rounded-sm bg-white" />;
      break;

    case "stripped":
      indicator = (
        <View className="h-5 w-5 overflow-hidden rounded-sm border border-dark-300">
          {[-8, 0, 8, 16].map((left) => (
            <View
              key={left}
              className="absolute h-8 w-0.5 bg-white"
              style={{
                left,
                top: -6,
                transform: [{ rotate: "45deg" }],
              }}
            />
          ))}
        </View>
      );
      break;

    case "outline":
      indicator = <View className="h-5 w-5 rounded-sm border border-dark-300" />;
      break;

    default:
      indicator = null;
  }

  // used as a static legend swatch (no date) — not pressable
  if (!date) {
    return indicator;
  }

  return (
    <>
      <Pressable onPress={handlePress} hitSlop={8}>
        {indicator}
      </Pressable>
      <AttendanceOverrideBottomsheet ref={bottomSheetModalRef} date={date} />
    </>
  );
};

export default AttendanceIndicator;
