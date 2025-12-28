import { fileLogs } from "@/db/models/log.schema";
import type { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import * as Crypto from "expo-crypto";
import { FileLogsCreateInput } from "type";

export const createFileLog = async (
  db: ExpoSQLiteDatabase,
  logData: FileLogsCreateInput
) => {
  try {
    const id = Crypto.randomUUID();

    // Insert the new log entry into the database
    // [row] is equivalent to rows[0]
    const [row] = await db
      .insert(fileLogs)
      .values({
        ...logData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: undefined,
      })
      .returning({
        id: fileLogs.id,
        journalId: fileLogs.journalId,
        articleId: fileLogs.articleId,
      });

    return row;
  } catch (error) {
    console.error("[createFileLog] failed", error);
    throw error;
  }
};
