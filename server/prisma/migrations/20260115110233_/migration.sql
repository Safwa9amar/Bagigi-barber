/*
  Warnings:

  - You are about to drop the column `serviceId` on the `Image` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Image` DROP FOREIGN KEY `Image_serviceId_fkey`;

-- DropIndex
DROP INDEX `Image_serviceId_key` ON `Image`;

-- AlterTable
ALTER TABLE `Image` DROP COLUMN `serviceId`;
