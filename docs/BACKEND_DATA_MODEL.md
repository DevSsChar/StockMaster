# Backend Data Model & Actions

This document documents every Mongoose model plus the major server actions so frontend teammates know exactly what data exists, why each field matters, and which helper to call.

---

## 1. Product Model (`models/Product.js`)
Represents stock-tracked items.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `String` (required) | Shown in every UI list/card. |
| `sku` | `String` (required, unique, uppercase) | Canonical identifier; uppercase prevents `abc/ABC` duplicates. |
| `category` | `String` | Optional grouping for filtering. |
| `cost` & `price` | `Number >= 0` | Stored separately so we can show margin insights later. |
| `minStockRule` | `Number >= 0` | Minimum quantity threshold for alerts. |
| `totalStock` | `Number >= 0` | Aggregated snapshot used by dashboards. |
| `status` | `active | archived` | Soft-delete flag. |
| Timestamps | auto | Support "Created" / "Updated" badges. |

---

## 2. Location Model (`models/Location.js`)
Any place a product can live.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `String` (required) | e.g., `"SF/Stock"`. |
| `type` | `internal | vendor | customer | inventory_loss` | Drives UI filtering + validation. |
| `warehouse` | `ObjectId -> Warehouse` | Optional for vendor/customer, required when `type === "internal"`. |
| `address` | `String` | For customer/vendor directions. |
| `status` | `active | archived` | Soft-delete. |
| Timestamps | auto | Auditing. |

Internal locations must reference a warehouse—UI should show a warehouse dropdown in that case.

---

## 3. Warehouse Model (`models/Warehouse.js`)
Top-level parent to internal locations.

| Field | Type | Notes |
| --- | --- | --- |
| `name` | `String` (required) | e.g., "San Francisco". |
| `shortCode` | `String` (required, unique, uppercase) | Short label used in derived location names like `SF/Stock`. |
| `address` | `String` | Mailing/physical address. |
| Timestamps | auto | Lifecycle tracking. |

Every new warehouse automatically provisions its default internal stock location (see actions section).

---

## 4. Operation Model (`models/Operation.js`)
Tracks stock moves.

| Field | Type | Notes |
| --- | --- | --- |
| `reference` | `String` (unique, uppercase) | e.g., `WH/IN/0001`. |
| `type` | `receipt | delivery | internal` | Controls required locations. |
| `status` | `draft | ready | done | cancelled` | Mirrors Odoo-like workflow. |
| `sourceLocation` / `destLocation` | `ObjectId -> Location` | Where stock moves from/to. |
| `lines` | Array `{ product, quantity }` | Embedded move lines. |
| `scheduledDate` | `Date` | Used for calendar views. |
| Timestamps | auto | Traceability. |

---

## 5. User Model (`models/user.js`)
Authentication + authorization.

| Field | Type | Notes |
| --- | --- | --- |
| `email` | `String` (required, unique, lowercase) | Login ID. |
| `name` | `String` (required) | Display name. |
| `password` | `String` (optional, select:false) | Empty for OAuth users. |
| `image` | `String` | Avatar URL. |
| `role` | `manager | staff` | Used for RBAC. |
| `provider` | `credentials | google | github` | Helps login flows route the user. |
| `resetCode` / `resetCodeExpiry` | Hidden | Password recovery. |
| Timestamps | auto | Audit logs. |

Method `comparePassword` wraps bcrypt for secure checks.

---

## 6. Server Actions (`backend/actions.js`)
Every action returns `{ success: true }` on happy path or `{ error: string }` otherwise, plus triggers `revalidatePath` so static segments stay in sync.

### Products
- `createProduct(formData)`: Validates `name/sku`, saves, revalidates `/inventory/products`.
- `getProducts(query)`: Returns active products (including `totalStock`) with optional fuzzy search across `name` & `sku`.
- `updateProduct(formData)`: Partial updates; numeric fields parsed safely.
- `archiveProduct(id)`: Marks `status = archived`.

### Warehouses & Locations
- `getLocations()`: Lists active locations.
- `createWarehouse(formData)`: Creates warehouse, then automatically creates `${shortCode}/Stock` internal location, and revalidates `/inventory/warehouses` + `/inventory/locations`.
- `getWarehouses()`: Sorted list for dropdowns.
- `createLocation(formData)`: Validates `name` and ensures internal locations include `warehouse` before inserting.
- `updateLocation(formData)`: Fetches the current record so we never end up with an internal location lacking a warehouse.
- `archiveLocation(id)`: Marks location archived.

### User Administration & Auth
- `getAllUsers()`, `updateUserRole()`, `deleteUser()`: Settings page utilities.
- `randomizeUserRoles()`: Demo helper to shuffle manager/staff assignments.
- `signupUser()` / `loginUser()`: Credential flows with bcrypt hashing and OAuth guardrails.

Use these helpers in server/router actions so that data validation lives in one place and frontend simply consumes the responses.
