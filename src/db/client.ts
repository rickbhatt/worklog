import migrations from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { type SQLiteDatabase } from "expo-sqlite";
import * as schema from "./schema";

let sqliteInstance: SQLiteDatabase | null = null;

export const registerDbInstance = (sqliteDb: SQLiteDatabase) => {
  sqliteInstance = sqliteDb;
};

export const getDbInstance = () => {
  if (!sqliteInstance) {
    throw new Error("SQLite instance has not been registered");
  }
  return sqliteInstance;
};

export const closeDb = async () => {
  if (!sqliteInstance) return;
  console.log("closeDb: closing");
  try {
    await sqliteInstance.execAsync("PRAGMA wal_checkpoint(FULL);");
    await sqliteInstance.closeAsync();
    console.log("closeDb: closed");
  } finally {
    sqliteInstance = null;
  }
};

export const createDrizzleInstance = (sqliteDb: SQLiteDatabase) =>
  drizzle(sqliteDb, { schema });

export const initialiseDb = async (sqliteDb: SQLiteDatabase) => {
  console.log("initialiseDb: start");
  registerDbInstance(sqliteDb);

  try {
    await sqliteDb.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
    `);
    const db = createDrizzleInstance(sqliteDb);
    await migrate(db, migrations);
    console.log("initialiseDb: done");
  } catch (e) {
    console.error("initialiseDb: FAILED", e);
    throw e;
  }
};
