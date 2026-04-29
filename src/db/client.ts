import { DB_NAME } from "@/constants";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import * as schema from "./schema";

// Single shared instance — created once, reused everywhere
let _db: ReturnType<typeof createDrizzleDb> | null = null;

export function createDrizzleDb(sqliteDb: SQLiteDatabase) {
  // enable FK constraints once
  sqliteDb.execSync("PRAGMA foreign_keys = ON");

  return drizzle(sqliteDb, { schema });
}
export function getDb(): ReturnType<typeof createDrizzleDb> {
  if (!_db) {
    const sqliteDb = openDatabaseSync(DB_NAME);
    _db = createDrizzleDb(sqliteDb);
  }
  return _db;
}
