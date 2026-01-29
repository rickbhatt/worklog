import DynamicIcon from "@/components/dynamic-icon";
import FilterLogsBottomSheetModal from "@/components/filter-logs-bottomsheet";
import LogCard from "@/components/log-card";
import ScreenHeader from "@/components/screen-header";
import { getFileLogs } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { cn, formatDateTime, getCurrentDate } from "@/lib/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Tabs, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef } from "react";
import { SectionList, Text, View } from "react-native";
import { FileLogsSection, FileLogsSelectType, ScreenHeaderProps } from "type";

const ListHeader = ({
  isParams,
  dataLength,
}: {
  isParams: boolean;
  dataLength: number;
}) => {
  return (
    <View>
      {isParams ? (
        <Text className={cn("base-paragraph", "text-text-secondary")}>
          {dataLength} log{dataLength !== 1 ? "s" : ""} found with applied
          filters
        </Text>
      ) : (
        <></>
      )}
    </View>
  );
};

const SectionHeader = ({ section }: { section: FileLogsSection }) => {
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
  const { journalId, articleId, startDate, endDate } = useLocalSearchParams<{
    journalId?: string;
    articleId?: string;
    startDate?: string;
    endDate?: string;
  }>();
  console.log("🚀 ~ History ~ endDate:", endDate);
  console.log("🚀 ~ History ~ startDate:", startDate);

  // check if any filter param is present
  const isParams =
    (journalId || articleId || startDate || endDate) !== undefined;

  const db = useDb();

  const { data: logs, error } = useLiveQuery(
    getFileLogs({
      db,
      filters: { journalId, articleId, startDate, endDate },
    }),
    [journalId, articleId, startDate, endDate], //deps: re-run live query when filters change
  );
  // console.log("🚀 ~ History ~ logs:", logs);
  const filterBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const SCREEN_HEADER_RIGHT_BUTTONS: ScreenHeaderProps["rightButtons"] = [
    {
      name: "filter",
      icon: (
        <DynamicIcon
          family="FontAwesome"
          name="filter"
          size={20}
          color="#FFFFFF"
        />
      ),
      onPress: () => filterBottomSheetModalRef.current?.present(),
    },
  ];

  const fileLogsGroupedByWorkedAt = useMemo(() => {
    if (!logs) return [];

    const groupedLogs = logs.reduce((map, log) => {
      if (!map.has(log.workedAt)) {
        map.set(log.workedAt, {
          title: log.workedAt,
          totalLepPages: 0,
          data: [],
        });
      }

      const section = map.get(log.workedAt);
      section.data.push(log);
      section.totalLepPages += log.lepPages;
      return map;
    }, new Map());

    return Array.from(groupedLogs.values()).sort((a, b) =>
      b.title.localeCompare(a.title),
    );
  }, [logs]);

  return (
    <>
      <Tabs.Screen
        options={{
          headerShown: true,
          header: () => (
            <ScreenHeader
              title="History"
              rightButtons={SCREEN_HEADER_RIGHT_BUTTONS}
            />
          ),
        }}
      />

      <SectionList
        sections={fileLogsGroupedByWorkedAt}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <SectionHeader section={section} />
        )}
        ListHeaderComponent={
          <ListHeader isParams={isParams} dataLength={logs?.length ?? 0} />
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
