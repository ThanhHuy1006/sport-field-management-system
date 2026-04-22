-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `contact_email` VARCHAR(160) NULL,
    ADD COLUMN `contact_name` VARCHAR(120) NULL,
    ADD COLUMN `contact_phone` VARCHAR(30) NULL;
