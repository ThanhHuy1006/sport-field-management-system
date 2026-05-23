-- AlterTable
ALTER TABLE `fields` ADD COLUMN `hidden_at` DATETIME(3) NULL,
    ADD COLUMN `hidden_by_role` VARCHAR(191) NULL,
    ADD COLUMN `hidden_reason` VARCHAR(191) NULL;
