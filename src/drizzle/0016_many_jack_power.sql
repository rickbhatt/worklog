CREATE TABLE `journals` (
	`journal_id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	CONSTRAINT "journals_journal_id_normalized" CHECK("journals"."journal_id" = upper(trim("journals"."journal_id")) AND "journals"."journal_id" <> '')
);
--> statement-breakpoint
INSERT OR IGNORE INTO `journals` (`journal_id`, `created_at`)
SELECT upper(trim(`journal_id`)), min(`created_at`) FROM `file_logs`
WHERE trim(`journal_id`) <> '' GROUP BY upper(trim(`journal_id`));
