import { BACKUP_FILE_NAME, DB_NAME } from "@/constants";
import { getDb } from "@/db/client";
import { createOrUpdateBackupState } from "@/db/mutations/backup.mutations";
import { getBackupState } from "@/db/queries/backup.queries";
import { generateBackupId } from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import { Directory, File, Paths } from "expo-file-system";
import { toast } from "sonner-native";

const BACKUP_DIR_PATH = `${Paths.document.uri}backup/databases`;
const LIVE_DB_PATH = `${Paths.document.uri}SQLite/${DB_NAME}`;
console.log("🚀 ~ LIVE_DB_PATH:", LIVE_DB_PATH);

const DRIVE_BASE_URL = "https://www.googleapis.com";

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
    const db = getDb();

    // 1. Check for existing Drive file ID to overwrite
    const existing = await getBackupState(db);
    const existingFileId = existing?.driveFileId;

    // 2. Create snapshot
    snapshotPath = backupDatabase();
    const snapshotFile = new File(snapshotPath);
    if (!snapshotFile.exists) {
      throw new Error("Snapshot file not found at: " + snapshotPath);
    }
    const base64Data = snapshotFile.base64Sync();

    // 3. Fresh access token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Not signed in to Google");

    // 4. POST (new file) or PATCH (overwrite existing)
    const metadata = existingFileId
      ? { name: BACKUP_FILE_NAME }
      : { name: BACKUP_FILE_NAME, parents: ["appDataFolder"] };

    const boundary = "worklog_backup_boundary";
    const body =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/octet-stream\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n` +
      `${base64Data}\r\n` +
      `--${boundary}--`;

    const params = new URLSearchParams({
      uploadType: "multipart",
      fields: "id,name,size,modifiedTime,md5Checksum",
    });

    const url = existingFileId
      ? `${DRIVE_BASE_URL}/upload/drive/v3/files/${existingFileId}?${params.toString()}`
      : `${DRIVE_BASE_URL}/upload/drive/v3/files?${params.toString()}`;

    const response = await fetch(url, {
      method: existingFileId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(`Drive API error: ${JSON.stringify(result)}`);

    console.log("🚀 Backup uploaded successfully:", result);

    // 5. Update backup state in DB
    await createOrUpdateBackupState({
      db,
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
    toast.success("Backup uploaded to Google Drive successfully!");
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
