import DynamicIcon from "@/components/dynamic-icon";
import LogDetailBottomsheet from "@/components/log-detail-bottomsheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";

interface LogCardProp {
  id: string;
  journalId: string;
  articleId: string;
  lepPages: number;
}

const LogCard = ({ journalId, articleId, lepPages, id }: LogCardProp) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      <Pressable
        onLongPress={handleLongPress}
        className="p-4 mb-3 flex-between flex-row border-border border rounded-md"
      >
        <Text className="text-text-primary text-base">
          {journalId}-{articleId}
        </Text>
        <View className="flex-row items-center gap-x-2">
          <DynamicIcon
            family="Foundation"
            name="page"
            size={20}
            color="#c3c3c3"
          />
          <Text className="text-text-primary text-base">{lepPages}</Text>
        </View>
      </Pressable>
      {/* log detail */}
      <LogDetailBottomsheet ref={bottomSheetModalRef} id={id} />
    </>
  );
};

export default LogCard;
