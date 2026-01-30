ALTER TABLE `file_logs` ADD `is_sml` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `file_logs` ADD `is_ot` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `file_logs` ADD `remarks` text;