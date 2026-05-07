import {
  BACKUP_DIR_PATH,
  BACKUP_FILE_NAME,
  DB_NAME,
  DRIVE_BASE_URL,
  LIVE_DB_PATH,
} from "@/constants";
import { closeDb } from "@/db/client";

import {
  createOrUpdateBackupState,
  deleteBackupState,
} from "@/db/mutations/backup.mutations";
import { getBackupState } from "@/db/queries/backup.queries";
import { checkHasUserData } from "@/db/queries/fileworklog.queries";
import { generateBackupId } from "@/lib/utils";
import {
  getAccessToken,
  getCurrentUserEmail,
  isUserSignedIn,
} from "@/services/googleAuthService";
import {
  showBackupFailedNotification,
  showBackupInProgressNotification,
  showBackupSuccessNotification,
} from "@/services/notificationService";
import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import { toast } from "sonner-native";
import { Db } from "type";

const saveBackupMetaToSecureStore = async ({
  accountEmail,
  driveFileId,
  lastBackupAt,
  md5Checksum,
  backupSize,
  backupFileName,
}: {
  accountEmail: string;
  driveFileId: string;
  lastBackupAt: Date;
  md5Checksum: string;
  backupSize: string;
  backupFileName: string;
}) => {
  await SecureStore.setItemAsync(
    "pending_backup_sync",
    JSON.stringify({
      driveFileId: driveFileId,
      md5Checksum: md5Checksum,
      backupSize: parseInt(backupSize),
      lastBackupAt: lastBackupAt,
      accountEmail: accountEmail,
      backupFileName: backupFileName,
    }),
  );
};

export const syncPendingRestoreState = async (db: Db) => {
  try {
    const raw = await SecureStore.getItemAsync("pending_backup_sync");
    if (!raw) return;

    const meta = JSON.parse(raw);

    // Upsert backup state

    await createOrUpdateBackupState({
      db,
      data: {
        cloudAccountId: "gdrive",
        driveFileId: meta.driveFileId,
        backupStatus: "success",
        backupSize: meta.backupSize,
        md5Checksum: meta.md5Checksum,
        lastBackupAt: new Date(meta.lastBackupAt),
        backupFileName: meta.backupFileName,
      },
    });

    // Clear the pending sync flag
    await SecureStore.deleteItemAsync("pending_backup_sync");
  } catch (e) {
    console.error("🚀 Failed to sync restore state:", e);
  }
};

export const ensureBackupDir = () => {
  const info = Paths.info(BACKUP_DIR_PATH);

  if (info.exists) return;

  try {
    const backupDir = new Directory(BACKUP_DIR_PATH);
    backupDir.create({ intermediates: true });
  } catch (error) {
    // Ignore already-exists races
    const latestInfo = Paths.info(BACKUP_DIR_PATH);

    if (!latestInfo.exists) {
      throw error;
    }
  }
};

export const backupDatabase = () => {
  const backupId = generateBackupId();

  const backupPath = `${BACKUP_DIR_PATH}/${DB_NAME}.${backupId}.backup`;

  try {
    const source = new File(LIVE_DB_PATH);
    const destination = new File(backupPath);

    source.copy(destination);

    return backupPath;
  } catch (error) {
    console.error("❌ Database backup failed:", error);
    throw error;
  }
};

