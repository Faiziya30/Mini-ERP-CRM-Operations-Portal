# Architecture & System Design Overview

## Architectural Pattern: MVC (Model-View-Controller) + Service Layer

The backend follows a strict layered MVC pattern to separate concerns, maintain clean code boundaries, and guarantee data safety.

```
Client (React SPA) 
   │
   ▼
Express Router (`routes/`)
   │
   ▼
Validation & File Upload Middlewares (`validators/` + `middlewares/upload.js`)
   │
   ▼
Authentication & RBAC Middleware (`middlewares/auth.js` & `roleCheck.js`)
   │
   ▼
Controller Layer (`controllers/`) — Handles HTTP req/res translation only
   │
   ▼
Service Layer (`services/`) — Core business rules, PDF Generation, & DB transactions
   │
   ▼
Models (`models/`) — Sequelize ORM definitions & associations
   │
   ▼
MySQL Database (ACID Storage)
```

## Layer Responsibilities

1. **Routes (`src/routes/`)**: Declare endpoint definitions and attach middlewares. Strictly zero business logic inside routes.
2. **Validators (`src/validators/`)**: Input schema validation powered by `express-validator` to guarantee strict typing, required field checks, and HTTP 400 early returns.
3. **Middlewares (`src/middlewares/`)**:
   - `auth.js`: Verifies JWT tokens from `Authorization: Bearer <token>` header.
   - `roleCheck.js`: Role gate enforcing RBAC (`admin`, `sales`, `warehouse`, `accounts`).
   - `upload.js`: `Multer` file upload handler storing images in `/uploads/products` with size and extension validation.
   - `errorHandler.js`: Centralized error handler returning consistent JSON error shapes.
4. **Controllers (`src/controllers/`)**: Accepts sanitized request data, delegates processing to the Service layer, and invokes `apiResponse.js` standard success/error helpers.
5. **Services (`src/services/`)**:
   - `challan.service.js`: Atomic database transactions (`sequelize.transaction`) for stock deduction & restocking.
   - `pdf.service.js`: Server-side PDFKit document streaming for PDF dispatch receipts.
   - `dashboard.service.js`: Real-time SQL aggregations for live overview metrics.
6. **Models (`src/models/`)**: Defines Sequelize entities, schema column types, validation constraints, and model relationships (`hasMany`, `belongsTo`).

---

## Transaction Safety & Atomic Inventory Control

To prevent race conditions, dirty reads, and negative stock anomalies during simultaneous sales operations, all inventory-altering endpoints operate inside Managed Sequelize Database Transactions with explicit row-level locking (`lock: transaction.LOCK.UPDATE`):

### 1. Sales Challan Confirmation Flow (`POST /api/challans/:id/confirm`)
- Starts managed DB transaction.
- Locks the Sales Challan record for update.
- Fetches and locks all associated Product rows.
- **Stock Validation Step**: Checks `product.currentStock >= item.quantity` for every line item in the challan.
  - If **ANY** line item has insufficient stock, the transaction immediately rolls back completely.
  - Returns HTTP 400 with a detailed per-item error breakdown array (`requested` vs `available`).
- **Deduction & Movement Logging**:
  - Decrements `currentStock` for each product.
  - Inserts a `StockMovement` row (`movementType: 'OUT'`, `reason: "Sales Challan #CH-YYYY-XXXX"`).
- Updates challan status to `Confirmed`.
- Commits transaction atomically.

### 2. Challan Cancellation Restocking Flow (`POST /api/challans/:id/cancel`)
- Starts managed DB transaction with row lock.
- If the challan was previously in `Confirmed` state:
  - Fetches and locks all associated products.
  - Increments `currentStock` for each item.
  - Inserts a `StockMovement` row (`movementType: 'IN'`, `reason: "Challan Cancelled #CH-YYYY-XXXX"`).
- Updates challan status to `Cancelled`.
- Commits transaction atomically.

---

## PDF Generation & File Storage Architecture

- **PDF Generation**: Server-side document rendering powered by `pdfkit`, streaming PDF binaries directly to HTTP responses (`Content-Type: application/pdf`).
- **Product Image Storage**: Handled via `multer` storing files to `/uploads/products` and served statically via Express (`app.use('/uploads', express.static(...))`).
