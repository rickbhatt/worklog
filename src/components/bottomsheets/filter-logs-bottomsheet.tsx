import DateRangeField from "@/components/date-range-field";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useSheetStyles } from "@/components/ui/sheet";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { Check, Trash2 } from "lucide-react-native";
import { RefObject, useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FilterLogsBottomSheetModal = ({
  ref,
  journalId,
  articleId,
  startDate,
  endDate,
}: {
  ref: RefObject<BottomSheetModal | null>;
  journalId?: string | undefined;
  articleId?: string | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
}) => {
  const { top } = useSafeAreaInsets();

  const router = useRouter();

  const sheetStyles = useSheetStyles();

  const snapPoints = useMemo(() => ["50%", "80%"], []);

  const [filters, setFilters] = useState({
    journalId: journalId,
    articleId: articleId,
    startDate: startDate,
    endDate: endDate,
  });

  const handleApplyFilters = () => {
    router.replace({
      pathname: "/(tabs)",
      params: {
        journalId: filters.journalId || undefined,
        articleId: filters.articleId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      },
    });
    ref.current?.close();
  };

  const handleOnChangeFilters = (name: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFilters({ journalId, articleId, startDate, endDate });
  }, [journalId, articleId, startDate, endDate]);

  const handleClearFilters = () => {
    setFilters({
      journalId: undefined,
      articleId: undefined,
      startDate: undefined,
      endDate: undefined,
    });
    router.replace({
      pathname: "/(tabs)",
      params: {
        journalId: undefined,
        articleId: undefined,
        startDate: undefined,
        endDate: undefined,
      },
    });
    ref.current?.close();
  };

  const handleTextInputFocus = () => {
    ref.current?.snapToIndex(1);
  };

  return (
    <BottomSheetModal
      ref={ref}
      name="log-filter"
      {...sheetStyles}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      snapPoints={snapPoints}
      android_keyboardInputMode="adjustPan"
      enableContentPanningGesture={true}
      enableDismissOnClose
      enablePanDownToClose
      enableDynamicSizing={false}
      topInset={top}
    >
      <BottomSheetView className="flex-col gap-5 px-5 pt-2">
        <View className="flex-row items-center justify-between">
          <Text className="title-pushed text-[22px]">Filters</Text>
          <View className="flex-row gap-2">
            <Button
              onPress={handleClearFilters}
              variant="secondary"
              size="icon"
              accessibilityLabel="Clear filters"
            >
              <Icon
                as={Trash2}
                size={18}
                strokeWidth={1.8}
                className="text-accent"
              />
            </Button>
            <Button
              onPress={handleApplyFilters}
              size="icon"
              accessibilityLabel="Apply filters"
            >
              <Icon
                as={Check}
                size={18}
                strokeWidth={2.2}
                className="text-on-accent"
              />
            </Button>
          </View>
        </View>

        {/* journal id and article id */}
        <View className="flex-row gap-3">
          <FormInput
            label="Journal ID"
            autoCapitalize="characters"
            name="journalId"
            maxLength={4}
            placeholder="NPP2, MDR2…"
            value={filters.journalId}
            onChange={handleOnChangeFilters}
            rowMode
            onFocus={handleTextInputFocus}
          />
          <FormInput
            label="Article ID"
            name="articleId"
            inputMode="numeric"
            maxLength={5}
            placeholder="2345"
            value={filters.articleId}
            onChange={handleOnChangeFilters}
            onFocus={handleTextInputFocus}
            rowMode
          />
        </View>
        {/* start date and end date */}
        <DateRangeField
          label="Worked between"
          start={filters.startDate}
          end={filters.endDate}
          onChange={(field, value) =>
            handleOnChangeFilters(field === "start" ? "startDate" : "endDate", value)
          }
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default FilterLogsBottomSheetModal;
