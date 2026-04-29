-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `discount_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    ADD COLUMN `original_price` DECIMAL(12, 2) NULL;

-- CreateIndex
CREATE INDEX `fk_booking_voucher` ON `bookings`(`voucher_id`);

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `fk_booking_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
