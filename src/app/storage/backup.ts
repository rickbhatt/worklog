import { Directory, Paths } from "expo-file-system";

const BACKUP_DIR_PATH = `${Paths.document.uri}backup/databases`;
export const ensureBackupDir = () => {
  const info = Paths.info(BACKUP_DIR_PATH);
  console.log("🚀 ~ ensureBackupDir ~ folder exits:", info.exists);

  if (!info.exists) {
    const backupDir = new Directory(BACKUP_DIR_PATH);
    backupDir.create({ intermediates: true });
    console.log("Backup directory created at:", BACKUP_DIR_PATH);
  }
};
