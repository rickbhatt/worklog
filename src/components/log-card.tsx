import LogDetailBottomsheet from "@/components/bottomsheets/log-detail-bottomsheet";
import { Icon } from "@/components/ui/icon";
import { IconTile } from "@/components/ui/list-group";
import { TypeTag } from "@/components/ui/pill";
import { PressableScale } from "@/components/ui/pressable";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { ChevronRight, FileText } from "lucide-react-native";
import React, { useCallback, useRef } from "react";
import { Text, View } from "react-native";
import { FileLogsListItemType } from "type";

// Extra flags shown as muted tags after the accented file type tag.
const FLAG_LABELS: Partial<Record<keyof FileLogsListItemType, string>> = {
  isND: "ND",
  isOT: "OT",
  isQcFile: "QC",
  isMdc: "MDC",
  isCompensatedFile: "COMP",
};

/**
 * One log row inside a day's card: file icon tile, Journal-Article ID, file
 * type tag (SML / MNL, accented), flag tags (ND, OT, QC, MDC, COMP), page count and chevron. Long-press opens the log details sheet.
 */
const LogCard = ({ item }: { item: FileLogsListItemType }) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  }, []);

  const isSml = item.isSml === 1;
  const flags = (Object.keys(FLAG_LABELS) as (keyof FileLogsListItemType)[])
    .filter((key) => item[key] === 1)
    .map((key) => FLAG_LABELS[key]!);

  return (
    <>
      <PressableScale
        onPress={handleLongPress}
        accessibilityLabel={[
          `${item.journalId}-${item.articleId}`,
          isSml ? "SML" : "Manual",
          ...flags,
          `${item.lepPages} pages`,
        ].join(", ")}
        accessibilityHint="Long press for details"
        className="min-h-[66px] flex-row items-center gap-3 px-3.5 py-3"
      >
        <IconTile icon={FileText} tone="raised" />
        <View className="min-w-0 flex-1 gap-[5px]">
          <Text
            numberOfLines={1}
            className="font-inter-semibold text-[15px] tracking-[0.15px] text-foreground"
          >
            {item.journalId}-{item.articleId}
          </Text>
          <View className="flex-row gap-1.5">
            <TypeTag label={isSml ? "SML" : "MNL"} accent />
            {flags.map((label) => (
              <TypeTag key={label} label={label} />
            ))}
          </View>
        </View>
        <Text className="number text-[17px]">{item.lepPages}</Text>
        <Icon
          as={ChevronRight}
          size={16}
          strokeWidth={2}
          className="text-muted"
        />
      </PressableScale>
      <LogDetailBottomsheet ref={bottomSheetModalRef} id={item.id} />
    </>
  );
};

export default LogCard;
