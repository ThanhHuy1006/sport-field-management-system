-- CreateTable
CREATE TABLE `field_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporter_id` INTEGER NOT NULL,
    `field_id` INTEGER NOT NULL,
    `booking_id` INTEGER NULL,
    `reason` ENUM('WRONG_INFO', 'FAKE_IMAGE', 'FIELD_CLOSED', 'BAD_QUALITY', 'OWNER_ATTITUDE', 'OTHER') NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `admin_note` TEXT NULL,
    `handled_by` INTEGER NULL,
    `handled_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_field_report_reporter`(`reporter_id`),
    INDEX `fk_field_report_field`(`field_id`),
    INDEX `fk_field_report_booking`(`booking_id`),
    INDEX `fk_field_report_admin`(`handled_by`),
    INDEX `field_reports_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `field_report_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `report_id` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `file_name` VARCHAR(255) NULL,
    `mime_type` VARCHAR(100) NULL,
    `file_size` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_field_report_attachment_report`(`report_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `field_reports` ADD CONSTRAINT `fk_field_report_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_reports` ADD CONSTRAINT `fk_field_report_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_reports` ADD CONSTRAINT `fk_field_report_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_reports` ADD CONSTRAINT `fk_field_report_admin` FOREIGN KEY (`handled_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_report_attachments` ADD CONSTRAINT `fk_field_report_attachment_report` FOREIGN KEY (`report_id`) REFERENCES `field_reports`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
