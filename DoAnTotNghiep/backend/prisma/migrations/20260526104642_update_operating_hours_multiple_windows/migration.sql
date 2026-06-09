/*
  Warnings:

  - Made the column `open_time` on table `operating_hours` required. This step will fail if there are existing NULL values in that column.
  - Made the column `close_time` on table `operating_hours` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `fields` ADD COLUMN `advance_booking_days` INTEGER NULL DEFAULT 30,
    ADD COLUMN `slot_step_minutes` INTEGER NULL DEFAULT 30;

-- AlterTable
ALTER TABLE `operating_hours` ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `is_active` BOOLEAN NULL DEFAULT true,
    ADD COLUMN `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `open_time` VARCHAR(5) NOT NULL,
    MODIFY `close_time` VARCHAR(5) NOT NULL;

-- CreateIndex
CREATE INDEX `idx_operating_field_day` ON `operating_hours`(`field_id`, `day_of_week`);
