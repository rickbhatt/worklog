import { useTheme } from "@/theme/theme-provider";
import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import React from "react";
import { useKeyboardState } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Bottom padding for a dynamically sized sheet's content. While the keyboard
 * is open the padding grows by its height, so the sheet rises above it.
 * (The sheet library's own keyboard handling doesn't fire with the app's
 * edge-to-edge + react-native-keyboard-controller setup.)
 */
export const useSheetBottomPadding = (extra = 20) => {
  const { bottom } = useSafeAreaInsets();
  const keyboard = useKeyboardState();
  return keyboard.isVisible ? keyboard.height + 16 : bottom + extra;
};

/** Dimmed backdrop shared by every bottom sheet. */
export const SheetBackdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.6}
  />
);

/** Themed sheet chrome: surface background, 28px top radius, barInactive handle. */
export const useSheetStyles = () => {
  const { colors } = useTheme();
  return {
    backgroundStyle: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    handleIndicatorStyle: {
      backgroundColor: colors.barInactive,
      width: 40,
      height: 5,
    },
    backdropComponent: SheetBackdrop,
  };
};