export async function uploadBackupToDrive(database: Db): Promise<{
  success: boolean;
  error?: any;
}> {
  let snapshotPath: string | null = null;

  try {
    await showBackupInProgressNotification();

    // Get existing Drive file ID from DB (single read)
    const existing = await getBackupState(database);
    let existingFileId = existing?.driveFileId ?? null;

    // Create snapshot
    snapshotPath = backupDatabase();
    const snapshotFile = new File(snapshotPath);
    if (!snapshotFile.exists) {
      throw new Error("Snapshot file not found at: " + snapshotPath);
    }
    const base64Data = snapshotFile.base64Sync();

    // Fresh access token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in to Google");

    const boundary = "worklog_backup_boundary";

    const buildBody = (includeParents: boolean) => {
      const metadata = includeParents
        ? { name: BACKUP_FILE_NAME, parents: ["appDataFolder"] }
        : { name: BACKUP_FILE_NAME };

      return (
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/octet-stream\r\n` +
        `Content-Transfer-Encoding: base64\r\n\r\n` +
        `${base64Data}\r\n` +
        `--${boundary}--`
      );
    };

    const params = new URLSearchParams({
      uploadType: "multipart",
      fields: "id,name,size,modifiedTime,md5Checksum",
    });

    const doUpload = async (fileId: string | null) => {
      const url = fileId
        ? `${DRIVE_BASE_URL}/upload/drive/v3/files/${fileId}?${params.toString()}`
        : `${DRIVE_BASE_URL}/upload/drive/v3/files?${params.toString()}`;

      return fetch(url, {
        method: fileId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: buildBody(!fileId),
      });
    };

    // Try PATCH if we have an existing file ID, otherwise POST
    let response = await doUpload(existingFileId);

    // If PATCH returned 404, Drive file was deleted — fall back to POST
    if (response.status === 404 && existingFileId) {
      existingFileId = null;
      response = await doUpload(null);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Drive API error: ${JSON.stringify(result)}`);
    }

    // Single upsert on success
    await createOrUpdateBackupState({
      db: database,
      data: {
        cloudAccountId: "gdrive",
        driveFileId: result.id,
        backupFileName: result.name,
        backupStatus: "success",
        backupSize: parseInt(result.size),
        lastBackupAt: new Date(result.modifiedTime),
        md5Checksum: result.md5Checksum,
      },
    });
    toast.success("Backup uploaded to Google Drive");

    await showBackupSuccessNotification(new Date(result.modifiedTime));
    return { success: true };
  } catch (error) {
    await showBackupFailedNotification();
    console.error("🚀 Backup failed:", error);
    return { success: false, error };
  } finally {
    if (snapshotPath) {
      try {
        new File(snapshotPath).delete();
      } catch (e) {
        console.error("🚀 Failed to clean up snapshot:", e);
      }
    }
  }
}

export async function listAppDataFiles() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error("Not signed in to Google");
  }

  // pageSize 10 is enough — appDataFolder will only ever have 1 backup file
  // pagination not implemented since we control what gets uploaded

  const params = new URLSearchParams({
    spaces: "appDataFolder",
    fields: "files(id,name,size,createdTime,modifiedTime,md5Checksum)",
    pageSize: "10",
  });

  const response = await fetch(
    `${DRIVE_BASE_URL}/drive/v3/files?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Drive list failed: ${JSON.stringify(data)}`);
  }

  return data.files ?? [];
}

