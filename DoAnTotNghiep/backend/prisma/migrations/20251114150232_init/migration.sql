-- CreateTable
CREATE TABLE `admin_actions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `target_type` ENUM('USER', 'FIELD', 'BOOKING', 'VOUCHER', 'OWNER_PROFILE') NULL,
    `target_id` INTEGER NULL,
    `action` ENUM('APPROVE', 'REJECT', 'LOCK', 'UNLOCK', 'UPDATE', 'DELETE') NULL,
    `meta_json` TEXT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_admin_action_admin`(`admin_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blackout_dates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field_id` INTEGER NOT NULL,
    `start_datetime` DATETIME(0) NOT NULL,
    `end_datetime` DATETIME(0) NOT NULL,
    `reason` VARCHAR(255) NULL,

    INDEX `fk_blackout_field`(`field_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_status_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `from_status` VARCHAR(24) NULL,
    `to_status` VARCHAR(24) NULL,
    `changed_by` INTEGER NULL,
    `changed_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `reason` VARCHAR(255) NULL,

    INDEX `fk_bsh_booking`(`booking_id`),
    INDEX `fk_bsh_user`(`changed_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `field_id` INTEGER NOT NULL,
    `start_datetime` DATETIME(0) NOT NULL,
    `end_datetime` DATETIME(0) NOT NULL,
    `status` ENUM('PENDING_CONFIRM', 'APPROVED', 'AWAITING_PAYMENT', 'PAID', 'REJECTED', 'CANCELLED', 'COMPLETED', 'PAY_FAILED') NULL DEFAULT 'PENDING_CONFIRM',
    `total_price` DECIMAL(12, 2) NULL,
    `voucher_id` INTEGER NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_booking_field`(`field_id`),
    INDEX `fk_booking_user`(`user_id`),
    INDEX `bookings_field_id_start_datetime_idx`(`field_id`, `start_datetime`),
    INDEX `bookings_user_id_start_datetime_idx`(`user_id`, `start_datetime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facilities` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `icon` VARCHAR(120) NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `field_facilities` (
    `field_id` INTEGER NOT NULL,
    `facility_id` INTEGER NOT NULL,
    `note` VARCHAR(160) NULL,

    INDEX `fk_ff_facility`(`facility_id`),
    PRIMARY KEY (`field_id`, `facility_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `field_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field_id` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `is_primary` BOOLEAN NULL DEFAULT false,
    `order_no` INTEGER NULL DEFAULT 0,

    INDEX `fk_fieldimages_field`(`field_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fields` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `owner_id` INTEGER NOT NULL,
    `field_name` VARCHAR(160) NULL,
    `sport_type` VARCHAR(40) NULL,
    `description` TEXT NULL,
    `address` VARCHAR(255) NULL,
    `latitude` DECIMAL(10, 6) NULL,
    `longitude` DECIMAL(10, 6) NULL,
    `base_price_per_hour` DECIMAL(12, 2) NULL,
    `currency` VARCHAR(8) NULL DEFAULT 'VND',
    `status` ENUM('pending', 'active', 'hidden', 'maintenance') NOT NULL DEFAULT 'pending',
    `min_duration_minutes` INTEGER NULL DEFAULT 60,
    `max_players` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_field_owner`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `title` VARCHAR(160) NULL,
    `body` TEXT NULL,
    `type` ENUM('BOOKING', 'PAYMENT', 'SYSTEM', 'PROMO') NULL,
    `is_read` BOOLEAN NULL DEFAULT false,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_notify_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `operating_hours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `field_id` INTEGER NOT NULL,
    `day_of_week` TINYINT NOT NULL,
    `open_time` VARCHAR(10) NULL,
    `close_time` VARCHAR(10) NULL,

    INDEX `fk_operating_field`(`field_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `owner_profiles` (
    `user_id` INTEGER NOT NULL,
    `business_name` VARCHAR(160) NULL,
    `tax_code` VARCHAR(50) NULL,
    `address` VARCHAR(255) NULL,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `reject_reason` VARCHAR(255) NULL,
    `approved_by` INTEGER NULL,
    `approved_at` DATETIME(0) NULL,

    INDEX `fk_ownerprofile_admin`(`approved_by`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NULL,
    `provider` ENUM('VNPAY', 'MOMO', 'ZALOPAY', 'ONSITE', 'BANK_TRANSFER') NULL,
    `amount` DECIMAL(12, 2) NULL,
    `currency` VARCHAR(8) NULL DEFAULT 'VND',
    `transaction_code` VARCHAR(120) NULL,
    `status` ENUM('pending', 'success', 'failed', 'refunded') NULL DEFAULT 'pending',
    `paid_at` DATETIME(0) NULL,
    `raw_response` TEXT NULL,

    UNIQUE INDEX `booking_id`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `payment_id` INTEGER NOT NULL,
    `amount` DECIMAL(12, 2) NULL,
    `reason` VARCHAR(255) NULL,
    `status` ENUM('requested', 'processed', 'failed') NULL DEFAULT 'requested',
    `refunded_at` DATETIME(0) NULL,

    INDEX `fk_refund_payment`(`payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports_daily` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `day` DATE NOT NULL,
    `field_id` INTEGER NULL,
    `owner_id` INTEGER NULL,
    `total_bookings` INTEGER NULL DEFAULT 0,
    `total_revenue` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `generated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_report_field`(`field_id`),
    INDEX `fk_report_owner`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `field_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `rating` INTEGER NULL,
    `comment` TEXT NULL,
    `visible` BOOLEAN NULL DEFAULT true,
    `reply_text` TEXT NULL,
    `reply_at` DATETIME(3) NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_review_booking`(`booking_id`),
    INDEX `fk_review_field`(`field_id`),
    INDEX `fk_review_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_policies` (
    `policy_key` VARCHAR(64) NOT NULL,
    `value` TEXT NULL,
    `updated_by` INTEGER NULL,
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_policy_user`(`updated_by`),
    PRIMARY KEY (`policy_key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_vouchers` (
    `user_id` INTEGER NOT NULL,
    `voucher_id` INTEGER NOT NULL,
    `used_count` INTEGER NULL DEFAULT 0,
    `last_used_at` DATETIME(0) NULL,

    INDEX `fk_uv_voucher`(`voucher_id`),
    PRIMARY KEY (`user_id`, `voucher_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NULL,
    `email` VARCHAR(160) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `role` ENUM('USER', 'OWNER', 'ADMIN') NOT NULL,
    `status` ENUM('active', 'locked', 'deleted') NULL DEFAULT 'active',
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vouchers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(64) NOT NULL,
    `type` ENUM('PERCENT', 'FIXED') NULL,
    `discount_value` DECIMAL(12, 2) NULL,
    `max_discount_amount` DECIMAL(12, 2) NULL,
    `min_order_value` DECIMAL(12, 2) NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `usage_limit_total` INTEGER NULL DEFAULT 0,
    `usage_limit_per_user` INTEGER NULL DEFAULT 0,
    `status` ENUM('active', 'expired', 'inactive') NULL DEFAULT 'active',
    `owner_id` INTEGER NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `code`(`code`),
    INDEX `fk_voucher_creator`(`created_by`),
    INDEX `fk_voucher_owner`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_actions` ADD CONSTRAINT `fk_admin_action_admin` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `blackout_dates` ADD CONSTRAINT `fk_blackout_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `booking_status_history` ADD CONSTRAINT `fk_bsh_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `booking_status_history` ADD CONSTRAINT `fk_bsh_user` FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `fk_booking_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_facilities` ADD CONSTRAINT `fk_ff_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_facilities` ADD CONSTRAINT `fk_ff_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `field_images` ADD CONSTRAINT `fk_fieldimages_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fields` ADD CONSTRAINT `fk_field_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `fk_notify_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `operating_hours` ADD CONSTRAINT `fk_operating_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `owner_profiles` ADD CONSTRAINT `fk_ownerprofile_admin` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `owner_profiles` ADD CONSTRAINT `fk_ownerprofile_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `fk_refund_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reports_daily` ADD CONSTRAINT `fk_report_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reports_daily` ADD CONSTRAINT `fk_report_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `fk_review_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `fk_review_field` FOREIGN KEY (`field_id`) REFERENCES `fields`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `system_policies` ADD CONSTRAINT `fk_policy_user` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_vouchers` ADD CONSTRAINT `fk_uv_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_vouchers` ADD CONSTRAINT `fk_uv_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_voucher_creator` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_voucher_owner` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
