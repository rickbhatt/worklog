import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// One row — the connected Google account
export const cloudAccount = sqliteTable("cloud_account", {
  id: text("id").primaryKey(), // always 'gdrive'
  provider: text("provider", {
    enum: ["google_drive"],
  }).notNull(),
  accountEmail: text("account_email").notNull(),
  connectedAt: integer("connected_at", { mode: "timestamp_ms" }).notNull(),
});

// One row — the backup state, linked to the account
export const backupState = sqliteTable("backup_state", {
  id: text("id").primaryKey(), // always 'gdrive_backup'
  cloudAccountId: text("cloud_account_id")
    .references(() => cloudAccount.id)
    .notNull()
    .unique(),
  driveFileId: text("drive_file_id"),
  backupFileName: text("backup_file_name"),
  backupStatus: text("backup_status", {
    enum: ["idle", "running", "success", "failed"],
  })
    .notNull()
    .default("idle"),
  backupSize: integer("backup_size"),
  md5Checksum: text("md5_checksum"),
  lastBackupAt: integer("last_backup_at", { mode: "timestamp_ms" }),
  lastError: text("last_error"),
});

// realations

// backward relation
export const cloudAccountRelations = relations(cloudAccount, ({ one }) => ({
  backupState: one(backupState, {
    fields: [cloudAccount.id],
    references: [backupState.cloudAccountId],
  }),
}));

// forward relation
export const backupStateRelations = relations(backupState, ({ one }) => ({
  cloudAccount: one(cloudAccount, {
    fields: [backupState.cloudAccountId],
    references: [cloudAccount.id],
  }),
}));
