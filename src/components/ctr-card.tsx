import CtrDetailBottomsheet from "@/components/bottomsheets/ctr-detail-bottomsheet";
import { Icon } from "@/components/ui/icon";
import { IconTile } from "@/components/ui/list-group";
import { PressableScale } from "@/components/ui/pressable";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { ChevronRight, ClipboardCheck } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import { Text } from "react-native";
import { CtrLogsSelectType } from "type";

/** The day's CTR row in history. Pressing it opens the CTR sheet to edit or delete. */
const CtrCard = ({ ctr }: { ctr: CtrLogsSelectType }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      <PressableScale
        onPress={handlePress}
        accessibilityLabel="CTR analysis"
        accessibilityHint="Opens details to edit or delete"
        className="min-h-[66px] flex-row items-center gap-3 px-3.5 py-3"
      >
        <IconTile icon={ClipboardCheck} tone="raised" />
        <Text
          numberOfLines={1}
          className="min-w-0 flex-1 font-inter-semibold text-[15px] tracking-[0.15px] text-foreground"
        >
          CTR analysis
        </Text>
        <Icon
          as={ChevronRight}
          size={16}
          strokeWidth={2}
          className="text-muted"
        />
      </PressableScale>
      <CtrDetailBottomsheet ref={bottomSheetModalRef} ctr={ctr} />
    </>
  );
};

export default CtrCard;
