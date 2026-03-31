import DynamicIcon from "@/components/dynamic-icon";
import FilterLogsBottomSheetModal from "@/components/filter-logs-bottomsheet";
import FormInput from "@/components/form-input";
import LoadingScreen from "@/components/loading-screen";
import LogCard from "@/components/log-card";
import ScreenHeader from "@/components/screen-header";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/constants";
import {
  getFileLogs,
  getLatestTargetHour,
} from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import {
  calcTargetPagePercent,
  formatDateTime,
  getCurrentDate,
  getMonthRange,
} from "@/lib/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { SectionList, Text, View } from "react-native";
import { FieldName, FileLogsSection, FileLogsSelectType } from "type";

const ListHeader = ({
  currentMonth,
  currentYear,
  bottomSheetRef,
}: {
  currentMonth: number;
  currentYear: number;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(
    currentMonth.toString(),
  );

  const router = useRouter();

  const onSelectChange = (name: FieldName, value: string | number) => {
    setSelectedMonth(value.toString());

    const monthRange = getMonthRange(value.toString(), currentYear.toString());
    router.replace({
      pathname: "/(tabs)",
      params: {
        startDate: monthRange.start,
        endDate: monthRange.end,
      },
    });
  };

  return (
    <View className="flex-row items-center justify-between">
      <FormInput
        onChange={onSelectChange}
        name="month"
        inputType="select"
        placeholder="Select a month"
        selectOptions={MONTHS}
        value={selectedMonth}
      />
      <Button
        className="w-12 h-12 rounded-full border border-border"
        variant={"iconOnly"}
        onPress={() => bottomSheetRef.current?.present()}
      >
        <DynamicIcon
          family="FontAwesome"
          name="filter"
          size={20}
          color="#FFFFFF"
        />
      </Button>
    </View>
  );
};

const SectionHeader = ({
  section,
  targetInfo,
}: {
  section: FileLogsSection;
  targetInfo: any;
}) => {
  const currentDateString = getCurrentDate();

  const isToday = section.title === currentDateString;

  const currentDateObj = new Date(currentDateString);

  currentDateObj.setDate(currentDateObj.getDate() - 1);

  const yesterdayDateString = formatDateTime(currentDateObj).dateToISOString;

  const isYesterday = section.title === yesterdayDateString;

  return (
    <View className="mt-3 flex-row justify-between items-center">
      {/* date */}
      <View className="flex-row gap-x-2 items-center py-3">
        <DynamicIcon
          family="FontAwesome"
          name="calendar-o"
          color="#c3c3c3"
          size={20}
        />
        <Text className="text-text-secondary h3-bold">
          {isToday
            ? "Today"
            : isYesterday
              ? "Yesterday"
              : formatDateTime(section.title).shortDateWithYear}
        </Text>
      </View>
      {/* total lepPages */}
      <View className="flex-row items-center gap-x-2">
        <DynamicIcon
          family="Foundation"
          name="page"
          size={20}
          color="#c3c3c3"
        />
        <Text className="h3-bold text-text-secondary">
          {section.totalLepPages}
        </Text>
        <Text className="h3-bold text-text-secondary">
          |{" "}
          {calcTargetPagePercent({
            targetLepPages: targetInfo.targetLepPages,
            lepPages: section.totalLepPages,
          })}
          %
        </Text>
      </View>
    </View>
  );
};

const SectionItem = ({ item }: { item: FileLogsSelectType }) => {
  return (
    <LogCard
      id={item.id}
      journalId={item.journalId}
      articleId={item.articleId}
      lepPages={item.lepPages}
    />
  );
};

const History = () => {
  //! might revisit the logic of initial redirection with params
  const { journalId, articleId, startDate, endDate } = useLocalSearchParams<{
    journalId?: string;
    articleId?: string;
    startDate?: string;
    endDate?: string;
  }>();

  const [targetInfo, setTargetInfo] = useState(null);

  // get current month and year for default filter values in ListHeader
  const currentMonth = new Date().getMonth() + 1;

  const currentYear = new Date().getFullYear();

  const monthRange = getMonthRange(
    currentMonth.toString(),
    currentYear.toString(),
  );

  // check if any filter param is present
  const isParams =
    journalId !== undefined ||
    articleId !== undefined ||
    startDate !== undefined ||
    endDate !== undefined;

  const db = useDb();

  const router = useRouter();

  const { data: logs, error } = useLiveQuery(
    getFileLogs({
      db,
      filters: { journalId, articleId, startDate, endDate },
    }),

    [journalId, articleId, startDate, endDate], //deps: re-run live query when filters change
  );
  // console.log("🚀 ~ History ~ logs:", logs);
  const filterBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const fileLogsGroupedByWorkedAt = useMemo<FileLogsSection[]>(() => {
    if (!logs) return [];

    const groupedLogs = logs.reduce(
      (map: Map<string, FileLogsSection>, log: FileLogsSelectType) => {
        if (!map.has(log.workedAt)) {
          map.set(log.workedAt, {
            title: log.workedAt,
            totalLepPages: 0,
            data: [],
          });
        }

        const section = map.get(log.workedAt)!;
        section.data.push(log);
        section.totalLepPages += log.lepPages;
        return map;
      },
      new Map<string, FileLogsSection>(),
    );

    return Array.from<FileLogsSection>(groupedLogs.values()).sort((a, b) =>
      b.title.localeCompare(a.title),
    );
  }, [logs]);

  useEffect(() => {
    if (!isParams) {
      router.replace({
        pathname: "/(tabs)",
        params: {
          startDate: monthRange.start,
          endDate: monthRange.end,
        },
      });
    }
  }, [isParams, router, monthRange.start, monthRange.end]);

  const latestTargetInfo = async () => {
    const [row] = await getLatestTargetHour(db);

    setTargetInfo(row);
  };

  useEffect(() => {
    latestTargetInfo();
  }, []);

  if (!isParams) {
    return <LoadingScreen />;
  }
  return (
    <>
      <Tabs.Screen
        options={{
          headerShown: true,
          header: () => <ScreenHeader title="History" />,
        }}
      />

      <SectionList
        sections={fileLogsGroupedByWorkedAt}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <SectionHeader section={section} targetInfo={targetInfo} />
        )}
        ListHeaderComponent={
          <ListHeader
            currentMonth={currentMonth}
            currentYear={currentYear}
            bottomSheetRef={filterBottomSheetModalRef}
          />
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SectionItem item={item} />}
        className="bg-bg-primary flex-1 screen-x-padding"
      />
      <FilterLogsBottomSheetModal
        journalId={journalId}
        articleId={articleId}
        startDate={startDate}
        endDate={endDate}
        ref={filterBottomSheetModalRef}
      />
    </>
  );
};

export default History;
