import { asc, count, sql } from "drizzle-orm";
import type { Db } from "type";

import { fileLogs, journals } from "../schema";

/**
 * Saved Journal IDs that contain the typed text, prefix matches first.
 * Returns an empty list for blank input.
 *
 * LIKE wildcards in the typed text are escaped with "!". A backslash can't be
 * used: drizzle's sql tag reads the raw template text, so an escaped backslash
 * reaches SQLite as two characters.
 */
export const searchJournalIds = async (db: Db, query: string, limit = 6) => {
  const q = query.trim().toUpperCase().replace(/[!%_]/g, "!$&");
  if (!q) return [];

  const rows = await db
    .select({ journalId: journals.journalId })
    .from(journals)
    .where(sql`${journals.journalId} LIKE ${`%${q}%`} ESCAPE '!'`)
    .orderBy(
      sql`CASE WHEN ${journals.journalId} LIKE ${`${q}%`} ESCAPE '!' THEN 0 ELSE 1 END`,
      asc(journals.journalId),
    )
    .limit(limit);

  return rows.map((r) => r.journalId);
};

/** All saved Journal IDs, A–Z, with how many logs use each one. */
export const getJournalIdsWithLogCount = (db: Db) =>
  db
    .select({
      journalId: journals.journalId,
      logCount: count(fileLogs.id),
    })
    .from(journals)
    .leftJoin(
      fileLogs,
      sql`upper(trim(${fileLogs.journalId})) = ${journals.journalId}`,
    )
    .groupBy(journals.journalId)
    .orderBy(asc(journals.journalId));
