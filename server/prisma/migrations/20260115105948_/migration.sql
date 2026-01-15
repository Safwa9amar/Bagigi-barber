/*
  Warnings:

  - You are about to drop the column `imageUri` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Service` DROP COLUMN `imageUri`,
    ADD COLUMN `imagePath` VARCHAR(191) NULL;
