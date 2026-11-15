import FilterLogsBottomSheetModal from "@/components/bottomsheets/filter-logs-bottomsheet";
import LoadingScreen from "@/components/loading-screen";
import LogCard from "@/components/log-card";
import MonthPill from "@/components/month-pill";
import { TabTitle } from "@/components/screen-header";
import { useTabBarClearance } from "@/components/tab-bar";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/pill";
import { Screen } from "@/components/ui/screen";
import {
  getFileLogs,
  getLatestTargetHour,
} from "@/db/queries/fileworklog.queries";
import { useDb } from "@/hooks/useDb";
import { useDebounce } from "@/hooks/useDebounce";
import { calcTargetPagePercent, formatDayLabel, getMonthRange } from "@/lib/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useLocalSearchParams, useRouter } from "expo-router";

import { FlatList } from "@/components/ui/gesture-scroll";
import { Search } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { FileLogsListItemType, FileLogsSection } from "type";

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

  const [query, setQuery] = useState<string | null>(null);

  const debouncedQuery = useDebounce({ value: query });

  const router = useRouter();

  const onSelectChange = (value: string | number) => {
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

  useEffect(() => {
    if (debouncedQuery !== null) {
      if (debouncedQuery === "") {
        const monthRange = getMonthRange(
          selectedMonth!,
          currentYear.toString(),
        );
        router.replace({
          pathname: "/(tabs)",
          params: {
            startDate: monthRange.start,
            endDate: monthRange.end,
          },
        });
      }

      if (!debouncedQuery.includes("-")) return;

      const [journalId, articleId] = debouncedQuery.split("-");
      if (!articleId) return;

      router.replace({
        pathname: "/(tabs)",
        params: {
          journalId,
          articleId,
        },
      });
    }
  }, [debouncedQuery]);

  return (
    <View className="gap-5 pb-1">
      <TabTitle
        title="History"
        right={<MonthPill month={selectedMonth} onChange={onSelectChange} />}
      />
      <Input
        left={
          <Icon
            as={Search}
            size={18}
            strokeWidth={1.8}
            className="text-muted"
          />
        }
        accessibilityLabel="Search logs"
        placeholder="Search JournalID-ArticleID"
        value={query ?? ""}
        onChangeText={setQuery}
        maxLength={10}
        autoCapitalize="characters"
        returnKeyType="search"
        containerClassName="h-[50px] rounded-2xl"
        className="font-inter text-[15px]"
      />
    </View>
  );
};

/** One day: label, page total + status pill, then all entries in one card. */
const DayGroup = ({
  section,
  targetLepPages,
}: {
  section: FileLogsSection;
  targetLepPages: number;
}) => {
  const percent = Number(
    calcTargetPagePercent({
      targetLepPages: targetLepPages ?? 0,
      lepPages: section?.totalLepPages ?? 0,
    }),
  );

  return (
    <View className="mt-1 gap-2.5">
      <View className="flex-row items-center justify-between px-1">
        <Text accessibilityRole="header" className="section-title">
          {formatDayLabel(section.title)}
        </Text>
        <View className="flex-row items-center gap-2.5">
          <View className="flex-row items-baseline gap-1">
            <Text className="number text-[17px]">{section.totalLepPages}</Text>
            <Text className="font-inter-medium text-xs leading-4 text-muted">
              pages
            </Text>
          </View>
          <StatusPill percent={percent} />
        </View>
      </View>
      <Card className="overflow-hidden rounded-[18px]">
        {section.data.map((item: FileLogsListItemType, index: number) => (
          <View key={item.id} className={index > 0 ? "border-t border-line" : ""}>
            <LogCard item={item} />
          </View>
        ))}
      </Card>
    </View>
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

  // get current month and year for default filter values in ListHeader
  const currentMonth = new Date().getMonth() + 1;

  const currentYear = new Date().getFullYear();

  // check if any filter param is present
  const isParams =
    journalId !== undefined ||
    articleId !== undefined ||
    startDate !== undefined ||
    endDate !== undefined;

  const db = useDb();

  const router = useRouter();

  const { data: logs } = useLiveQuery(
    getFileLogs({
      db,
      filters: { journalId, articleId, startDate, endDate },
    }),

    [journalId, articleId, startDate, endDate], //deps: re-run live query when filters change
  );

  const { data: targetData } = useLiveQuery(getLatestTargetHour(db));

  const filterBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const bottomClearance = useTabBarClearance();

  const fileLogsGroupedByWorkedAt = useMemo<FileLogsSection[]>(() => {
    if (!logs) return [];

    const groupedLogs = logs.reduce(
      (map: Map<string, FileLogsSection>, log: FileLogsListItemType) => {
        if (!map.has(log.workedAt)) {
          map.set(log.workedAt, {
            title: log.workedAt,
            totalLepPages: 0,
            data: [],
          });
        }

        const section = map.get(log.workedAt)!;
        section.data.push(log);
        if (!log.isQcFile && !log.isMdc) section.totalLepPages += log.lepPages;
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
      const monthRange = getMonthRange(
        currentMonth.toString(),
        currentYear.toString(),
      );

      router.replace({
        pathname: "/(tabs)",
        params: {
          startDate: monthRange.start,
          endDate: monthRange.end,
        },
      });
    }
  }, [isParams, router]);

  if (!isParams) {
    return <LoadingScreen />;
  }
  return (
    <>
      <Screen>
        <FlatList
          data={fileLogsGroupedByWorkedAt}
          keyExtractor={(section) => section.title}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: section }) => (
            <DayGroup
              section={section}
              targetLepPages={targetData[0]?.targetLepPages || 0}
            />
          )}
          ListHeaderComponent={
            <ListHeader
              currentMonth={currentMonth}
              currentYear={currentYear}
              bottomSheetRef={filterBottomSheetModalRef}
            />
          }
          ListEmptyComponent={
            logs ? (
              <Text className="caption pt-10 text-center">
                No logs to show here yet
              </Text>
            ) : null
          }
          contentContainerClassName="gap-5 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: bottomClearance }}
        />
      </Screen>
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
