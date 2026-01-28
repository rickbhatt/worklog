import { getCurrentMonthRange } from "@/lib/utils";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { fileLogs } from "../schema";

interface FileLogsWithFilers {
  db: ExpoSQLiteDatabase;
  filters: {
    journalId?: string | undefined;
    articleId?: string | undefined;
    workedAt?: string | undefined;
    month?: string | undefined;
  };
}

export const getFileLogs = ({ db, filters }: FileLogsWithFilers) => {
  const { start, end } = getCurrentMonthRange();

  const conditions = [
    gte(fileLogs.workedAt, start),
    lte(fileLogs.workedAt, end),
  ];

  if (filters.journalId) {
    conditions.push(eq(fileLogs.journalId, filters.journalId));
  }

  let logs = db
    .select({
      id: fileLogs.id,
      journalId: fileLogs.journalId,
      articleId: fileLogs.articleId,
      timeTaken: fileLogs.timeTaken,
      lepPages: fileLogs.lepPages,
      workedAt: fileLogs.workedAt,
    })
    .from(fileLogs)
    .where(and(...conditions))
    .orderBy(desc(fileLogs.workedAt));

  return logs;
};

export const getFileLogById = async (db: ExpoSQLiteDatabase, id: string) => {
  let [row] = await db.select().from(fileLogs).where(eq(fileLogs.id, id));

  return row;
};
