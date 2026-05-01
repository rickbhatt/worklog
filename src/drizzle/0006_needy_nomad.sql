PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_backup` (
	`id` text PRIMARY KEY NOT NULL,
	`cloud_account_email` text,
	`drive_file_id` text,
	`backup_status` text DEFAULT 'idle' NOT NULL,
	`backup_size` integer,
	`last_backup_at` integer,
	`last_error` text
);
--> statement-breakpoint
INSERT INTO `__new_backup`("id", "cloud_account_email", "drive_file_id", "backup_status", "backup_size", "last_backup_at", "last_error") SELECT "id", "cloud_account_email", "drive_file_id", "backup_status", "backup_size", "last_backup_at", "last_error" FROM `backup`;--> statement-breakpoint
DROP TABLE `backup`;--> statement-breakpoint
ALTER TABLE `__new_backup` RENAME TO `backup`;--> statement-breakpoint
PRAGMA foreign_keys=ON;