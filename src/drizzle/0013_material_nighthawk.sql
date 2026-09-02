CREATE TABLE `attendance_overrides` (
	`date` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
