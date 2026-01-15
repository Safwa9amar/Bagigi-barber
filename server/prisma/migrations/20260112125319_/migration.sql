/*
  Warnings:

  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkingDay` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_serviceId_fkey`;

-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_userId_fkey`;

-- DropForeignKey
ALTER TABLE `WorkingDay` DROP FOREIGN KEY `WorkingDay_userId_fkey`;

-- DropTable
DROP TABLE `Booking`;

-- DropTable
DROP TABLE `Service`;

-- DropTable
DROP TABLE `User`;

-- DropTable
DROP TABLE `WorkingDay`;
