-- AlterTable
ALTER TABLE `fields` ADD COLUMN `address_line` VARCHAR(160) NULL,
    ADD COLUMN `district` VARCHAR(100) NULL,
    ADD COLUMN `province` VARCHAR(100) NULL,
    ADD COLUMN `ward` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `fields_province_idx` ON `fields`(`province`);

-- CreateIndex
CREATE INDEX `fields_district_idx` ON `fields`(`district`);

-- CreateIndex
CREATE INDEX `fields_ward_idx` ON `fields`(`ward`);
