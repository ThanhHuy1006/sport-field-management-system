-- CreateTable
CREATE TABLE `favorite_fields` (
    `user_id` INTEGER NOT NULL,
    `field_id` INTEGER NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `favorite_fields_field_id_idx`(`field_id`),
    PRIMARY KEY (`user_id`, `field_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `favorite_fields` ADD CONSTRAINT `favorite_fields_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `favorite_fields` ADD CONSTRAINT `favorite_fields_field_id_fkey` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
