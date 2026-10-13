CREATE TABLE `completion_events` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`cycle` integer NOT NULL,
	`request_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `completion_cycle` ON `completion_events` (`task_id`,`cycle`);--> statement-breakpoint
CREATE UNIQUE INDEX `completion_request` ON `completion_events` (`request_key`);--> statement-breakpoint
CREATE TABLE `execution_records` (
	`id` text PRIMARY KEY NOT NULL,
	`task_id` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text NOT NULL,
	`actual_minutes` real NOT NULL,
	`blocked_reason` text NOT NULL,
	`note` text NOT NULL,
	`request_key` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `execution_request` ON `execution_records` (`request_key`);--> statement-breakpoint
CREATE TABLE `plan_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_version` ON `plan_revisions` (`plan_id`,`version`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`priority` integer NOT NULL,
	`success` text NOT NULL,
	`estimated_minutes` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`source_review_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_source_review` ON `plans` (`source_review_id`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`improvement` text NOT NULL,
	`snapshot` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`plan_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`due_date` text NOT NULL,
	`priority` integer NOT NULL,
	`tags` text NOT NULL,
	`estimated_minutes` integer NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`cycle` integer DEFAULT 1 NOT NULL,
	`deleted_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `task_plan` ON `tasks` (`plan_id`);