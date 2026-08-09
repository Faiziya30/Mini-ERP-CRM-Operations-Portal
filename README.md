# Mini ERP + CRM Operations Portal

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-purple.svg)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-blueviolet.svg)](https://sequelize.org/)

A full-stack, enterprise-grade **Mini ERP + CRM Operations Portal** designed specifically for wholesale and distribution companies. This repository demonstrates clean architecture, role-based access control (RBAC), database transaction safety, snapshot auditing, and custom-styled dark/light theme interfaces.

---

## Key Modules & Features

### 1. Authentication & Role-Based Access Control (RBAC)
- JWT-based authentication with bcrypt password hashing.
- 4 Granular System Roles:
  - **Admin**: Full portal access, including user registration and system management.
  - **Sales**: Customer CRM management, lead follow-ups, and sales challan creation/confirmation.
  - **Warehouse**: Inventory catalog management, stock adjustments (IN/OUT), movement log tracking, and dispatch views.
  - **Accounts**: Read-only oversight of customer registries and financial dispatch challans.
- Rate-limited login endpoints to prevent brute-force attempts.

### 2. Customer CRM
- Complete customer lifecycle tracking (**Lead**, **Active**, **Inactive**).
- Searchable by name, mobile number, or business name; filterable by type (**Retail**, **Wholesale**, **Distributor**).
- Timeline history for customer follow-up notes.
- Soft-deletion mechanism (`isDeleted` flag) to preserve relational integrity.

### 3. Product Catalog & Inventory Stock Control
- Item catalog with SKU uniqueness constraints, pricing, category, and minimum stock alert thresholds.
- Transaction-safe manual stock adjustments (`IN` / `OUT`) with mandatory audit reasons.
- Audit trail via `StockMovement` logs.
- Automatic low-stock visual badges on the frontend.

### 4. Sales Challan & Atomic Stock Deduction (Core Business Engine)
- Auto-generated sequential challan numbers (`CH-YYYY-####`).
- **Draft State**: Add/Edit customer details and dynamic product lines with real-time running quantity and price calculations.
- **Snapshot Pricing**: Freezes product name, SKU, and unit price at the time of creation to safeguard historical records against future catalog price changes.
- **Atomic Confirmation (`POST /api/challans/:id/confirm`)**: Executes inside a managed MySQL transaction with row-level locks (`LOCK.UPDATE`). Validates stock availability for *every* line item. If ANY line item lacks stock, the entire transaction rolls back and returns a 400 response with detailed itemized stock shortfalls.
- **Restocking Cancellation (`POST /api/challans/:id/cancel`)**: Cancelling a confirmed challan automatically restocks items (`StockMovement IN`) inside an atomic transaction.
- **Printable Dispatch View**: Clean invoice/dispatch slip layout optimized for printing or PDF export.

### 5. Interactive UI & Theme System
- Built with React (JavaScript) + hand-written Vanilla CSS with CSS custom properties (variables).
- **Dark Mode & Light Mode** toggle persisted in `localStorage` with a smooth color transition.
- Micro-interactions: Skeleton loaders, global toast notification stack, confirmation modals, animated input rings, and responsive navigation.

---

## Monorepo Folder Structure

```
mini-erp-crm/
├── backend/
│   ├── src/
│   │   ├── config/          # db.js (Sequelize MySQL connection), env config
│   │   ├── models/          # 7 Sequelize Models (User, Customer, FollowUp, Product, Stock, Challan, Item)
│   │   ├── controllers/     # Controller layer (req/res translation)
│   │   ├── routes/          # Express route definitions per module
│   │   ├── middlewares/     # Auth, RBAC, Validate, ErrorHandler
│   │   ├── services/        # Service layer (Stock deduction transactions, Challan generation, Stats)
│   │   ├── utils/           # Helpers (generateChallanNo, apiResponse, logger, seed)
│   │   ├── validators/      # Request schemas using express-validator
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + API client modules
│   │   ├── components/      # Reusable UI components (Sidebar, Topbar, Toast, PrivateRoute)
│   │   ├── context/         # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/           # Dashboard, Customers, Products, Challans, Users, Auth
│   │   ├── layouts/         # DashboardLayout (Sidebar + Topbar + Main shell)
│   │   ├── styles/          # global.css, variables.css (CSS design tokens & theme variables)
│   │   ├── hooks/           # useAuth, useTheme, useToast
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── postman/
│   └── mini-erp-crm.postman_collection.json
├── docs/
│   ├── architecture.md      # MVC diagram, transaction safety breakdown
│   ├── db-schema.md         # Full ER diagram & table field specifications
│   └── assumptions.md       # Business rules & design decisions
└── README.md                # Root project overview
```

---

## Quick Start & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher) running locally or accessible via network

### 1. Database Setup
Create a local MySQL database (e.g. `mini_erp_db`):
```sql
CREATE DATABASE mini_erp_db;
```

Alternatively, use the provided initialization SQL to create the schema and tables:

```bash
mysql -u root -p < backend/db/init_mysql.sql
```

### 2. Backend Configuration
```bash
cd backend
cp .env.example .env
```
Configure your `.env` file with your MySQL credentials:
```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=mini_erp_db
DB_USER=root
DB_PASS=your_mysql_password
JWT_SECRET=super_secret_jwt_key_mini_erp
JWT_EXPIRY=24h
```

Install backend dependencies and run the seed script:
```bash
npm install
npm run seed
npm run dev
```

Note: `mysql2` is included as a dependency in `backend/package.json`; ensure your MySQL server is running and the `.env` values match.

### 3. Frontend Configuration
In a new terminal tab:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## Default Seed User Credentials

| Role | Email | Password | Allowed Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mini-erp.local` | `Admin@123` | Full System Access + User Management |
| **Sales** | `sales@mini-erp.local` | `Sales@123` | Customers CRM & Sales Challans |
| **Warehouse** | `warehouse@mini-erp.local` | `Warehouse@123` | Product Catalog, Stock Adjustments & Dispatch |
| **Accounts** | `accounts@mini-erp.local` | `Accounts@123` | Customer Directory & Challan Reports |

---

## Documentation & Postman

- **Architecture Details**: See [`docs/architecture.md`](docs/architecture.md)
- **Database ER Schema**: See [`docs/db-schema.md`](docs/db-schema.md)
- **Business Assumptions**: See [`docs/assumptions.md`](docs/assumptions.md)
- **Postman API Collection**: Import [`postman/mini-erp-crm.postman_collection.json`](postman/mini-erp-crm.postman_collection.json) into Postman to test all endpoints.
