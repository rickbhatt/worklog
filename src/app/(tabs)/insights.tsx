import DynamicIcon from "@/components/dynamic-icon";
import FormInput from "@/components/form-input";
import ScreenHeader from "@/components/screen-header";
import { MONTH_NAMES, MONTHS } from "@/constants";
import { getPreviousMonthTotalLogs } from "@/db/queries/fileworklog.queries";
import {
  getInsightsQuery,
  getMonthlyTotalLogsQuery,
} from "@/db/queries/insights.queries";
import { useDb } from "@/hooks/useDb";
import { calcMomGrowthPercent } from "@/lib/utils";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Tabs } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { FieldName } from "type";

type InsightTypes = {
  month: string;
};

const Insights = () => {
  const db = useDb();

  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    (new Date().getMonth() + 1).toString(),
  );

  const {
    data: [summary],
  } = useLiveQuery(getInsightsQuery({ db, month: selectedMonth! }), [
    selectedMonth,
  ]);

  const { data: previousMonthSummary } = useLiveQuery(
    getPreviousMonthTotalLogs({ db, month: selectedMonth! }),
    [selectedMonth],
  );

  const { data: monthlyTotalLogs } = useLiveQuery(
    getMonthlyTotalLogsQuery({ db }),
    [],
  );

  const momGrowthPercent = calcMomGrowthPercent({
    currentTotal: summary?.totalLogs,
    previousTotal: previousMonthSummary[0]?.totalLogs,
  });
  const isMomGrowthNegative = momGrowthPercent.startsWith("-");
  const selectedMonthLabel =
    MONTHS.find((month) => month.value === selectedMonth)?.label ??
    "selected month";
  const chartBarWidth = 32;
  const chartSpacing = 22;

  const monthlyTotalLogsChartData = useMemo(() => {
    const monthlyTotals = new Map(
      monthlyTotalLogs.map((item) => [item.month.toString(), item.totalLogs]),
    );

    return MONTHS.map((month) => {
      const isCurrentCalendarMonth = month.value === selectedMonth;

      return {
        value: monthlyTotals.get(month.value) ?? 0,
        label: month.label.slice(0, 3),
        labelWidth: chartBarWidth,
        frontColor: isCurrentCalendarMonth ? "#FFFFFF" : "transparent",
        barBorderColor: "#FFFFFF",
        barBorderWidth: isCurrentCalendarMonth ? 0 : 1,
      };
    });
  }, [chartBarWidth, selectedMonth, monthlyTotalLogs]);

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

      <View className="flex-1 flex-col gap-y-4 bg-bg-primary screen-x-padding pb-safe">
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
        {summary?.totalLogs > 0 ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-col gap-4 pb-32"
            showsVerticalScrollIndicator={false}
          >
            <View className="border border-white p-4 rounded-md flex-col gap-y-4">
              <Text className="text-text-secondary base-bold">Total Files</Text>
              <Text className="text-text-primary text-7xl">
                {summary?.totalLogs}
              </Text>
            </View>

            <View className="flex-row gap-x-4">
              <View className="border border-white p-4 rounded-md basis-0 flex-1 flex-col gap-y-4">
                <Text className="text-text-secondary base-bold">SMLs</Text>
                <Text className="text-text-primary text-7xl">
                  {summary?.smlCount}
                </Text>
              </View>

              <View className="border border-white p-4 rounded-md basis-0 flex-1 flex-col gap-y-4">
                <Text className="text-text-secondary base-bold">Manuals</Text>
                <Text className="text-text-primary text-7xl">
                  {summary?.manualCount}
                </Text>
              </View>
            </View>

            <View className="rounded-md flex-col gap-y-4">
              <View className="flex-row items-center justify-between gap-x-3">
                <Text className="text-text-secondary base-bold uppercase">
                  Performance Trends
                </Text>
                <Text className="text-text-primary text-sm font-bold">
                  Annual Flow
                </Text>
              </View>

              <View className="overflow-hidden">
                <BarChart
                  data={monthlyTotalLogsChartData}
                  minHeight={1}
                  barWidth={chartBarWidth}
                  spacing={chartSpacing}
                  initialSpacing={4}
                  endSpacing={0}
                  nestedScrollEnabled
                  showScrollIndicator={false}
                  hideRules
                  hideYAxisText
                  yAxisLabelWidth={0}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  backgroundColor="transparent"
                  noOfSections={3}
                  barBorderRadius={2}
                  labelWidth={chartBarWidth}
                  xAxisTextNumberOfLines={1}
                  xAxisLabelsHeight={32}
                  xAxisLabelTextStyle={{
                    color: "#c3c3c3",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                  labelsDistanceFromXaxis={8}
                />
              </View>
            </View>

            <View className="border border-white p-4 rounded-md flex-row items-end justify-between gap-x-4">
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
        ) : (
          <View className="flex-1 flex-center">
            <Text className="text-text-primary base-bold text-center">
              There are no insights yet for {MONTH_NAMES[selectedMonth!]}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default Insights;
