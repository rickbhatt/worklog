import AttendanceIndicator from "@/components/attendance-indicator";
import DynamicIcon from "@/components/dynamic-icon";
import FormInput from "@/components/form-input";
import ScreenHeader from "@/components/screen-header";
import { MONTH_NAMES, MONTHS, WEEKDAY_LABELS } from "@/constants";
import { getPreviousMonthSummary } from "@/db/queries/fileworklog.queries";
import {
  getAttendanceDatesQuery,
  getInsightsQuery,
  getMonthlyTotalLepPagesQuery,
} from "@/db/queries/insights.queries";
import { useDb } from "@/hooks/useDb";
import {
  calcMomGrowthPercent,
  checkDateGreaterThanToday,
  checkSunday,
} from "@/lib/utils";
import { getDaysInMonth } from "date-fns";
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
    getPreviousMonthSummary({ db, month: selectedMonth! }),
    [selectedMonth],
  );

  const { data: monthlyTotalLepPages } = useLiveQuery(
    getMonthlyTotalLepPagesQuery({ db }),
    [],
  );

  const lepMomGrowth = calcMomGrowthPercent({
    currentTotal: summary?.totalLepPages,
    previousTotal: previousMonthSummary[0]?.totalLepPages,
  });
  const filesMomGrowth = calcMomGrowthPercent({
    currentTotal: summary?.totalLogs,
    previousTotal: previousMonthSummary[0]?.totalLogs,
  });

  const chartBarWidth = 32;
  const chartSpacing = 22;

  const monthlyTotalLepPagesChartData = useMemo(() => {
    const monthlyTotals = new Map(
      monthlyTotalLepPages.map((item) => [
        item.month.toString(),
        item.totalLepPages,
      ]),
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
  }, [chartBarWidth, selectedMonth, monthlyTotalLepPages]);

  const { data: attendanceDatesData } = useLiveQuery(
    getAttendanceDatesQuery({ db, month: selectedMonth! }),
    [selectedMonth],
  );

  const attendanceMap = useMemo(() => {
    return new Map(attendanceDatesData.map((item) => [item.date, item.type]));
  }, [attendanceDatesData]);

  const calendarDates = useMemo(() => {
    const selectedYear = new Date().getFullYear();
    const selectedMonthIndex = Number(selectedMonth) - 1;
    const totalDays = getDaysInMonth(
      new Date(selectedYear, selectedMonthIndex),
    );

    const firstDayOfWeek = new Date(
      selectedYear,
      selectedMonthIndex,
      1,
    ).getDay();

    const startPadding = Array(firstDayOfWeek).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);
    const combined = [...startPadding, ...days];

    // Pad the end to complete the last row
    const remainder = combined.length % WEEKDAY_LABELS.length;
    const endPadding =
      remainder === 0
        ? []
        : Array(WEEKDAY_LABELS.length - remainder).fill(null);

    return [...combined, ...endPadding];
  }, [selectedMonth]);

  const attendanceRows = useMemo(() => {
    return Array.from(
      { length: Math.ceil(calendarDates.length / WEEKDAY_LABELS.length) },
      (_, index) =>
        calendarDates.slice(
          index * WEEKDAY_LABELS.length,
          (index + 1) * WEEKDAY_LABELS.length,
        ),
    );
  }, [calendarDates]);

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
            {/* LEP pages */}
            <View className="border border-white p-4 rounded-md flex-col gap-y-4">
              <Text className="text-text-secondary base-bold">
                Total LEP Pages
              </Text>
              <Text className="text-text-primary text-7xl">
                {summary?.totalLepPages}
              </Text>
              <View className="flex-row gap-x-2 items-center">
                <DynamicIcon
                  family="Feather"
                  name={
                    lepMomGrowth.isNegative ? "trending-down" : "trending-up"
                  }
                  size={22}
                  color="#FFFFFF"
                />
                <Text className="base-paragraph">
                  <Text className="font-bold">{lepMomGrowth.percent}</Text> vs
                  last month
                </Text>
              </View>
            </View>

            {/* sml and manual */}
            <View className="flex-row gap-x-4">
              <View className="p-4 rounded-md basis-0 flex-1 flex-col gap-y-4">
                <Text className="text-text-secondary base-bold">SML Files</Text>
                <Text className="text-text-primary text-7xl">
                  {summary?.smlCount}
                </Text>
              </View>

              <View className="p-4 rounded-md basis-0 flex-1 flex-col gap-y-4">
                <Text className="text-text-secondary base-bold">
                  Manual Files
                </Text>
                <Text className="text-text-primary text-7xl">
                  {summary?.manualCount}
                </Text>
              </View>
            </View>

            {/* files */}
            <View className="p-4 rounded-md basis-0 flex-1 flex-col gap-y-2">
              <Text className="text-xl text-text-primary">
                {summary?.totalLogs} Files
              </Text>
              <View className="flex-row gap-x-2 items-center">
                <DynamicIcon
                  family="Feather"
                  name={
                    filesMomGrowth.isNegative ? "trending-down" : "trending-up"
                  }
                  size={22}
                  color="#FFFFFF"
                />
                <Text className="base-paragraph">
                  <Text className="font-bold">{filesMomGrowth.percent}</Text> vs
                  last month
                </Text>
              </View>
            </View>

            <View className="rounded-md flex-col gap-y-4">
              <View className="flex-row items-center justify-between gap-x-3">
                <Text className="text-text-secondary base-bold">
                  Monthly Trends
                </Text>
                <Text className="text-text-secondary text-sm font-bold">
                  LEP Pages
                </Text>
              </View>

              <View className="overflow-hidden">
                <BarChart
                  data={monthlyTotalLepPagesChartData}
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

            {/* Attendance */}
            <View className="rounded-md flex-col gap-y-4">
              <Text className="text-text-secondary base-bold">Attendance</Text>

              <View className="flex-col gap-y-3">
                <View className="flex-row justify-between">
                  {WEEKDAY_LABELS.map((day, index) => (
                    <Text
                      key={`${day}-${index}`}
                      className="basis-0 flex-1 text-center text-text-primary text-xs font-bold"
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                {attendanceRows.map((row, rowIndex) => (
                  <View key={rowIndex} className="flex-row">
                    {WEEKDAY_LABELS.map((_, dayIndex) => {
                      const date = row[dayIndex];
                      const isSunday = checkSunday({
                        date,
                        currentMonth: parseInt(selectedMonth!),
                      });
                      const isDateGreaterThanToday = checkDateGreaterThanToday(
                        date,
                        parseInt(selectedMonth!),
                      );

                      return (
                        <View
                          key={`${rowIndex}-${dayIndex}`}
                          className="basis-0 flex-1 flex-col items-center gap-y-1 min-h-11"
                        >
                          {date && !isSunday && !isDateGreaterThanToday ? (
                            <>
                              <Text className="text-text-primary text-xs font-bold">
                                {date}
                              </Text>
                              <AttendanceIndicator
                                type={
                                  attendanceMap.get(date) === "full"
                                    ? "filled"
                                    : attendanceMap.get(date) === "half"
                                      ? "stripped"
                                      : "outline"
                                }
                              />
                            </>
                          ) : date ? (
                            <Text className="text-text-primary text-xs font-bold">
                              {date}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
              {/* labels */}
              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-center gap-x-2">
                  <AttendanceIndicator type="filled" />
                  <Text className="text-sm text-text-primary">Full Day</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <AttendanceIndicator type="stripped" />
                  <Text className="text-sm text-text-primary">Half Day</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                  <AttendanceIndicator type="outline" />
                  <Text className="text-sm text-text-primary">Absent</Text>
                </View>
              </View>
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
