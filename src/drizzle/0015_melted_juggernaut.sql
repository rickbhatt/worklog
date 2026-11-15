CREATE TABLE `export_sheet` (
	`month` text PRIMARY KEY NOT NULL,
	`sheet_url` text NOT NULL,
	`sheet_name` text NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
