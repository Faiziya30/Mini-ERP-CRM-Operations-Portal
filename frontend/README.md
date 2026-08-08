# Mini ERP + CRM Frontend

React + Vite dashboard frontend.

## Run

1. Copy `.env.example` to `.env`
2. Install dependencies:
   - `npm install`
3. Start development server:
   - `npm run dev`

## Current Module Status

- Module 1 shell complete:
  - Login page
  - Auth context
  - Role-aware sidebar
  - Theme toggle (light/dark)
  - Protected routes + 403 page
- Module 2 complete:
   - Customer list with search, status/type filters, pagination
   - Add/edit customer form with validation
   - Customer detail with follow-up timeline + add note
   - Admin-only delete with confirmation dialog
- Module 3 complete:
   - Product list with search, category filter, low-stock toggle
   - Add/edit product form with validation
   - Product detail page with stock movement log
   - Stock adjustment modal (IN/OUT + reason)
