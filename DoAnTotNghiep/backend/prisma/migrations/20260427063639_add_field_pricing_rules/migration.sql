-- AlterTable
ALTER TABLE `payments` ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `field_pricing_rules` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field_id` INTEGER NOT NULL,
    `day_type` ENUM('WEEKDAY', 'WEEKEND', 'HOLIDAY', 'CUSTOM') NOT NULL,
    `start_time` VARCHAR(10) NOT NULL DEFAULT '00:00',
    `end_time` VARCHAR(10) NOT NULL DEFAULT '23:59',
    `price` DECIMAL(12, 2) NOT NULL,
    `currency` VARCHAR(8) NULL DEFAULT 'VND',
    `priority` INTEGER NULL DEFAULT 0,
    `active` BOOLEAN NULL DEFAULT true,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_pricing_field`(`field_id`),
    INDEX `idx_pricing_field_day`(`field_id`, `day_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `field_pricing_rules` ADD CONSTRAINT `fk_pricing_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
