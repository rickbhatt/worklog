import { drizzle } from "drizzle-orm/expo-sqlite";
import { type SQLiteDatabase } from "expo-sqlite";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof createDrizzleDb>;

let _sqliteDb: SQLiteDatabase | null = null;
let _db: DrizzleDb | null = null;

export function createDrizzleDb(sqliteDb: SQLiteDatabase) {
  sqliteDb.execSync("PRAGMA foreign_keys = ON");
  return drizzle(sqliteDb, { schema });
}

export function initDb(sqliteDb: SQLiteDatabase): DrizzleDb {
  if (!_db || _sqliteDb !== sqliteDb) {
    _sqliteDb = sqliteDb;
    _db = createDrizzleDb(sqliteDb);
  }
  return _db;
}

export function getDb(): DrizzleDb {
  if (!_db) throw new Error("DB not initialized — call initDb first");
  return _db;
}
