# Database Schema Reference (MySQL + Sequelize)

## Entity Relationship Summary

```
 ┌──────────────┐         1:N         ┌───────────────────┐
 │    users     ├────────────────────►│     customers     │
 └──────┬───────┘                     └─────────┬─────────┘
        │ 1:N                                   │ 1:N
        ▼                                       ▼
 ┌──────────────┐                     ┌───────────────────┐
 │sales_challans│                     │customer_followups │
 └──────┬───────┘                     └───────────────────┘
        │ 1:N
        ▼
 ┌──────────────┐         N:1         ┌───────────────────┐
 │challan_items ├────────────────────►│     products      │
 └──────────────┘                     └─────────┬─────────┘
                                                │ 1:N
                                                ▼
                                      ┌───────────────────┐
                                      │  stock_movements  │
                                      └───────────────────┘
```

---

## Detailed Model Schemas

### 1. `User` (`users`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `name` — STRING (Required)
- `email` — STRING (Required, Unique, Indexed)
- `passwordHash` — STRING (Required)
- `role` — ENUM (`'admin'`, `'sales'`, `'warehouse'`, `'accounts'`) (Default: `'sales'`)
- `isActive` — BOOLEAN (Default: `true`)
- `createdAt`, `updatedAt` — TIMESTAMP

### 2. `Customer` (`customers`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `name` — STRING (Required, Indexed)
- `mobile` — STRING (Required, Indexed)
- `email` — STRING (Nullable)
- `businessName` — STRING (Nullable, Indexed)
- `gstNumber` — STRING (Nullable)
- `customerType` — ENUM (`'Retail'`, `'Wholesale'`, `'Distributor'`) (Default: `'Wholesale'`)
- `address` — TEXT (Nullable)
- `status` — ENUM (`'Lead'`, `'Active'`, `'Inactive'`) (Default: `'Lead'`)
- `followUpDate` — DATE (Nullable)
- `notes` — TEXT (Nullable)
- `isDeleted` — BOOLEAN (Default: `false`, Soft Delete)
- `createdBy` — INTEGER (Foreign Key -> `User.id`)
- `createdAt`, `updatedAt` — TIMESTAMP

### 3. `CustomerFollowUp` (`customer_followups`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `customerId` — INTEGER (Foreign Key -> `Customer.id`, CASCADE Delete)
- `note` — TEXT (Required)
- `followUpDate` — DATE (Nullable)
- `createdBy` — INTEGER (Foreign Key -> `User.id`)
- `createdAt`, `updatedAt` — TIMESTAMP

### 4. `Product` (`products`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `name` — STRING (Required, Indexed)
- `sku` — STRING (Required, Unique, Indexed)
- `category` — STRING (Required)
- `unitPrice` — DECIMAL(10, 2) (Required)
- `currentStock` — INTEGER (Default: `0`)
- `minStockAlert` — INTEGER (Default: `5`)
- `warehouseLocation` — STRING (Nullable)
- `createdAt`, `updatedAt` — TIMESTAMP

### 5. `StockMovement` (`stock_movements`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `productId` — INTEGER (Foreign Key -> `Product.id`, CASCADE Delete)
- `quantityChanged` — INTEGER (Required)
- `movementType` — ENUM (`'IN'`, `'OUT'`) (Required)
- `reason` — STRING (Required)
- `createdBy` — INTEGER (Foreign Key -> `User.id`)
- `createdAt` — TIMESTAMP

### 6. `SalesChallan` (`sales_challans`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `challanNumber` — STRING (Required, Unique, Indexed, e.g. `CH-2026-0001`)
- `customerId` — INTEGER (Foreign Key -> `Customer.id`)
- `totalQuantity` — INTEGER (Default: `0`)
- `status` — ENUM (`'Draft'`, `'Confirmed'`, `'Cancelled'`) (Default: `'Draft'`)
- `createdBy` — INTEGER (Foreign Key -> `User.id`)
- `createdAt`, `updatedAt` — TIMESTAMP

### 7. `ChallanItem` (`challan_items`)
- `id` — INTEGER (Primary Key, Auto Increment)
- `challanId` — INTEGER (Foreign Key -> `SalesChallan.id`, CASCADE Delete)
- `productId` — INTEGER (Foreign Key -> `Product.id`)
- `productNameSnapshot` — STRING (Required) — *Frozen copy of product name*
- `productSkuSnapshot` — STRING (Required) — *Frozen copy of product SKU*
- `unitPriceSnapshot` — DECIMAL(10, 2) (Required) — *Frozen unit price at creation*
- `quantity` — INTEGER (Required)
- `createdAt`, `updatedAt` — TIMESTAMP
