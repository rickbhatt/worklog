import TargetAndHourForm from "@/components/bottomsheets/target-and-hour-formsheet";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FlatList } from "@/components/ui/gesture-scroll";
import { Icon } from "@/components/ui/icon";
import { SectionCaption } from "@/components/ui/list-group";
import { Pill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { deleteTargetInfoById } from "@/db/mutations/fileworklog.mutations";
import { getAllTargetHour } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { formatDateTime } from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Plus, Trash2 } from "lucide-react-native";
import React, { useRef } from "react";
import { Text as RNText, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TargetInfoSelectType } from "type";

const DeleteButton = ({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) => (
  <Button
    variant="secondary"
    size="icon"
    onPress={onPress}
    accessibilityLabel={label}
  >
    <Icon as={Trash2} size={18} strokeWidth={1.8} className="text-accent" />
  </Button>
);

/** The active (latest) target: accent border, badge, two big numbers. */
const ActiveTarget = ({
  item,
  onDelete,
}: {
  item: TargetInfoSelectType;
  onDelete: () => void;
}) => {
  const { colors } = useTheme();
  return (
    <Card
      className="gap-4 rounded-[22px] p-5"
      style={{ borderColor: colors.accent }}
    >
      <View className="flex-row items-start justify-between">
        <View className="gap-1.5">
          <Pill tone="accent" className="self-start">
            Active
          </Pill>
          <RNText className="caption">
            Since {formatDateTime(item.createdAt).shortDateWithYear}
          </RNText>
        </View>
        <DeleteButton onPress={onDelete} label="Delete active target" />
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1 gap-1">
          <RNText className="font-manrope-extrabold text-[40px] leading-[44px] tabular-nums text-foreground">
            {item.targetLepPages}
          </RNText>
          <RNText className="caption">LEP pages / day</RNText>
        </View>
        <View className="flex-1 gap-1">
          <RNText className="font-manrope-extrabold text-[40px] leading-[44px] tabular-nums text-foreground">
            {item.pagesPerHour}
          </RNText>
          <RNText className="caption">pages / hour</RNText>
        </View>
      </View>
    </Card>
  );
};

const TargetAndHour = () => {
  const db = useDb();

  const { bottom } = useSafeAreaInsets();

  const { data } = useLiveQuery(getAllTargetHour(db));

  const targetAndHourFormRef = useRef<BottomSheetModal>(null);

  const handleFormSheetTrigger = () => {
    targetAndHourFormRef?.current?.present();
  };

  const handleDeleteTarget = async (id: string) => {
    try {
      await deleteTargetInfoById(db, id);
    } catch (error) {
      console.error("Failed to delete target and hour", error);
    }
  };

  // newest first: [0] is active, the rest are previous targets
  const [active, ...previous] = data;

  const renderItem = ({
    item,
    index,
  }: {
    item: TargetInfoSelectType;
    index: number;
  }) => {
    // a previous target ran until the next newer one started
    const newer = index === 0 ? active : previous[index - 1];
    return (
      <Card className="flex-row items-center gap-3 rounded-[18px] py-3 pl-4 pr-3">
        <View className="min-w-0 flex-1 gap-0.5">
          <RNText className="font-inter-semibold text-[15px] tabular-nums text-foreground">
            {item.targetLepPages} LEP pages · {item.pagesPerHour} pages / hour
          </RNText>
          <RNText numberOfLines={1} className="caption">
            {formatDateTime(item.createdAt).shortDateWithYear} –{" "}
            {formatDateTime(newer?.createdAt).shortDateWithYear}
          </RNText>
        </View>
        <DeleteButton
          onPress={() => handleDeleteTarget(item.id)}
          label="Delete target"
        />
      </Card>
    );
  };

  return (
    <>
      <Screen
        header={
          <ScreenHeader
            title="Target and hours"
            backButtonVisible
            right={
              <Button size="sm" onPress={handleFormSheetTrigger}>
                <Icon
                  as={Plus}
                  size={18}
                  strokeWidth={2.2}
                  className="text-on-accent"
                />
                <Text className="text-sm">New</Text>
              </Button>
            }
          />
        }
      >
        <FlatList
          keyExtractor={(item) => item.id}
          data={previous}
          className="flex-1"
          contentContainerClassName="gap-3 px-5 pt-2"
          contentContainerStyle={{ paddingBottom: bottom + 24 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            active ? (
              <View className="gap-5 pb-1">
                <ActiveTarget
                  item={active}
                  onDelete={() => handleDeleteTarget(active.id)}
                />
                {previous.length > 0 && (
                  <SectionCaption>Previous</SectionCaption>
                )}
              </View>
            ) : null
          }
          renderItem={renderItem}
          ListEmptyComponent={
            active ? null : (
              <View className="items-center gap-1 pt-16">
                <RNText className="section-title">
                  No targets and hours yet
                </RNText>
                <RNText className="caption">
                  Tap New to add your daily target
                </RNText>
              </View>
            )
          }
        />
      </Screen>

      <TargetAndHourForm ref={targetAndHourFormRef} />
    </>
  );
};

export default TargetAndHour;
