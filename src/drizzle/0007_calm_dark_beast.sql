ALTER TABLE `backup` RENAME TO `backup_history`;--> statement-breakpoint
CREATE TABLE `cloud_account` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`account_email` text NOT NULL,
	`connected_at` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `backup_history` ADD `cloud_account_id` text NOT NULL REFERENCES cloud_account(id);--> statement-breakpoint
ALTER TABLE `backup_history` ADD `md5_checksum` text;--> statement-breakpoint
ALTER TABLE `backup_history` DROP COLUMN `cloud_account_email`;