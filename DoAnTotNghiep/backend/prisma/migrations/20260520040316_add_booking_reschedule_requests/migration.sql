-- CreateTable
CREATE TABLE `booking_reschedule_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `requested_by` INTEGER NOT NULL,
    `old_start_datetime` DATETIME(0) NOT NULL,
    `old_end_datetime` DATETIME(0) NOT NULL,
    `new_start_datetime` DATETIME(0) NOT NULL,
    `new_end_datetime` DATETIME(0) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `reason` VARCHAR(255) NULL,
    `owner_note` VARCHAR(255) NULL,
    `decided_by` INTEGER NULL,
    `decided_at` DATETIME(0) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_reschedule_booking`(`booking_id`),
    INDEX `booking_reschedule_requests_requested_by_idx`(`requested_by`),
    INDEX `booking_reschedule_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking_reschedule_requests` ADD CONSTRAINT `fk_reschedule_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
