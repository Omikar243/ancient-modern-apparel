CREATE TABLE `avatar_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `status` text NOT NULL,
  `capture_views` text NOT NULL,
  `input_image_urls` text NOT NULL,
  `normalized_image_urls` text DEFAULT '{}',
  `mask_urls` text DEFAULT '{}',
  `preview_image_urls` text DEFAULT '[]',
  `result_glb_url` text,
  `result_obj_url` text,
  `result_meta` text DEFAULT '{}',
  `pipeline_version` text DEFAULT 'phase1-smpl-baseline' NOT NULL,
  `error_code` text,
  `error_message` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `avatar_sessions_user_id_idx` ON `avatar_sessions` (`user_id`);
