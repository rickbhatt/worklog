import { fileLogs, targetInfo } from "@/db/models/log.schema";
import { eq } from "drizzle-orm";

import * as Crypto from "expo-crypto";
import {
  Db,
  FileLogsCreateInput,
  FileLogsInsertType,
  TargetInfoCreateType,
} from "type";

export const createFileLog = async (db: Db, logData: FileLogsCreateInput) => {
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

export const deleteFileLogById = async (db: Db, id: string) => {
  try {
    let [row] = await db.delete(fileLogs).where(eq(fileLogs.id, id)).returning({
      id: fileLogs.id,
      journalId: fileLogs.journalId,
      articleId: fileLogs.articleId,
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
    let [row] = await db
      .update(fileLogs)
      .set({
        updatedAt: new Date().toISOString(),
        ...data,
      })
      .where(eq(fileLogs.id, id))
      .returning({
        id: fileLogs.id,
        journalId: fileLogs.journalId,
        articleId: fileLogs.articleId,
      });

    return row;
  } catch (error) {
    console.log("Could not update file log");
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
