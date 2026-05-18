import DynamicIcon from "@/components/dynamic-icon";
import FormInput from "@/components/form-input";
import ScreenHeader from "@/components/screen-header";
import { MONTHS } from "@/constants";
import { getPreviousMonthTotalLogs } from "@/db/queries/fileworklog.queries";
import { getInsightsQuery } from "@/db/queries/insights.queries";
import { useDb } from "@/hooks/useDb";
import { calcMomGrowthPercent } from "@/lib/utils";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Tabs } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { FieldName } from "type";

type InsightTypes = {
  month: string;
};

const Insights = () => {
  const db = useDb();

  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    (new Date().getMonth() + 1).toString(),
  );

  const { data: summary } = useLiveQuery(
    getInsightsQuery({ db, month: selectedMonth! }),
    [selectedMonth],
  );

  const { data: previousMonthSummary } = useLiveQuery(
    getPreviousMonthTotalLogs({ db, month: selectedMonth! }),
    [selectedMonth],
  );

  const momGrowthPercent = calcMomGrowthPercent({
    currentTotal: summary[0]?.totalLogs,
    previousTotal: previousMonthSummary[0]?.totalLogs,
  });
  const isMomGrowthNegative = momGrowthPercent.startsWith("-");

  const onSelect = (name: FieldName<InsightTypes>, value: string | number) => {
    setSelectedMonth(value.toString());
  };

  return (
    <>
      <Tabs.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="Insights" />,
        }}
      />
      <View className="flex-1 bg-bg-primary screen-x-padding pb-safe">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-col gap-4"
        >
          <FormInput<InsightTypes>
            onChange={onSelect}
            name="month"
            inputType="select"
            placeholder="Select a month"
            selectOptions={MONTHS}
            value={selectedMonth}
            className="max-w-52"
            icon={
              <DynamicIcon
                family="Ionicons"
                name={"calendar"}
                size={20}
                color="#c3c3c3"
              />
            }
          />

          {/* total files */}
          <View className="bg-dark-200 p-4 rounded-md flex-col gap-y-4">
            <Text className="text-text-secondary base-bold">Total Files</Text>
            <Text className="text-text-secondary text-7xl">
              {summary[0]?.totalLogs}
            </Text>
          </View>

          {/* manual and sml */}
          <View className="flex-row gap-x-4">
            <View className="bg-dark-200 p-4 rounded-md basis-0 flex-1 flex-col gap-y-4">
              <Text className="text-text-secondary base-bold">SMLs</Text>
              <Text className="text-text-secondary text-7xl">
                {summary[0]?.smlCount}
              </Text>
            </View>

            <View className="bg-dark-200 p-4 rounded-md basis-0 flex-1 flex-col gap-y-4">
              <Text className="text-text-secondary base-bold">Manuals</Text>
              <Text className="text-text-secondary text-7xl">
                {summary[0]?.manualCount}
              </Text>
            </View>
          </View>

          {/* mom growth */}
          <View className="bg-dark-200 p-4 rounded-md flex-row items-end justify-between gap-x-4">
            <View className="flex-col gap-y-3">
              <Text className="text-text-secondary base-bold uppercase">
                MOM Growth
              </Text>
              <View className="flex-col gap-y-1">
                <Text className="text-text-secondary base-bold">
                  vs Last Month
                </Text>
                <Text className="text-text-primary text-3xl font-bold">
                  {momGrowthPercent}
                </Text>
              </View>
            </View>

            <DynamicIcon
              family="Feather"
              name={isMomGrowthNegative ? "trending-down" : "trending-up"}
              size={32}
              color="#FFFFFF"
            />
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Insights;
