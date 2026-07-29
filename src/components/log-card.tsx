import LogDetailBottomsheet from "@/components/bottomsheets/log-detail-bottomsheet";
import Chips from "@/components/chips";
import DynamicIcon from "@/components/dynamic-icon";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { FileLogsListItemType } from "type";

const LogCard = ({ item }: { item: FileLogsListItemType }) => {
  const chipLabels: Record<string, string> = {
    isSml: "SML",
    isOT: "OT",
    isND: "ND",
    isCompensatedFile: "COMP",
    isQcFile: "QC",
  };
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  }, []);

  const chipArr = Object.entries(item)
    .filter(([key, value]) => value === 1 && key in chipLabels)
    .map(([key]) => chipLabels[key]);

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        className="p-4 mb-3 gap-y-3 flex-col border-border border rounded-md"
      >
        {/* log details */}
        <View className="flex-between flex-row">
          <Text className="text-text-primary text-base">
            {item.journalId}-{item.articleId}
          </Text>
          <View className="flex-row items-center gap-x-2">
            <DynamicIcon
              family="Foundation"
              name="page"
              size={20}
              color="#c3c3c3"
            />
            <Text className="text-text-primary text-base">{item.lepPages}</Text>
          </View>
        </View>
        {/* chips */}
        {chipArr.length > 0 && (
          <View className="flex-row gap-x-3">
            {chipArr.map((label) => (
              <Chips key={label} label={label} />
            ))}
          </View>
        )}
      </Pressable>
      {/* log detail */}
      <LogDetailBottomsheet ref={bottomSheetModalRef} id={item.id} />
    </>
  );
};

export default LogCard;
