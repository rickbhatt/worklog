import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const backup = sqliteTable("backup", {
  id: text("id").primaryKey(),

  cloudAccountId: text("cloud_account_id"),

  backupProvider: text("backup_provider", {
    enum: ["local", "google_drive"],
  }).notNull(),

  backupVersion: integer("backup_version").notNull(),

  backupStatus: text("backup_status", {
    enum: ["idle", "running", "success", "failed"],
  }).notNull(),

  lastBackupAt: integer("last_backup_at", { mode: "timestamp_ms" }),
});
