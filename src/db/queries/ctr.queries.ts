import { ctrLogs } from "@/db/models/ctr.schema";
import { and, gte, lte } from "drizzle-orm";
import type { Db } from "type";

/** CTR logs in the date range (all of them when no range is given). */
export const getCtrLogs = ({
  db,
  startDate,
  endDate,
}: {
  db: Db;
  startDate?: string;
  endDate?: string;
}) =>
  db
    .select()
    .from(ctrLogs)
    .where(
      startDate && endDate
        ? and(gte(ctrLogs.workedAt, startDate), lte(ctrLogs.workedAt, endDate))
        : undefined,
    );
