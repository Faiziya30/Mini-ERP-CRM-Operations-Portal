# Mini ERP + CRM Backend

Express + Sequelize + MySQL backend API for the operations portal.

## Run

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   - `npm install`
3. Start in dev mode:
   - `npm run dev`

## Seed Demo Data

- `npm run seed`

Creates demo users for roles: admin, sales, warehouse, accounts.

## Auth Endpoints

- `POST /api/auth/login`
- `POST /api/auth/register` (admin only)
- `GET /api/auth/me`
