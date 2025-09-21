DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
ALTER TABLE `designs` ALTER COLUMN "avatar_measurements" TO "avatar_measurements" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
ALTER TABLE `designs` ALTER COLUMN "photo_urls" TO "photo_urls" text NOT NULL;--> statement-breakpoint
ALTER TABLE `designs` ALTER COLUMN "design_data" TO "design_data" text DEFAULT '{}';--> statement-breakpoint
ALTER TABLE `designs` DROP COLUMN `garment_templates`;--> statement-breakpoint
ALTER TABLE `designs` DROP COLUMN `materials`;--> statement-breakpoint
ALTER TABLE `designs` DROP COLUMN `is_purchased`;