/*
  Warnings:

  - You are about to drop the column `imagePath` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Service` DROP COLUMN `imagePath`,
    ADD COLUMN `image` VARCHAR(191) NULL;
