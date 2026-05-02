import { BACKUP_FILE_NAME, DB_NAME } from "@/constants";
import { closeDb, getDb } from "@/db/client";
import {
  createOrUpdateBackupState,
  deleteBackupState,
} from "@/db/mutations/backup.mutations";
import { getBackupState } from "@/db/queries/backup.queries";
import { generateBackupId } from "@/lib/utils";
import {
  getAccessToken,
  getCurrentUserEmail,
} from "@/services/googleAuthService";
import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import { toast } from "sonner-native";
import { Db } from "type";

const BACKUP_DIR_PATH = `${Paths.document.uri}backup/databases`;
const LIVE_DB_PATH = `${Paths.document.uri}SQLite/${DB_NAME}`;

const DRIVE_BASE_URL = "https://www.googleapis.com";

const SECURE_KEYS = {
  HAS_BACKUP: "gdrive_has_backup",
  ACCOUNT_EMAIL: "gdrive_account_email",
  DRIVE_FILE_ID: "gdrive_drive_file_id",
  LAST_BACKUP_AT: "gdrive_last_backup_at",
  MD5_CHECKSUM: "gdrive_md5_checksum",
};

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

    console.log("🚀 Backup state synced after restore");
  } catch (e) {
    console.log("🚀 Failed to sync restore state:", e);
  }
};

export const ensureBackupDir = () => {
  const info = Paths.info(BACKUP_DIR_PATH);
  console.log("🚀 ~ ensureBackupDir ~ folder exits:", info.exists);

  if (!info.exists) {
    const backupDir = new Directory(BACKUP_DIR_PATH);
    backupDir.create({ intermediates: true });
    console.log("Backup directory created at:", BACKUP_DIR_PATH);
  }
};

export const backupDatabase = () => {
  const backupId = generateBackupId();

  const backupPath = `${BACKUP_DIR_PATH}/${DB_NAME}.${backupId}.backup`;

  try {
    const source = new File(LIVE_DB_PATH);
    console.log("🚀 ~ backupDatabase ~ source:", source);
    const destination = new File(backupPath);
    console.log("🚀 ~ backupDatabase ~ destination:", destination);

    source.copy(destination);

    console.log("✅ Database backed up to:", backupPath);
    return backupPath;
  } catch (error) {
    console.error("❌ Database backup failed:", error);
    throw error;
  }
};

export async function uploadBackupToDrive(): Promise<{
  success: boolean;
  error?: any;
}> {
  let snapshotPath: string | null = null;

  try {
    const database = getDb();

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
      console.log("🚀 Drive file not found, falling back to POST");
      existingFileId = null;
      response = await doUpload(null);
    }

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Drive API error: ${JSON.stringify(result)}`);
    }

    console.log("🚀 Backup uploaded successfully:", result);

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

    return { success: true };
  } catch (error) {
    console.log("🚀 Backup failed:", error);
    return { success: false, error };
  } finally {
    if (snapshotPath) {
      try {
        new File(snapshotPath).delete();
        console.log("🚀 Snapshot cleaned up");
      } catch (e) {
        console.log("🚀 Failed to clean up snapshot:", e);
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

export async function deleteAllDriveFiles(): Promise<{
  success: boolean;
  error?: any;
}> {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in to Google");

    // 1. List all files in appDataFolder
    const files = await listAppDataFiles();

    if (files.length === 0) {
      console.log("🚀 No files found in appDataFolder");
      return { success: true };
    }

    console.log(`🚀 Deleting ${files.length} file(s) from Drive...`);

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

        console.log(`🚀 Deleted: ${file.name} (${file.id})`);
      }),
    );

    // 3. Clear local DB record
    const db = getDb();
    await deleteBackupState(db);

    console.log("🚀 All Drive files deleted and DB record cleared");
    return { success: true };
  } catch (error) {
    console.log("🚀 Delete all failed:", error);
    return { success: false, error };
  }
}

export const restartApp = async () => {
  console.log("🚀 Reloading app");
  if (__DEV__) {
    // In dev builds, use RN's DevSettings
    const { DevSettings } = require("react-native");
    DevSettings.reload();
  } else {
    if (!Updates.isEnabled) {
      throw new Error("expo-updates is not enabled in this build");
    }
    // In production builds, use expo-updates
    await Updates.reloadAsync();
  }
};

export const restoreBackupFromDrive = async (driveFile: {
  id: string;
  md5Checksum: string;
  size: string;
  name: string;
  modifiedTime: string;
}): Promise<{
  success: boolean;
  error?: any;
}> => {
  const restoredFilePath = new File(
    Paths.document,
    "backup",
    "databases",
    "worklog_restored.db",
  );

  try {
    // Get fresh access token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in to Google");

    // Download the backup file from Drive

    const response = await fetch(
      `${DRIVE_BASE_URL}/drive/v3/files/${driveFile.id}?alt=media`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Drive download failed: ${response.status}`);
    }

    // Write downloaded file to a temp location first
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const restoredFile = new File(restoredFilePath);
    restoredFile.create();

    // Write binary directly using FileHandle
    const handle = restoredFile.open();
    handle.writeBytes(uint8Array);
    handle.close();

    // Verify MD5 checksum if available

    if (restoredFile.md5 !== driveFile.md5Checksum) {
      restoredFile.delete();
      throw new Error(`Checksum mismatch — backup file may be corrupted`);
    }

    // Replace the live DB with the downloaded file

    await closeDb();

    const liveDbFile = new File(Paths.document, "SQLite", DB_NAME);
    if (liveDbFile.exists) {
      liveDbFile.delete();
    }
    restoredFile.move(liveDbFile);

    console.log("🚀 Backup restored successfully");

    // Update the secure store with the backup metadata from Drive
    const currentUserEmail = await getCurrentUserEmail();
    await saveBackupMetaToSecureStore({
      accountEmail: currentUserEmail!,
      driveFileId: driveFile.id,
      lastBackupAt: new Date(driveFile.modifiedTime),
      md5Checksum: driveFile.md5Checksum,
      backupSize: driveFile.size,
      backupFileName: driveFile.name,
    });

    // Restart the app to reinitialize DB with restored file

    await restartApp();
    return { success: true };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      const restoredFile = new File(restoredFilePath);
      if (restoredFile.exists) restoredFile.delete();
    } catch (e) {}

    console.log("🚀 Restore failed:", error);
    return { success: false, error };
  }
};
