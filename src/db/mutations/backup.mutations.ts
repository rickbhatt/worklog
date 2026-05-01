import { BACKUP_STATE_ID } from "@/constants";
import { backupState, cloudAccount } from "@/db/schema";
import { CloudAccountInsertType, Db } from "type";

interface CreateBackupHistory {
  cloudAccountId: "gdrive";
  driveFileId: string;
  backupStatus: "idle" | "running" | "success" | "failed";
  backupSize: number;
  lastBackupAt: Date;
  md5Checksum: string;
  lastError?: string;
  backupFileName: string;
}

export const createCloudAccount = async ({
  db,
  data,
}: {
  db: Db;
  data: CloudAccountInsertType;
}) => {
  const [row] = await db
    .insert(cloudAccount)
    .values(data)
    .onConflictDoUpdate({
      target: cloudAccount.id,
      set: {
        accountEmail: data.accountEmail,
        connectedAt: data.connectedAt,
      },
    })
    .returning({
      id: cloudAccount.id,
      accountEmail: cloudAccount.accountEmail,
    });

  return row;
};

export const createOrUpdateBackupState = async ({
  db,
  data,
}: {
  db: Db;
  data: CreateBackupHistory;
}) => {
  const [row] = await db
    .insert(backupState)
    .values({ id: BACKUP_STATE_ID, ...data })
    .onConflictDoUpdate({
      target: backupState.id,
      set: {
        driveFileId: data.driveFileId,
        backupStatus: data.backupStatus,
        backupSize: data.backupSize,
        lastBackupAt: data.lastBackupAt,
        md5Checksum: data.md5Checksum,
        lastError: data.lastError,
      },
    })
    .returning({
      id: backupState.id,
    });

  return row;
};
