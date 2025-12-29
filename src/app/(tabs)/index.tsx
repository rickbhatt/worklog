import DynamicIcon from "@/components/dynamic-icon";
import LogCard from "@/components/log-card";
import ScreenHeader from "@/components/screen-header";
import { getFileLogsForCurrentMonth } from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { formatDateTime, getCurrentDate } from "@/lib/utils";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { SectionList, Text, View } from "react-native";
import { FileLogsSection, FileLogsSelectType } from "type";

const ListHeader = () => {
  return <Text className="text-text-primary">List Header</Text>;
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
  const db = useDb();

  const { data: logs, error } = useLiveQuery(getFileLogsForCurrentMonth(db));

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
      b.title.localeCompare(a.title)
    );
  }, [logs]);

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
        ListHeaderComponent={() => <ListHeader />}
        renderSectionHeader={({ section }) => (
          <SectionHeader section={section} />
        )}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SectionItem item={item} />}
        className="bg-bg-primary flex-1 screen-x-padding"
      />
    </>
  );
};

export default History;
