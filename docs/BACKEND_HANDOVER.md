# BACKEND HANDOVER – StockMaster

## 1. Architecture Overview
- StockMaster uses **Next.js Server Actions** (RPC-style), *not* REST routes.
- Frontend developers should import actions directly:
  ```javascript
  import { createOperation, getDashboardStats } from "@/backend/actions";
  ```
  Call these inside server or client components (e.g., form actions or `useEffect` via server helpers).
- ⚠️ **Data Flow Reminder:** Server actions return plain JSON objects (already serialized). Dates arrive as ISO strings, so parse on the client (`new Date(value)`).

## 2. Authentication & Roles (Module 04)
- **Test Accounts**
  - Manager → `manager@stockmaster.com` / `pass123`
  - Staff → `staff1@stockmaster.com` / `pass123`
- **Available Actions**
  - `loginUser(formData)` → validates credentials and returns `{ success, user }`.
  - `signupUser(formData)` → registers a new staff account (manager approval handled separately).
  - `getAllUsers()` → managers use this to populate the Team table.
  - `updateUserRole(email, role)` → managers promote/demote users (`manager | staff`).

## 3. Master Data (Module 01)
- **Products**
  - `getProducts(query)`
    - Accepts `{ search?: string }` for name/SKU regex.
    - Each product includes `forecasted` (on-hand + pending receipts − pending deliveries) and `uom`.
  - `createProduct(formData)`
    - Required fields: `name`, `sku`, `cost`, `price`, `uom` (defaults to "Units" if omitted).
- **Warehouses & Locations**
  - `createWarehouse(formData)` → after creating a warehouse, it auto-creates `${shortCode}/Stock` internal location.
  - `getLocations()` → returns all active locations with populated `warehouse` references so UI can show contextual labels.

## 4. ⚠️ The Operations Engine (Module 02)
- **Concept**: double-entry inventory. Stock moves from `sourceLocation` ➜ `destLocation`.
- **Draft Workflow**
  - `createOperation(formData)`
    ```json
    {
      "type": "receipt | delivery | internal | adjustment",
      "partner": "Vendor/Customer name",
      "sourceLocation": "ObjectId",
      "destLocation": "ObjectId",
      "responsible": "User ObjectId",
      "lines": [ { "product": "ObjectId", "quantity": number } ]
    }
    ```
  - `updateOperationLines(id, lines)` (if needed) lets you edit draft lines prior to validation.
- **Validate Button**
  - `validateOperation(id)` is the critical action. It enforces stock rules, adjusts `StockQuant`s, and updates `Product.totalStock` when goods enter/leave the warehouse network.
  - Handle error responses (e.g., `{ error: "Insufficient stock" }`) with user-friendly toasts.

## 5. Inventory Adjustments & History (Module 04 Polish)
- `createAdjustment(formData)`
  - Use in the “Update Quantity” modal to reconcile physical counts. Inputs: `productId`, `locationId`, `realQuantity`.
  - Automatically updates the location’s `StockQuant`, global `totalStock`, and logs a completed `adjustment` operation for audit.
- `getMoveHistory()`
  - Returns all completed operations (sorted newest first) with populated `sourceLocation`, `destLocation`, and `responsible`. Use for the Moves History widget.

## 6. Dashboard Analytics (Module 03)
- `getDashboardStats()`
  ```json
  {
    "pendingReceipts": number,      // Draft receipts
    "pendingDeliveries": number,    // Draft deliveries
    "pendingInternal": number,      // Draft internal transfers
    "lowStockItems": number,        // Active products where totalStock < minStockRule
    "totalProducts": number         // Active catalog count
  }
  ```
  Call this when rendering the dashboard landing page to populate KPI cards.

---
**Final Notes**
- All server actions live in `backend/actions.js`. Import them directly; no REST boundaries needed.
- Use the QA endpoints (`/api/debug/*`) for regression checks before demo day.
