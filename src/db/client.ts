import { drizzle } from "drizzle-orm/expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";
import * as schema from "./schema";

export function createDrizzleDb(sqliteDb: SQLiteDatabase) {
  // enable FK constraints once
  sqliteDb.execSync("PRAGMA foreign_keys = ON");

  return drizzle(sqliteDb, { schema });
}