export async function deleteAllDriveFiles(db: Db): Promise<{
  success: boolean;
  error?: any;
}> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in to Google");

    // 1. List all files in appDataFolder
    const files = await listAppDataFiles();

    if (files.length === 0) {
      return { success: true };
    }

    // 2. Delete each file
    await Promise.all(
      files.map(async (file: { id: string; name: string }) => {
        const response = await fetch(
          `${DRIVE_BASE_URL}/drive/v3/files/${file.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );

        if (!response.ok && response.status !== 404) {
          throw new Error(
            `Failed to delete file ${file.id}: ${response.status}`,
          );
        }
      }),
    );

    // 3. Clear local DB record

    await deleteBackupState(db);

    return { success: true };
  } catch (error) {
    console.error("🚀 Delete all failed:", error);
    return { success: false, error };
  }
}

export const restartApp = async () => {
  if (__DEV__) {
    console.warn(
      "⚠️ Dev reload is not a true native restart. " +
        "SQLite restore flows may require a manual cold restart.",
    );

    const { DevSettings } = require("react-native");

    DevSettings.reload();

    return;
  }

  if (!Updates.isEnabled) {
    throw new Error("expo-updates is not enabled in this build");
  }

  await Updates.reloadAsync();
};

export const restoreBackupFromDrive = async (driveFile: {
  id: string;
  md5Checksum: string;
  size: string;
  name: string;
  modifiedTime: string;
}): Promise<{
  success: boolean;
  error?: unknown;
}> => {
  const restoreDir = new Directory(Paths.document, "backup", "databases");

  const restoredFile = new File(restoreDir, "worklog_restored.db");

  const liveDbFile = new File(Paths.document, "SQLite", DB_NAME);

  const walFile = new File(Paths.document, "SQLite", `${DB_NAME}-wal`);

  const shmFile = new File(Paths.document, "SQLite", `${DB_NAME}-shm`);

  const oldDbBackup = new File(Paths.document, "SQLite", `${DB_NAME}.old`);
  try {
    // Ensure restore directory exists before network work
    if (!restoreDir.exists) {
      restoreDir.create({ intermediates: true });
    }

    // Ensure temp restore file starts clean
    if (restoredFile.exists) {
      restoredFile.delete();
    }

    restoredFile.create();

    // Get fresh access token
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new Error("Not signed in to Google");
    }

    // Download backup from Drive
    const response = await fetch(
      `${DRIVE_BASE_URL}/drive/v3/files/${driveFile.id}?alt=media`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Drive download failed: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const handle = restoredFile.open();

    try {
      handle.writeBytes(uint8Array);
    } finally {
      handle.close();
    }

    // Verify integrity
    if (
      restoredFile.md5 !== driveFile.md5Checksum ||
      restoredFile.size !== Number(driveFile.size)
    ) {
      restoredFile.delete();

      throw new Error("Checksum or size mismatch — backup may be corrupted");
    }

    // Close active provider-managed SQLite connection
    await closeDb();

    // Clean WAL/SHM first while still associated with live DB
    if (walFile.exists) {
      walFile.delete();
    }

    if (shmFile.exists) {
      shmFile.delete();
    }

    // Remove previous rollback backup if present
    if (oldDbBackup.exists) {
      oldDbBackup.delete();
    }

    // Move current live DB aside for rollback safety
    if (liveDbFile.exists) {
      liveDbFile.copy(oldDbBackup);
      liveDbFile.delete();
    }

    // Place restored DB into live location
    restoredFile.copy(liveDbFile);
    restoredFile.delete();

    // Cleanup rollback backup after successful replacement
    if (oldDbBackup.exists) {
      oldDbBackup.delete();
    }

    // Save backup metadata
    const currentUserEmail = await getCurrentUserEmail();

    await saveBackupMetaToSecureStore({
      accountEmail: currentUserEmail!,
      driveFileId: driveFile.id,
      lastBackupAt: new Date(driveFile.modifiedTime),
      md5Checksum: driveFile.md5Checksum,
      backupSize: driveFile.size,
      backupFileName: driveFile.name,
    });

    // Restart immediately after restore
    await restartApp();

    return { success: true };
  } catch (error) {
    // Cleanup temp restored file
    try {
      if (restoredFile.exists) {
        restoredFile.delete();
      }
    } catch {}

    // Rollback original DB if replacement failed
    try {
      if (oldDbBackup.exists && !liveDbFile.exists) {
        oldDbBackup.copy(liveDbFile);
        oldDbBackup.delete();
      }
    } catch {}

    console.error("🚀 Restore failed:", error);

    return {
      success: false,
      error,
    };
  }
};
export const checkAndAutoBackup = (db: Db) => {
  const isSignedIn = isUserSignedIn();
  if (!isSignedIn) return;

  const backupRecord = getBackupState(db); // no await

  if (!backupRecord?.lastBackupAt) {
    const hasData = checkHasUserData(db);
    if (hasData) {
      console.log("🚀 First backup triggered — user has data");
      uploadBackupToDrive(db);
    }
    return;
  }

  const hoursSinceLast =
    (Date.now() - backupRecord.lastBackupAt.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLast >= 12) {
    console.log("🚀 Auto backup triggered");
    uploadBackupToDrive(db);
  }
};
