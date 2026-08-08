# System Assumptions & Business Rules

1. **Soft Deletion for Customers**:
   - Deleting a customer does not purge records from MySQL; it toggles the `isDeleted = true` flag.
   - Soft-deleted customers are excluded from lists, searches, and new challan creation.

2. **Challan Auto-Numbering**:
   - Challan numbers follow the pattern `CH-YYYY-####` (e.g. `CH-2026-0001`).
   - Auto-increment sequences reset per year or continue sequentially inside an atomic DB transaction to avoid gaps or duplicate keys.

3. **Snapshot Fields in Challan Items**:
   - `productNameSnapshot`, `productSkuSnapshot`, and `unitPriceSnapshot` are frozen at the moment a Sales Challan is drafted.
   - Future edits to product names, SKUs, or unit prices will **never** alter historical challan receipts.

4. **Stock Movement & Restocking**:
   - Manual stock adjustments require specifying `movementType` (`IN`/`OUT`) and a mandatory `reason`.
   - Confirming a Sales Challan writes an `OUT` movement log with reason `"Sales Challan #CH-YYYY-####"`.
   - Cancelling a previously `Confirmed` Challan automatically restocks inventory (`IN` movement log) with reason `"Challan Cancelled #CH-YYYY-####"`.

5. **Role-Based Access Controls**:
   - `admin`: Full access to all endpoints (User registration, Customers, Products, Stock, Challans).
   - `sales`: Customer CRM (CRUD), Sales Challans (Create, Edit Draft, Confirm, Cancel, View).
   - `warehouse`: Product catalog & Stock adjustments, Challan views & dispatch confirmations.
   - `accounts`: Read-only reporting access to Customer catalog and Sales Challans list/details.

6. **GST Number**:
   - `gstNumber` is optional to support both unregistered retail buyers and registered GST tax entities.
