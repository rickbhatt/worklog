DROP INDEX `ctr_logs_worked_at_idx`;--> statement-breakpoint
DELETE FROM `ctr_logs` WHERE rowid NOT IN (
	SELECT min(rowid) FROM `ctr_logs` GROUP BY `worked_at`
);--> statement-breakpoint
CREATE UNIQUE INDEX `ctr_logs_worked_at_unique` ON `ctr_logs` (`worked_at`);
