ALTER TABLE `backup_history` RENAME TO `backup_state`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_backup_state` (
	`id` text PRIMARY KEY NOT NULL,
	`cloud_account_id` text NOT NULL,
	`drive_file_id` text,
	`backup_status` text DEFAULT 'idle' NOT NULL,
	`backup_size` integer,
	`md5_checksum` text,
	`last_backup_at` integer,
	`last_error` text,
	FOREIGN KEY (`cloud_account_id`) REFERENCES `cloud_account`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_backup_state`("id", "cloud_account_id", "drive_file_id", "backup_status", "backup_size", "md5_checksum", "last_backup_at", "last_error") SELECT "id", "cloud_account_id", "drive_file_id", "backup_status", "backup_size", "md5_checksum", "last_backup_at", "last_error" FROM `backup_state`;--> statement-breakpoint
DROP TABLE `backup_state`;--> statement-breakpoint
ALTER TABLE `__new_backup_state` RENAME TO `backup_state`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `backup_state_cloud_account_id_unique` ON `backup_state` (`cloud_account_id`);