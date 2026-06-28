CREATE TABLE `listening_questions` (
	`id` varchar(36) NOT NULL,
	`test_id` varchar(36) NOT NULL,
	`type` enum('multiple_choice','multiple_answers','short_answer','true_false_not_given','matching','fill_blank') NOT NULL,
	`question` text NOT NULL,
	`options` json,
	`correct_answer` json NOT NULL,
	`order_index` int NOT NULL DEFAULT 0,
	CONSTRAINT `listening_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listening_submissions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`test_id` varchar(36) NOT NULL,
	`answers` json NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`total_questions` int NOT NULL,
	`time_taken` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listening_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `listening_tests` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`audio_url` text NOT NULL,
	`transcript` text NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`time_minutes` int NOT NULL DEFAULT 30,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `listening_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`full_name` varchar(255),
	`avatar_url` text,
	`role` varchar(20) NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `reading_passages` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`passage` text NOT NULL,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`time_minutes` int NOT NULL DEFAULT 20,
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_passages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_questions` (
	`id` varchar(36) NOT NULL,
	`passage_id` varchar(36) NOT NULL,
	`type` enum('multiple_choice','multiple_answers','short_answer','true_false_not_given','matching','fill_blank') NOT NULL,
	`question` text NOT NULL,
	`options` json,
	`correct_answer` json NOT NULL,
	`explanation` text,
	`order_index` int NOT NULL DEFAULT 0,
	CONSTRAINT `reading_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reading_submissions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`passage_id` varchar(36) NOT NULL,
	`answers` json NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`total_questions` int NOT NULL,
	`time_taken` int,
	`feedback` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reading_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speaking_submissions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`test_id` varchar(36) NOT NULL,
	`transcripts` json NOT NULL,
	`audio_urls` json,
	`fluency_coherence` varchar(10),
	`lexical_resource` varchar(10),
	`grammatical_range` varchar(10),
	`pronunciation` varchar(10),
	`overall_band` varchar(10),
	`feedback` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speaking_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `speaking_tests` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`part` enum('part1','part2','part3') NOT NULL,
	`questions` json NOT NULL,
	`cue_card` text,
	`preparation_time` int DEFAULT 60,
	`speaking_time` int NOT NULL DEFAULT 120,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `speaking_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writing_submissions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`test_id` varchar(36) NOT NULL,
	`essay` text NOT NULL,
	`word_count` int NOT NULL DEFAULT 0,
	`task_achievement` varchar(10),
	`coherence_cohesion` varchar(10),
	`lexical_resource` varchar(10),
	`grammatical_range` varchar(10),
	`overall_band` varchar(10),
	`feedback` text,
	`improved_essay` text,
	`time_taken` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `writing_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `writing_tests` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`task` enum('task1','task2') NOT NULL,
	`prompt` text NOT NULL,
	`image_url` text,
	`time_minutes` int NOT NULL DEFAULT 40,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`is_published` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `writing_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `listening_questions` ADD CONSTRAINT `listening_questions_test_id_listening_tests_id_fk` FOREIGN KEY (`test_id`) REFERENCES `listening_tests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listening_submissions` ADD CONSTRAINT `listening_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `listening_submissions` ADD CONSTRAINT `listening_submissions_test_id_listening_tests_id_fk` FOREIGN KEY (`test_id`) REFERENCES `listening_tests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reading_questions` ADD CONSTRAINT `reading_questions_passage_id_reading_passages_id_fk` FOREIGN KEY (`passage_id`) REFERENCES `reading_passages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reading_submissions` ADD CONSTRAINT `reading_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reading_submissions` ADD CONSTRAINT `reading_submissions_passage_id_reading_passages_id_fk` FOREIGN KEY (`passage_id`) REFERENCES `reading_passages`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `speaking_submissions` ADD CONSTRAINT `speaking_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `speaking_submissions` ADD CONSTRAINT `speaking_submissions_test_id_speaking_tests_id_fk` FOREIGN KEY (`test_id`) REFERENCES `speaking_tests`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writing_submissions` ADD CONSTRAINT `writing_submissions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `writing_submissions` ADD CONSTRAINT `writing_submissions_test_id_writing_tests_id_fk` FOREIGN KEY (`test_id`) REFERENCES `writing_tests`(`id`) ON DELETE no action ON UPDATE no action;