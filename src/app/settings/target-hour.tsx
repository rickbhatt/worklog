import DynamicIcon from "@/components/dynamic-icon";
import ScreenHeader from "@/components/screen-header";
import TargetAndHourForm from "@/components/target-and-hour-formsheet";
import { Button } from "@/components/ui/button";
import { getTargetHour } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { formatDateTime } from "@/lib/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Stack } from "expo-router";
import React, { useRef } from "react";
import { FlatList, Text, View } from "react-native";
import { TargetInfoSelectType } from "type";

const ListHeader = ({ onPress }: { onPress: () => void }) => {
  return (
    <View className="flex-row justify-end mb-5">
      <Button
        onPress={onPress}
        className="flex-row items-center justify-center w-40 px-3 py-3"
      >
        <Text numberOfLines={1} className="btn-label">
          Add New
        </Text>
        <DynamicIcon
          family="MaterialIcons"
          name="add"
          size={24}
          color="#FFFFFF"
        />
      </Button>
    </View>
  );
};

const renderItem = ({ item }: { item: TargetInfoSelectType }) => (
  <View className="flex-col gap-3 bg-dark-200 px-4 py-3 rounded-md relative">
    <Text className="base-paragraph text-text-primary">
      Target Lep Pages: {item.targetLepPages}
    </Text>
    <Text className="base-paragraph text-text-primary">
      Pages per Hour: {item.pagesPerHour}
    </Text>
    <Text className="text-sm text-text-secondary">
      {formatDateTime(item.createdAt).shortDateWithYear}
    </Text>
    <Button
      variant={"iconOnly"}
      size={"icon"}
      className="rounded-full flex-row items-center justify-center absolute z-10 top-2 right-2"
    >
      <DynamicIcon
        family="MaterialIcons"
        name="delete-outline"
        color="#EF4444"
        size={24}
      />
    </Button>
  </View>
);

const TargetAndHour = () => {
  const db = useDb();

  const { data, error } = useLiveQuery(getTargetHour(db));

  const targetAndHourFormRef = useRef<BottomSheetModal>(null);

  const handleFormSheetTrigger = () => {
    targetAndHourFormRef?.current?.present();
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          header: () => (
            <ScreenHeader title="Target and Hour" backButtonVisible />
          ),
        }}
      />

      <FlatList
        data={data}
        className="bg-bg-primary flex-1 screen-x-padding"
        contentContainerClassName="flex-1 pb-safe"
        ListHeaderComponent={<ListHeader onPress={handleFormSheetTrigger} />}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View className="flex-1 flex-center">
            <Text className="text-text-primary h3-bold">
              No targets and hours available
            </Text>
            <Text className="text-text-secondary base-bold">Add a new one</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <TargetAndHourForm ref={targetAndHourFormRef} />
    </>
  );
};

export default TargetAndHour;
