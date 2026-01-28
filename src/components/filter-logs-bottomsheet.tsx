import DynamicIcon from "@/components/dynamic-icon";
import FormInput from "@/components/form-input";
import { Button } from "@/components/ui/button";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import { RefObject, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const renderBackdrop = (props: any) => (
  <BottomSheetBackdrop
    {...props}
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    opacity={0.6}
  />
);

const FilterLogsBottomSheetModal = ({
  ref,
  journalId,
  articleId,
  workedAt,
  month,
}: {
  ref: RefObject<BottomSheetModal | null>;
  journalId?: string | undefined;
  articleId?: string | undefined;
  workedAt?: string | undefined;
  month?: string | undefined;
}) => {
  const { top } = useSafeAreaInsets();

  const router = useRouter();

  const [filters, setFilters] = useState({
    journalId: journalId,
    articleId: articleId,
    workedAt: workedAt,
    month: month,
  });

  const handleApplyFilters = () => {
    router.replace({
      pathname: "/(tabs)",
      params: {
        journalId: filters.journalId || undefined,
        articleId: filters.articleId || undefined,
        workedAt: filters.workedAt || undefined,
        month: filters.month || undefined,
      },
    });
    ref.current?.close();
  };

  const handleOnChangeFilters = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setFilters({ journalId, articleId, workedAt, month });
  }, [journalId, articleId, workedAt, month]);

  const handleClearFilters = () => {
    setFilters({
      journalId: undefined,
      articleId: undefined,
      workedAt: undefined,
      month: undefined,
    });
    router.replace({
      pathname: "/(tabs)",
      params: {
        journalId: undefined,
        articleId: undefined,
        workedAt: undefined,
        month: undefined,
      },
    });
    ref.current?.close();
  };

  return (
    <BottomSheetModal
      ref={ref}
      name="log-filter"
      backdropComponent={renderBackdrop}
      snapPoints={["100%"]}
      enableContentPanningGesture={true}
      enableDismissOnClose
      enableDynamicSizing={false}
      topInset={top}
      handleIndicatorStyle={{
        backgroundColor: "#FFFFFF",
        width: 40,
      }}
      backgroundStyle={{ backgroundColor: "#242424" }}
    >
      <BottomSheetView className="flex-col screen-x-padding gap-y-3">
        <View className="flex-between flex-row">
          <Text className="text-2xl font-bold text-text-primary">Filters</Text>
          <View className="flex-row gap-x-3">
            <Button
              onPress={handleClearFilters}
              className="rounded-full flex-row items-center justify-center h-14 w-14 border-light-100 border"
              variant={"outline"}
            >
              <DynamicIcon
                family="MaterialIcons"
                name="delete-outline"
                color="#EF4444"
                size={24}
              />
            </Button>
            <Button
              onPress={handleApplyFilters}
              className="rounded-full flex-row items-center justify-center h-14 w-14"
            >
              <DynamicIcon
                family="FontAwesome"
                name="check"
                color="#FFFFFF"
                size={24}
              />
            </Button>
          </View>
        </View>

        {/* journal id and article id */}
        <View className="items-center flex-row gap-x-2">
          <FormInput
            label="Journal ID"
            autoCapitalize="words"
            name="journalId"
            maxLength={4}
            placeholder="NPP2, MDR2,..."
            value={filters.journalId}
            onChange={handleOnChangeFilters}
            rowMode
          />
          <FormInput
            label="Article ID"
            name="articleId"
            inputMode="numeric"
            maxLength={5}
            placeholder="2345"
            value={filters.articleId}
            onChange={handleOnChangeFilters}
            rowMode
          />
        </View>
        {/* worked at and month */}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default FilterLogsBottomSheetModal;
