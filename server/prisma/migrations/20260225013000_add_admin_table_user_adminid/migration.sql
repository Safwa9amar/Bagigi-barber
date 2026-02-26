-- Create Admin table
CREATE TABLE `Admin` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `Admin_userId_key`(`userId`),
  UNIQUE INDEX `Admin_code_key`(`code`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add relation column on User for assigned admin
ALTER TABLE `User` ADD COLUMN `adminId` VARCHAR(191) NULL;
CREATE INDEX `User_adminId_idx` ON `User`(`adminId`);

-- Foreign keys
ALTER TABLE `Admin` ADD CONSTRAINT `Admin_userId_fkey`
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `User` ADD CONSTRAINT `User_adminId_fkey`
  FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
