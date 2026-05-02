-- CreateTable
CREATE TABLE `review_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporter_id` INTEGER NOT NULL,
    `review_id` INTEGER NOT NULL,
    `reason` ENUM('SPAM', 'OFFENSIVE_LANGUAGE', 'FAKE_REVIEW', 'IRRELEVANT', 'HARASSMENT', 'OTHER') NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `admin_note` TEXT NULL,
    `handled_by` INTEGER NULL,
    `handled_at` DATETIME(0) NULL,
    `review_rating_snapshot` INTEGER NULL,
    `review_comment_snapshot` TEXT NULL,
    `review_author_id_snapshot` INTEGER NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_review_report_reporter`(`reporter_id`),
    INDEX `fk_review_report_review`(`review_id`),
    INDEX `fk_review_report_admin`(`handled_by`),
    INDEX `review_reports_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `review_reports` ADD CONSTRAINT `fk_review_report_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `review_reports` ADD CONSTRAINT `fk_review_report_review` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `review_reports` ADD CONSTRAINT `fk_review_report_admin` FOREIGN KEY (`handled_by`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
