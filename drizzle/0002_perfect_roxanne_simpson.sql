ALTER TABLE `tasks` ADD `task_kind` text DEFAULT 'task' NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `start_date` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `scheduled_time` text;