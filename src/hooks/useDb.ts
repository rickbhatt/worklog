import { createDrizzleInstance } from "@/db/client";
import { useSQLiteContext } from "expo-sqlite";

export const useDb = () => {
  const sqliteDb = useSQLiteContext();
  return createDrizzleInstance(sqliteDb);
};
