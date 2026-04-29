import { DB_NAME } from "@/constants";
import { generateBackupId } from "@/lib/utils";
import { getAccessToken } from "@/services/googleAuthService";
import { Directory, File, Paths } from "expo-file-system";

const BACKUP_DIR_PATH = `${Paths.document.uri}backup/databases`;
const LIVE_DB_PATH = `${Paths.document.uri}SQLite/${DB_NAME}`;
console.log("🚀 ~ LIVE_DB_PATH:", LIVE_DB_PATH);
const BACKUP_FILE_NAME = "worklog_backup.db";

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
    // 1. Create a safe snapshot copy of the live DB
    snapshotPath = backupDatabase();

    // 2. Read the snapshot as base64
    const snapshotFile = new File(snapshotPath);
    if (!snapshotFile.exists) {
      throw new Error("Snapshot file not found at: " + snapshotPath);
    }

    const base64Data = snapshotFile.base64Sync();

    // 3. Get a fresh access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Not signed in to Google");
    }

    // 4. Upload to Drive appDataFolder
    const metadata = {
      name: BACKUP_FILE_NAME,
      parents: ["appDataFolder"],
    };

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
      fields: "id,name,size,createdTime,modifiedTime,md5Checksum",
    });

    const response = await fetch(
      `${DRIVE_BASE_URL}/upload/drive/v3/files?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Drive API error: ${JSON.stringify(result)}`);
    }

    console.log("🚀 Backup uploaded successfully:", result);
    return { success: true };
  } catch (error) {
    console.log("🚀 Backup failed:", error);
    return { success: false, error };
  } finally {
    // 5. Always clean up the local snapshot regardless of success or failure
    if (snapshotPath) {
      try {
        const snapshotFile = new File(snapshotPath);
        snapshotFile.delete();
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
