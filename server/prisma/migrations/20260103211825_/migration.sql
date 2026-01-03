/*
  Warnings:

  - You are about to drop the column `confirmationToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_confirmationToken_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `confirmationToken`,
    ADD COLUMN `confirmationCode` VARCHAR(191) NULL,
    ADD COLUMN `confirmationCodeExpires` DATETIME(3) NULL,
    ADD COLUMN `emailConfirmed` BOOLEAN NOT NULL DEFAULT false;
