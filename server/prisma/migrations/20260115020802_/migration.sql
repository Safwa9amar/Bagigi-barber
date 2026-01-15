/*
  Warnings:

  - You are about to drop the column `image` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[serviceId]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Service` DROP COLUMN `image`,
    ADD COLUMN `imageUri` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Image_serviceId_key` ON `Image`(`serviceId`);
