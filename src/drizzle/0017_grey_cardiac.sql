CREATE TABLE `ctr_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`worked_at` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ctr_logs_worked_at_idx` ON `ctr_logs` (`worked_at`);--> statement-breakpoint
INSERT INTO `ctr_logs` (`id`, `worked_at`, `created_at`, `updated_at`)
SELECT `id`, `worked_at`, `created_at`, `updated_at` FROM `file_logs`
WHERE upper(`journal_id`) LIKE '%CTR%';
--> statement-breakpoint
DELETE FROM `file_logs` WHERE upper(`journal_id`) LIKE '%CTR%';
--> statement-breakpoint
DELETE FROM `journals` WHERE upper(`journal_id`) LIKE '%CTR%';
