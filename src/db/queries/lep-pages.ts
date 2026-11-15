import { fileLogs } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * Sum of LEP pages that count toward totals. QC and MDC logs are recorded but
 * their pages are excluded from history and insights LEP counts.
 */
export const countedLepPagesSum = sql<number>`sum(case when ${fileLogs.isQcFile} = 0 and ${fileLogs.isMdc} = 0 then ${fileLogs.lepPages} else 0 end)`;
