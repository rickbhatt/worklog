import { getCurrentMonthRange } from "@/lib/utils";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import type { Db } from "type";

import { fileLogs, targetInfo } from "../schema";

interface FileLogsWithFilers {
  db: Db;
  filters: {
    journalId?: string | undefined;
    articleId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
  };
}

export const getFileLogs = ({ db, filters }: FileLogsWithFilers) => {
  const { start, end } = getCurrentMonthRange();

  const conditions = [];

  if (filters.startDate && filters.endDate) {
    conditions.push(gte(fileLogs.workedAt, filters.startDate));
    conditions.push(lte(fileLogs.workedAt, filters.endDate));
  } else {
    conditions.push(gte(fileLogs.workedAt, start), lte(fileLogs.workedAt, end));
  }

  if (filters.journalId) {
    conditions.push(eq(fileLogs.journalId, filters.journalId));
  }

  if (filters.articleId) {
    conditions.push(eq(fileLogs.articleId, filters.articleId));
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

export const getFileLogById = async (db: Db, id: string) => {
  let [row] = await db.select().from(fileLogs).where(eq(fileLogs.id, id));

  return row;
};

export const getTargetHour = (db: Db) => {
  const latestRow = db
    .select()
    .from(targetInfo)
    .orderBy(desc(targetInfo.createdAt));

  return latestRow;
};

export const getLatestTargetHour = (db: Db) => {
  const row = db
    .select()
    .from(targetInfo)
    .orderBy(desc(targetInfo.createdAt))
    .limit(1);

  return row;
};
