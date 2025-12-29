import { getCurrentMonthRange } from "@/lib/utils";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { fileLogs } from "../schema";

export const getFileLogsForCurrentMonth = (db: ExpoSQLiteDatabase) => {
  const { start, end } = getCurrentMonthRange();

  return db
    .select({
      id: fileLogs.id,
      journalId: fileLogs.journalId,
      articleId: fileLogs.articleId,
      timeTaken: fileLogs.timeTaken,
      lepPages: fileLogs.lepPages,
      workedAt: fileLogs.workedAt,
    })
    .from(fileLogs)
    .where(and(gte(fileLogs.workedAt, start), lte(fileLogs.workedAt, end)))
    .orderBy(desc(fileLogs.workedAt));
};

export const getFileLogById = async (db: ExpoSQLiteDatabase, id: string) => {
  let [row] = await db.select().from(fileLogs).where(eq(fileLogs.id, id));

  return row;
};
