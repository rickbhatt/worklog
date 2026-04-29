import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const backup = sqliteTable("backup", {
  id: text("id").primaryKey(),
  cloudAccountEmail: text("cloud_account_email"),
  driveFileId: text("drive_file_id"),
  backupStatus: text("backup_status", {
    enum: ["idle", "running", "success", "failed"],
  })
    .notNull()
    .default("idle"),
  backupSize: integer("backup_size"),
  lastBackupAt: integer("last_backup_at", { mode: "timestamp_ms" }),
  lastError: text("last_error"),
});
