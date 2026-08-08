# Mini ERP + CRM Operations Portal

Portfolio-grade full-stack mini ERP + CRM portal for a wholesale/distribution company.

## Tech Stack

- Backend: Node.js, Express.js, Sequelize, MySQL, JWT
- Frontend: React (Vite), plain CSS with design tokens + theme system
- API Style: REST

## Monorepo Structure

- `backend/`
- `frontend/`
- `docs/`
- `postman/`

## Current Progress

- Step 1: Backend scaffold completed
- Step 2: Core Sequelize models + associations completed
- Step 3: Auth module (login/register/me + role middleware + seed users) completed
- Step 4: Customers module API completed (CRUD, pagination, search, follow-ups, soft delete)
- Frontend shell for auth, layout, role-based menu, and theme toggle completed
- Customers frontend pages completed (list, add/edit, detail timeline, follow-up notes)

## Quick Start

1. Backend setup:
   - Copy `backend/.env.example` to `backend/.env`
   - Configure MySQL credentials
   - `cd backend && npm install && npm run seed && npm run dev`
2. Frontend setup:
   - Copy `frontend/.env.example` to `frontend/.env`
   - `cd frontend && npm install && npm run dev`

## Demo Credentials

- Admin: `admin@mini-erp.local` / `Admin@123`
- Sales: `sales@mini-erp.local` / `Sales@123`
- Warehouse: `warehouse@mini-erp.local` / `Warehouse@123`
- Accounts: `accounts@mini-erp.local` / `Accounts@123`
