CREATE TABLE `file_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`journal_id` text NOT NULL,
	`article_id` text NOT NULL,
	`time_taken` integer NOT NULL,
	`page_count` integer NOT NULL,
	`worked_at` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
