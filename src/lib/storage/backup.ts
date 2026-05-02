import { BACKUP_FILE_NAME, DB_NAME } from "@/constants";
import { closeDb, getDb } from "@/db/client";
import {
  createOrUpdateBackupState,
  deleteBackupState,
} from "@/db/mutations/backup.mutations";
import { getBackupState } from "@/db/queries/backup.queries";
import { formatDateTime, generateBackupId } from "@/lib/utils";
import {
  getAccessToken,
  getCurrentUserEmail,
} from "@/services/googleAuthService";
import { Directory, File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import * as Updates from "expo-updates";
import { toast } from "sonner-native";

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

const saveBackupMetaToSecureStore = async (
  accountEmail: string,
  driveFileId: string,
  lastBackupAt: Date,
  md5Checksum: string,
) => {
  await Promise.all([
    SecureStore.setItemAsync(SECURE_KEYS.HAS_BACKUP, "true"),
    SecureStore.setItemAsync(SECURE_KEYS.ACCOUNT_EMAIL, accountEmail),
    SecureStore.setItemAsync(SECURE_KEYS.DRIVE_FILE_ID, driveFileId),
    SecureStore.setItemAsync(SECURE_KEYS.MD5_CHECKSUM, md5Checksum),
    SecureStore.setItemAsync(
      SECURE_KEYS.LAST_BACKUP_AT,
      formatDateTime(lastBackupAt).dateToISOString,
    ),
  ]);
};

export const getBackupMetaFromSecureStore = async () => {
  const [hasBackup, accountEmail, driveFileId, lastBackupAt, md5Checksum] =
    await Promise.all([
      SecureStore.getItemAsync(SECURE_KEYS.HAS_BACKUP),
      SecureStore.getItemAsync(SECURE_KEYS.ACCOUNT_EMAIL),
      SecureStore.getItemAsync(SECURE_KEYS.DRIVE_FILE_ID),
      SecureStore.getItemAsync(SECURE_KEYS.LAST_BACKUP_AT),
      SecureStore.getItemAsync(SECURE_KEYS.MD5_CHECKSUM),
    ]);

  if (
    hasBackup !== "true" ||
    !accountEmail ||
    !driveFileId ||
    !lastBackupAt ||
    !md5Checksum
  ) {
    return null;
  }

  return {
    accountEmail,
    driveFileId,
    lastBackupAt: new Date(lastBackupAt),
    md5Checksum,
  };
};

export const clearBackupMetaFromSecureStore = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_KEYS.HAS_BACKUP),
    SecureStore.deleteItemAsync(SECURE_KEYS.ACCOUNT_EMAIL),
    SecureStore.deleteItemAsync(SECURE_KEYS.DRIVE_FILE_ID),
    SecureStore.deleteItemAsync(SECURE_KEYS.LAST_BACKUP_AT),
    SecureStore.deleteItemAsync(SECURE_KEYS.MD5_CHECKSUM),
  ]);
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

    const currentUserEmail = await getCurrentUserEmail();

    await saveBackupMetaToSecureStore(
      currentUserEmail || "unknown",
      result.id,
      new Date(result.modifiedTime),
      result.md5Checksum,
    );
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
    await clearBackupMetaFromSecureStore();

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
    // In production builds, use expo-updates
    await Updates.reloadAsync();
  }
};

export const restoreBackupFromDrive = async (): Promise<{
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
    // 1. Get fresh access token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in to Google");

    // 2. Download the backup file from Drive

    const files = await listAppDataFiles();
    console.log(
      "🚀 ~ restoreBackupFromDrive ~ files:",
      JSON.stringify(files, null, 2),
    );
    if (files.length === 0) {
      console.log("No backup found on Drive");
      return { success: false };
    }

    const response = await fetch(
      `${DRIVE_BASE_URL}/drive/v3/files/${files[0]?.id}?alt=media`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!response.ok) {
      throw new Error(`Drive download failed: ${response.status}`);
    }

    // 3. Write downloaded file to a temp location first
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const restoredFile = new File(restoredFilePath);
    restoredFile.create();

    // Write binary directly using FileHandle
    const handle = restoredFile.open();
    handle.writeBytes(uint8Array);
    handle.close();

    // 4. Verify MD5 checksum if available

    if (restoredFile.md5 !== files[0]?.md5Checksum) {
      restoredFile.delete();
      throw new Error(`Checksum mismatch — backup file may be corrupted`);
    }

    // 5. Replace the live DB with the downloaded file

    await closeDb();

    const liveDbFile = new File(Paths.document, "SQLite", DB_NAME);
    if (liveDbFile.exists) {
      liveDbFile.delete();
    }
    restoredFile.move(liveDbFile);

    console.log("🚀 Backup restored successfully");

    // 6. Restart the app to reinitialize DB with restored file

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
