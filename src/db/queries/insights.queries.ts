import { fileLogs } from "@/db/schema";
import { getMonthRange } from "@/lib/utils";
import { and, count, gte, lte, sql } from "drizzle-orm";
import { Db } from "type";

export const getInsightsQuery = ({ db, month }: { db: Db; month: string }) => {
  const currentYear = new Date().getFullYear();

  const { start, end } = getMonthRange(month, currentYear.toString());

  return db
    .select({
      totalLogs: count(),

      smlCount: sql<number>`
        sum(case when ${fileLogs.isSml} = 1 then 1 else 0 end)
      `,

      manualCount: sql<number>`
        sum(case when ${fileLogs.isSml} = 0 then 1 else 0 end)
      `,
    })
    .from(fileLogs)
    .where(and(gte(fileLogs.workedAt, start), lte(fileLogs.workedAt, end)));
};
