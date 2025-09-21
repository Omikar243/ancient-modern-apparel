CREATE TABLE `designs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`avatar_measurements` text,
	`photo_urls` text,
	`garment_templates` text,
	`materials` text,
	`design_data` text,
	`is_purchased` integer DEFAULT false,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
