CREATE TABLE `backup` (
	`id` text PRIMARY KEY NOT NULL,
	`cloud_account_id` text,
	`backup_provider` text NOT NULL,
	`backup_version` integer NOT NULL,
	`backup_status` text NOT NULL,
	`last_backup_at` integer
);
