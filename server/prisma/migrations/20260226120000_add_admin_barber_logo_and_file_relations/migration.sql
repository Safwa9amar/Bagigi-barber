-- Add barber logo fields to Admin
ALTER TABLE `Admin`
  ADD COLUMN `barberLogo` VARCHAR(191) NULL,
  ADD COLUMN `barberLogoUri` VARCHAR(191) NULL,
  ADD COLUMN `barberLogoFileId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Admin_barberLogoFileId_key` ON `Admin`(`barberLogoFileId`);

-- Extend Image table to act as generic File store
ALTER TABLE `Image`
  ADD COLUMN `uri` VARCHAR(191) NULL,
  ADD COLUMN `originalName` VARCHAR(191) NULL,
  ADD COLUMN `mimeType` VARCHAR(191) NULL,
  ADD COLUMN `size` INTEGER NULL,
  ADD COLUMN `uploadedById` VARCHAR(191) NULL;

CREATE INDEX `Image_uploadedById_idx` ON `Image`(`uploadedById`);

-- Relations
ALTER TABLE `Admin`
  ADD CONSTRAINT `Admin_barberLogoFileId_fkey`
  FOREIGN KEY (`barberLogoFileId`) REFERENCES `Image`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Image`
  ADD CONSTRAINT `Image_uploadedById_fkey`
  FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
