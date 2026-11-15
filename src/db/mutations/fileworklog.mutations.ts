import { fileLogs, targetInfo } from "@/db/models/log.schema";
import { saveJournalIds } from "@/db/mutations/journal.mutations";
import { formatDateTime } from "@/lib/utils";
import { and, eq, ne, sql } from "drizzle-orm";

import * as Crypto from "expo-crypto";
import {
  Db,
  FileLogsCreateInput,
  FileLogsInsertType,
  TargetInfoCreateType,
} from "type";

/** Thrown when a log with the same Journal ID + Article ID already exists. */
export class DuplicateFileLogError extends Error {
  constructor(
    public journalId: string,
    public articleId: string,
    public workedAt: string,
  ) {
    super(
      `${journalId}-${articleId} is already logged (worked on ${
        formatDateTime(workedAt).shortDateWithYear
      })`,
    );
    this.name = "DuplicateFileLogError";
  }
}

// Journal IDs are stored upper case and both IDs trimmed, so the same file
// can't slip through as "npp2" vs "NPP2" or with stray spaces.
export const normalizeJournalId = (journalId: string) =>
  journalId.trim().toUpperCase();
export const normalizeArticleId = (articleId: string) => articleId.trim();

const fileKey = (journalId: string, articleId: string) =>
  `${normalizeJournalId(journalId)}-${normalizeArticleId(articleId)}`;

/** Finds an existing log for the Journal ID + Article ID pair, regardless of its type flags. */
export const findDuplicateFileLog = async (
  db: Db,
  journalId: string,
  articleId: string,
  excludeId?: string,
) => {
  const [row] = await db
    .select({
      id: fileLogs.id,
      journalId: fileLogs.journalId,
      articleId: fileLogs.articleId,
      workedAt: fileLogs.workedAt,
    })
    .from(fileLogs)
    .where(
      and(
        sql`upper(trim(${fileLogs.journalId})) = ${normalizeJournalId(journalId)}`,
        sql`trim(${fileLogs.articleId}) = ${normalizeArticleId(articleId)}`,
        excludeId ? ne(fileLogs.id, excludeId) : undefined,
      ),
    )
    .limit(1);

  return row;
};

const assertNotDuplicate = async (
  db: Db,
  journalId: string,
  articleId: string,
  excludeId?: string,
) => {
  const existing = await findDuplicateFileLog(db, journalId, articleId, excludeId);
  if (existing) {
    throw new DuplicateFileLogError(
      normalizeJournalId(journalId),
      normalizeArticleId(articleId),
      existing.workedAt,
    );
  }
};

export const createFileLog = async (db: Db, logData: FileLogsCreateInput) => {
  try {
    await assertNotDuplicate(db, logData.journalId, logData.articleId);

    const id = Crypto.randomUUID();

    // Insert the new log entry into the database
    // [row] is equivalent to rows[0]
    const [row] = await db
      .insert(fileLogs)
      .values({
        ...logData,
        journalId: normalizeJournalId(logData.journalId),
        articleId: normalizeArticleId(logData.articleId),
        id,
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      })
      .returning({
        id: fileLogs.id,
        journalId: fileLogs.journalId,
        articleId: fileLogs.articleId,
        isCompensatedFile: fileLogs.isCompensatedFile,
        isQcFile: fileLogs.isQcFile,
        isMdc: fileLogs.isMdc,
      });

    await saveJournalIds(db, [row.journalId]);

    return row;
  } catch (error) {
    if (!(error instanceof DuplicateFileLogError))
      console.error("[createFileLog] failed", error);
    throw error;
  }
};

export const deleteFileLogById = async (db: Db, id: string) => {
  try {
    let [row] = await db.delete(fileLogs).where(eq(fileLogs.id, id)).returning({
      id: fileLogs.id,
      journalId: fileLogs.journalId,
      articleId: fileLogs.articleId,
      isCompensatedFile: fileLogs.isCompensatedFile,
      isQcFile: fileLogs.isQcFile,
      isMdc: fileLogs.isMdc,
    });

    return row;
  } catch (error) {
    throw error;
  }
};

