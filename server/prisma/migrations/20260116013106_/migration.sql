-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropIndex
DROP INDEX `Booking_userId_fkey` ON `Booking`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `guestName` VARCHAR(191) NULL,
    ADD COLUMN `guestPhone` VARCHAR(191) NULL,
    ADD COLUMN `isWalkIn` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `userId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
