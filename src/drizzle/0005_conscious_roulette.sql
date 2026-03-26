CREATE TABLE `target_info` (
	`id` text PRIMARY KEY NOT NULL,
	`target_lep_pages` integer,
	`pages_per_hour` integer,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
