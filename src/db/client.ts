import migrations from "@/drizzle/migrations";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { type SQLiteDatabase } from "expo-sqlite";
import * as schema from "./schema";

export const createDrizzleInstance = (sqliteDb: SQLiteDatabase) =>
  drizzle(sqliteDb, { schema });

export const initialiseDb = async (sqliteDb: SQLiteDatabase) => {
  await sqliteDb.execAsync("PRAGMA foreign_keys = ON;");
  const db = createDrizzleInstance(sqliteDb);
  await migrate(db, migrations);
};