export const updateFileLogById = async ({
  db,
  id,
  data,
}: {
  db: Db;
  id: string;
  data: Partial<Omit<FileLogsInsertType, "id" | "createdAt">>;
}) => {
  try {
    if (data.journalId !== undefined || data.articleId !== undefined) {
      let { journalId, articleId } = data;
      if (journalId === undefined || articleId === undefined) {
        const [current] = await db
          .select({ journalId: fileLogs.journalId, articleId: fileLogs.articleId })
          .from(fileLogs)
          .where(eq(fileLogs.id, id));
        journalId ??= current?.journalId;
        articleId ??= current?.articleId;
      }
      if (journalId !== undefined && articleId !== undefined) {
        await assertNotDuplicate(db, journalId, articleId, id);
      }
    }

    let [row] = await db
      .update(fileLogs)
      .set({
        updatedAt: new Date().toISOString(),
        ...data,
        ...(data.journalId !== undefined && {
          journalId: normalizeJournalId(data.journalId),
        }),
        ...(data.articleId !== undefined && {
          articleId: normalizeArticleId(data.articleId),
        }),
      })
      .where(eq(fileLogs.id, id))
      .returning({
        id: fileLogs.id,
        journalId: fileLogs.journalId,
        articleId: fileLogs.articleId,
        isCompensatedFile: fileLogs.isCompensatedFile,
        isQcFile: fileLogs.isQcFile,
        isMdc: fileLogs.isMdc,
      });

    if (row && data.journalId !== undefined) {
      await saveJournalIds(db, [row.journalId]);
    }

    return row;
  } catch (error) {
    if (!(error instanceof DuplicateFileLogError))
      console.error("Could not update file log", error);
    throw error;
  }
};

export const createTargetInfo = async (db: Db, data: TargetInfoCreateType) => {
  try {
    const id = Crypto.randomUUID();

    const [row] = await db
      .insert(targetInfo)
      .values({
        ...data,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      })
      .returning({
        id: targetInfo.id,
      });

    return row;
  } catch (error) {
    console.error("[createTargetInfo] failed", error);
    throw error;
  }
};

export const deleteTargetInfoById = async (db: Db, id: string) => {
  try {
    const [row] = await db
      .delete(targetInfo)
      .where(eq(targetInfo.id, id))
      .returning({
        id: targetInfo.id,
      });

    return row;
  } catch (error) {
    console.error("[deleteTargetInfoById] failed", error);
    throw error;
  }
};

const CHUNK_SIZE = 100;

/**
 * Inserts imported logs, skipping any Journal ID + Article ID pair that is
 * already in the database or appears earlier in the same import.
 * Returns how many rows were inserted and skipped.
 */
export const createBulkFileLogs = async (
  db: Db,
  data: (typeof fileLogs.$inferInsert)[],
) => {
  try {
    const existing = await db
      .select({ journalId: fileLogs.journalId, articleId: fileLogs.articleId })
      .from(fileLogs);
    const seen = new Set(existing.map((r) => fileKey(r.journalId, r.articleId)));

    const rows: (typeof fileLogs.$inferInsert)[] = [];
    let skipped = 0;

    for (const item of data) {
      const key = fileKey(item.journalId, item.articleId);
      if (seen.has(key)) {
        skipped++;
        continue;
      }
      seen.add(key);
      rows.push({
        ...item,
        journalId: normalizeJournalId(item.journalId),
        articleId: normalizeArticleId(item.articleId),
        id: Crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      });
    }

    if (rows.length === 0) return { inserted: 0, skipped };

    if (rows.length <= CHUNK_SIZE) {
      await db.insert(fileLogs).values(rows);
    } else {
      await db.transaction(async (tx) => {
        for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
          await tx.insert(fileLogs).values(rows.slice(i, i + CHUNK_SIZE));
        }
      });
    }

    await saveJournalIds(
      db,
      rows.map((r) => r.journalId),
    );

    return { inserted: rows.length, skipped };
  } catch (error) {
    console.error("createBulkFileLogs error:", error);
    throw error;
  }
};
