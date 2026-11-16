import AttendanceIndicator, {
  AttendanceType,
} from "@/components/attendance-indicator";
import MonthPill from "@/components/month-pill";
import { TabTitle } from "@/components/screen-header";
import { useTabBarClearance } from "@/components/tab-bar";
import { Card, HeroCard } from "@/components/ui/card";
import { ScrollView } from "@/components/ui/gesture-scroll";
import { Icon } from "@/components/ui/icon";
import { Screen } from "@/components/ui/screen";
import { MONTH_NAMES, MONTHS, WEEKDAY_LABELS } from "@/constants";
import { getAttendanceOverridesForMonth } from "@/db/queries/attendance.queries";
import {
  getLatestTargetHour,
  getPreviousMonthSummary,
} from "@/db/queries/fileworklog.queries";
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
  cn,
  formatDateTime,
} from "@/lib/utils";
import { useTheme } from "@/theme/theme-provider";
import { getDaysInMonth } from "date-fns";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const CHART_HEIGHT = 150;
const CHART_SPACING = 6;

const LEGEND = [
  ["full", "Full day"],
  ["half", "Half day"],
  ["absent", "Absent"],
] as const;

const Insights = () => {
  const db = useDb();

  const { colors } = useTheme();

  const bottomClearance = useTabBarClearance();

  const [chartWidth, setChartWidth] = useState(0);

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

  const { data: targetData } = useLiveQuery(getLatestTargetHour(db), []);
  const targetLEP = targetData[0]?.targetLepPages ?? 60;

  const lepMomGrowth = calcMomGrowthPercent({
    currentTotal: summary?.totalLepPages,
    previousTotal: previousMonthSummary[0]?.totalLepPages,
  });
  const filesMomGrowth = calcMomGrowthPercent({
    currentTotal: summary?.totalLogs,
    previousTotal: previousMonthSummary[0]?.totalLogs,
  });

  // 12 bars fill the card's inner width
  const chartBarWidth = chartWidth
    ? Math.max(
        Math.floor((chartWidth - CHART_SPACING * 11) / MONTHS.length),
        8,
      )
    : 16;

  const monthlyTotalLepPagesChartData = useMemo(() => {
    const monthlyTotals = new Map(
      monthlyTotalLepPages.map((item) => [
        item.month.toString(),
        item.totalLepPages,
      ]),
    );

    return MONTHS.map((month) => {
      const isSelectedMonth = month.value === selectedMonth;

      return {
        value: monthlyTotals.get(month.value) ?? 0,
        label: month.label.slice(0, 3),
        frontColor: isSelectedMonth ? colors.accent : colors.barInactive,
        labelTextStyle: {
          color: isSelectedMonth ? colors.accent : colors.muted,
          fontFamily: isSelectedMonth ? "Inter_600SemiBold" : "Inter_500Medium",
          fontSize: 10,
          textAlign: "center" as const,
        },
      };
    });
  }, [selectedMonth, monthlyTotalLepPages, colors]);

  const { data: attendanceDatesData } = useLiveQuery(
    getAttendanceDatesQuery({ db, month: selectedMonth!, targetLEP }),
    [selectedMonth, targetLEP],
  );

  // fetched separately from attendanceDatesData — useLiveQuery only tracks
  // change events for a query's FROM table, so joining this into the query
  // above would never refetch when an override is saved
  const { data: attendanceOverridesData } = useLiveQuery(
    getAttendanceOverridesForMonth({ db, month: selectedMonth! }),
    [selectedMonth],
  );

  const attendanceMap = useMemo(() => {
    const map = new Map(
      attendanceDatesData.map((item) => [item.date, item.type]),
    );

    // manual overrides win over the dynamic calculation
    attendanceOverridesData.forEach((override) => {
      const day = Number(override.date.split("-")[2]);
      map.set(day, override.type);
    });

    return map;
  }, [attendanceDatesData, attendanceOverridesData]);

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

  const getIsoDateForDay = (day: number) => {
    const selectedYear = new Date().getFullYear();
    const selectedMonthIndex = Number(selectedMonth) - 1;

    return formatDateTime(new Date(selectedYear, selectedMonthIndex, day))
      .dateToISOString;
  };

  const isFutureDay = (date: number) =>
    !!checkDateGreaterThanToday(date, parseInt(selectedMonth!));

  // Past working days come from the logs (no logs = absent, as before);
  // Sundays and future days have no data, so they get an empty box.
  const getDayType = (date: number): AttendanceType => {
    const isSunday = checkSunday({
      date,
      currentMonth: parseInt(selectedMonth!),
    });
    if (isSunday || isFutureDay(date)) return "empty";
    const type = attendanceMap.get(date);
    return type === "full" || type === "half" ? type : "absent";
  };

  const attendanceSummary = { full: 0, half: 0, absent: 0 };
  calendarDates.forEach((date) => {
    if (!date) return;
    const type = getDayType(date);
    if (type !== "empty") attendanceSummary[type] += 1;
  });

  const now = new Date();
  const isCurrentMonth = Number(selectedMonth) === now.getMonth() + 1;
  const daysInSelectedMonth = getDaysInMonth(
    new Date(now.getFullYear(), Number(selectedMonth) - 1),
  );
  const previousMonthShort = MONTHS[(Number(selectedMonth) + 10) % 12].label.slice(
    0,
    3,
  );

  const header = (
    <TabTitle
      title="Insights"
      right={
        <MonthPill
          month={selectedMonth}
          onChange={(value) => setSelectedMonth(value)}
        />
      }
    />
  );

  return (
    <Screen>
      {summary?.totalLogs > 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-col gap-4 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: bottomClearance }}
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-1">{header}</View>

          {/* LEP pages */}
          <HeroCard className="gap-2.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-inter-medium text-sm text-white/85">
                Total LEP pages
              </Text>
              <View className="flex-row items-center gap-1 rounded-lg bg-white/20 px-2 py-1">
                <Icon
                  as={lepMomGrowth.isNegative ? TrendingDown : TrendingUp}
                  size={14}
                  strokeWidth={2.2}
                  className="text-white"
                />
                <Text className="font-inter-semibold text-xs tabular-nums text-white">
                  {lepMomGrowth.percent} vs {previousMonthShort}
                </Text>
              </View>
            </View>
            <Text className="font-manrope-extrabold text-[64px] leading-[68px] tracking-[-1.9px] tabular-nums text-white">
              {summary?.totalLepPages}
            </Text>
            <Text className="font-inter text-[13px] text-white/85">
              {isCurrentMonth
                ? `Month in progress · ${now.getDate()} of ${daysInSelectedMonth} days`
                : `${MONTH_NAMES[selectedMonth!]} · ${daysInSelectedMonth} days`}
            </Text>
          </HeroCard>

          {/* sml and manual */}
          <View className="flex-row gap-3">
            {[
              { label: "SML files", value: summary?.smlCount, dot: "bg-accent" },
              {
                label: "MNL files",
                value: summary?.manualCount,
                dot: "bg-success",
              },
            ].map((stat) => (
              <Card key={stat.label} className="flex-1 basis-0 gap-2 p-[18px]">
                <View className="flex-row items-center gap-2">
                  <View className={cn("h-2 w-2 rounded-full", stat.dot)} />
                  <Text className="font-inter-medium text-[13px] text-muted">
                    {stat.label}
                  </Text>
                </View>
                <Text className="font-manrope-extrabold text-[40px] leading-[44px] tabular-nums text-foreground">
                  {stat.value ?? 0}
                </Text>
              </Card>
            ))}
          </View>

          {/* files */}
          <View className="flex-row items-center justify-between rounded-2xl bg-raised px-[18px] py-3.5">
            <Text className="font-inter-semibold text-sm text-foreground">
              {summary?.totalLogs} {summary?.totalLogs === 1 ? "file" : "files"}{" "}
              {isCurrentMonth
                ? "this month"
                : `in ${MONTH_NAMES[selectedMonth!]}`}
            </Text>
            <View className="flex-row items-center gap-1">
              <Icon
                as={filesMomGrowth.isNegative ? TrendingDown : TrendingUp}
                size={14}
                strokeWidth={2.2}
                className={
                  filesMomGrowth.isNegative ? "text-warning" : "text-success"
                }
              />
              <Text
                className={cn(
                  "font-inter-semibold text-[13px] tabular-nums",
                  filesMomGrowth.isNegative ? "text-warning" : "text-success",
                )}
              >
                {filesMomGrowth.percent} vs {previousMonthShort}
              </Text>
            </View>
          </View>

          {/* monthly trend */}
          <Card className="gap-[18px] rounded-[24px] p-5">
            <View className="flex-row items-center justify-between">
              <Text accessibilityRole="header" className="section-title">
                Monthly trend
              </Text>
              <Text className="font-inter-semibold text-xs text-muted">
                LEP pages · {now.getFullYear()}
              </Text>
            </View>

            <View
              className="overflow-hidden"
              accessible
              accessibilityLabel={`Bar chart of LEP pages per month in ${now.getFullYear()}`}
              onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
            >
              {chartWidth > 0 && (
                <BarChart
                  data={monthlyTotalLepPagesChartData}
                  height={CHART_HEIGHT}
                  minHeight={3}
                  barWidth={chartBarWidth}
                  spacing={CHART_SPACING}
                  initialSpacing={0}
                  endSpacing={0}
                  disableScroll
                  hideRules
                  hideYAxisText
                  yAxisLabelWidth={0}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  backgroundColor="transparent"
                  noOfSections={3}
                  barBorderRadius={6}
                  labelWidth={chartBarWidth + CHART_SPACING}
                  xAxisTextNumberOfLines={1}
                  xAxisLabelsHeight={20}
                  labelsDistanceFromXaxis={6}
                />
              )}
            </View>
          </Card>

          {/* attendance */}
          <Card className="gap-4 rounded-[24px] p-5">
            <View className="flex-row items-center justify-between">
              <Text accessibilityRole="header" className="section-title">
                Attendance
              </Text>
              <Text className="font-inter-semibold text-xs tabular-nums text-muted">
                {attendanceSummary.full} full · {attendanceSummary.half} half ·{" "}
                {attendanceSummary.absent} absent
              </Text>
            </View>

            <View className="flex-col gap-1">
              <View className="flex-row pb-1.5">
                {WEEKDAY_LABELS.map((day, index) => (
                  <Text
                    key={`${day}-${index}`}
                    className="flex-1 basis-0 text-center font-inter-semibold text-[11px] tracking-[0.44px] text-muted"
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {attendanceRows.map((row, rowIndex) => (
                <View key={rowIndex} className="flex-row">
                  {WEEKDAY_LABELS.map((_, dayIndex) => {
                    const date = row[dayIndex];
                    const key = `${rowIndex}-${dayIndex}`;

                    if (!date) {
                      return <View key={key} className="flex-1 basis-0" />;
                    }

                    const type = getDayType(date);

                    return (
                      <View
                        key={key}
                        className="flex-1 basis-0 items-center gap-[5px] py-1"
                      >
                        <View className="h-[22px] w-[26px] items-center justify-center">
                          <Text
                            className={cn(
                              "font-inter-semibold text-[13px] tabular-nums",
                              isFutureDay(date)
                                ? "text-muted"
                                : "text-foreground",
                            )}
                          >
                            {date}
                          </Text>
                        </View>
                        <AttendanceIndicator
                          type={type}
                          date={
                            type === "empty"
                              ? undefined
                              : getIsoDateForDay(date)
                          }
                        />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* legend */}
            <View className="flex-row gap-[18px] pt-1">
              {LEGEND.map(([type, label]) => (
                <View key={type} className="flex-row items-center gap-1.5">
                  <AttendanceIndicator type={type} size={14} />
                  <Text className="font-inter text-xs text-muted">{label}</Text>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      ) : (
        <View className="flex-1 px-5 pt-4">
          {header}
          <View className="flex-1 items-center justify-center">
            <Text className="body text-center text-muted">
              There are no insights yet for {MONTH_NAMES[selectedMonth!]}
            </Text>
          </View>
        </View>
      )}
    </Screen>
  );
};

export default Insights;
