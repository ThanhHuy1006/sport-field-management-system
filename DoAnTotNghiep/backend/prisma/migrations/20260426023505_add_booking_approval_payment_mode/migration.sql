-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `approval_mode_snapshot` ENUM('AUTO', 'MANUAL') NULL DEFAULT 'MANUAL',
    ADD COLUMN `requested_payment_method` ENUM('VNPAY', 'MOMO', 'ZALOPAY', 'ONSITE', 'BANK_TRANSFER') NULL;

-- AlterTable
ALTER TABLE `fields` ADD COLUMN `approval_mode` ENUM('AUTO', 'MANUAL') NOT NULL DEFAULT 'MANUAL';
