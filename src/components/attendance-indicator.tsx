import AttendanceOverrideBottomsheet from "@/components/bottomsheets/attendance-override-bottomsheet";
import { PressableScale } from "@/components/ui/pressable";
import { useTheme } from "@/theme/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import Svg, { Polygon } from "react-native-svg";

export type AttendanceType = "full" | "half" | "absent" | "empty";

type AttendanceIndicatorProps = {
  type: AttendanceType;
  /** ISO date; when set the box is pressable and opens the override sheet. */
  date?: string;
  /** Box size; 28 in the calendar, 14 in the legend. */
  size?: number;
};

/**
 * Attendance box. Full = solid accent; half = diagonal half accent fill with
 * an accent border; absent = solid muted border; empty = no data / future.
 * (No dashed borders: Android doesn't redraw a view whose borderStyle
 * changes, so a dashed box stayed dashed after an attendance override.)
 */
const AttendanceIndicator = ({
  type,
  date,
  size = 28,
}: AttendanceIndicatorProps) => {
  const { colors } = useTheme();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  }, []);

  const radius = size >= 20 ? 8 : 4;
  const box = { width: size, height: size, borderRadius: radius };

  let indicator: React.ReactNode;

  switch (type) {
    case "full":
      indicator = <View style={[box, { backgroundColor: colors.accent }]} />;
      break;

    case "half":
      indicator = (
        <View
          style={[
            box,
            {
              borderWidth: 1.5,
              borderColor: colors.accent,
              overflow: "hidden",
            },
          ]}
        >
          <Svg width={size} height={size}>
            <Polygon points={`0,0 ${size},0 0,${size}`} fill={colors.accent} />
          </Svg>
        </View>
      );
      break;

    case "absent":
      indicator = (
        <View
          style={[
            box,
            {
              borderWidth: 1.5,
              borderColor: colors.muted,
            },
          ]}
        />
      );
      break;

    default:
      indicator = <View style={box} />;
  }

  // legend swatch / future day (no date) — not pressable
  if (!date) {
    return indicator;
  }

  return (
    <>
      <PressableScale
        onPress={handlePress}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${date}: ${type === "full" ? "full day" : type === "half" ? "half day" : "absent"}. Change attendance`}
      >
        {indicator}
      </PressableScale>
      <AttendanceOverrideBottomsheet ref={bottomSheetModalRef} date={date} />
    </>
  );
};

export default AttendanceIndicator;
