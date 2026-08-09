-- MySQL initialization script for fundsRoom backend
-- Run with: mysql -u root -p < init_mysql.sql

CREATE DATABASE IF NOT EXISTS `mini_erp_crm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mini_erp_crm`;

-- users
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(160) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin','sales','warehouse','accounts') NOT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `mobile` VARCHAR(20) NOT NULL,
  `email` VARCHAR(160),
  `businessName` VARCHAR(180) NOT NULL,
  `gstNumber` VARCHAR(30),
  `customerType` ENUM('Retail','Wholesale','Distributor') NOT NULL,
  `address` TEXT NOT NULL,
  `status` ENUM('Lead','Active','Inactive') NOT NULL DEFAULT 'Lead',
  `followUpDate` DATETIME,
  `notes` TEXT,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `createdBy` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(`name`),
  INDEX(`mobile`),
  INDEX(`businessName`),
  INDEX(`status`),
  INDEX(`customerType`),
  INDEX(`isDeleted`),
  CONSTRAINT `fk_customers_createdBy_users` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- customer_followups
CREATE TABLE IF NOT EXISTS `customer_followups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `note` TEXT NOT NULL,
  `followUpDate` DATETIME NOT NULL,
  `createdBy` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(`customerId`),
  INDEX(`followUpDate`),
  CONSTRAINT `fk_followups_customer` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_followups_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- products
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(180) NOT NULL,
  `sku` VARCHAR(80) NOT NULL UNIQUE,
  `category` VARCHAR(120) NOT NULL,
  `unitPrice` DECIMAL(10,2) NOT NULL,
  `currentStock` INT NOT NULL DEFAULT 0,
  `minStockAlert` INT NOT NULL DEFAULT 0,
  `warehouseLocation` VARCHAR(120),
  `imageUrl` VARCHAR(255),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(`sku`),
  INDEX(`name`),
  INDEX(`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- stock_movements (no updatedAt)
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productId` INT NOT NULL,
  `quantityChanged` INT NOT NULL,
  `movementType` ENUM('IN','OUT') NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `createdBy` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX(`productId`),
  INDEX(`movementType`),
  INDEX(`createdAt`),
  CONSTRAINT `fk_stock_product` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- sales_challans
CREATE TABLE IF NOT EXISTS `sales_challans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `challanNumber` VARCHAR(30) NOT NULL UNIQUE,
  `customerId` INT NOT NULL,
  `totalQuantity` INT NOT NULL DEFAULT 0,
  `status` ENUM('Draft','Confirmed','Cancelled') NOT NULL DEFAULT 'Draft',
  `createdBy` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(`challanNumber`),
  INDEX(`status`),
  INDEX(`customerId`),
  INDEX(`createdAt`),
  CONSTRAINT `fk_challans_customer` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_challans_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- challan_items
CREATE TABLE IF NOT EXISTS `challan_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `challanId` INT NOT NULL,
  `productId` INT NOT NULL,
  `productNameSnapshot` VARCHAR(180) NOT NULL,
  `productSkuSnapshot` VARCHAR(80) NOT NULL,
  `unitPriceSnapshot` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX(`challanId`),
  INDEX(`productId`),
  CONSTRAINT `fk_challanitem_challan` FOREIGN KEY (`challanId`) REFERENCES `sales_challans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_challanitem_product` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
