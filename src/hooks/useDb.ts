import { createDrizzleDb } from "@/db/client";
import { useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

export function useDb() {
  const sqliteDb = useSQLiteContext();
  return useMemo(() => createDrizzleDb(sqliteDb), [sqliteDb]);
}
