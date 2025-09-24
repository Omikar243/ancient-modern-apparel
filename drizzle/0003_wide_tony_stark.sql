CREATE TABLE `garments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`image_url` text,
	`price` real NOT NULL,
	`category` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`origin` text NOT NULL,
	`description` text,
	`texture_type` text NOT NULL,
	`image_url` text,
	`authenticity_rating` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
