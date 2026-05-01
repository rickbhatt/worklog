import { initDb } from "@/db/client";
import { useSQLiteContext } from "expo-sqlite";

export function useDb() {
  const sqliteDb = useSQLiteContext();
  return initDb(sqliteDb);
}
