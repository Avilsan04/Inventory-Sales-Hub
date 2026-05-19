# API Reference

All endpoints are served by the Spring Boot backend. The base URL in development is `http://localhost:8080/api`.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Auth Endpoints](#2-auth-endpoints)
3. [Products](#3-products)
4. [Sales](#4-sales)
5. [Inventory](#5-inventory)
6. [Customers](#6-customers)
7. [Employees](#7-employees)
8. [Suppliers](#8-suppliers)
9. [Analytics](#9-analytics)
10. [Notifications](#10-notifications)
11. [Audit Log](#11-audit-log)
12. [Settings](#12-settings)
13. [Admin](#13-admin)
14. [Error Format](#14-error-format)

---

## 1. Authentication

All protected endpoints require a valid JWT in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Additionally, tenant-scoped endpoints expect the active tenant identifier:

```
X-Tenant-ID: <tenantId>
```

Both headers are attached automatically by Axios interceptors in the frontend. Direct API consumers must set them manually.

**Access token** — obtained from `POST /auth/login`. Short-lived JWT signed with HS256.

**Refresh token** — set as an `HttpOnly` cookie by the server on login and refresh. Sent automatically by the browser on `POST /auth/refresh`. Not accessible from JavaScript.

---

## 2. Auth Endpoints

Base path: `/auth`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| POST | `/auth/login` | No | — | Authenticate with email and password. Returns `accessToken`; sets `refresh_token` HttpOnly cookie. |
| POST | `/auth/signup` | No | — | Register a new user account. |
| POST | `/auth/register` | No | — | Alias for `/auth/signup`. |
| POST | `/auth/refresh` | No | — | Exchange the HttpOnly refresh cookie for a new access token. |
| POST | `/auth/logout` | No | — | Clear the `refresh_token` cookie server-side. |
| GET | `/auth/me` | Yes | Any | Retrieve the authenticated user's profile. |
| PATCH | `/auth/me` | Yes | Any | Update profile fields (username, email). |
| DELETE | `/auth/me` | Yes | Any | Delete the authenticated user account. |
| PATCH | `/auth/me/password` | Yes | Any | Change password. Requires current password for verification. |
| POST | `/auth/forgot-password` | No | — | Request a password reset token sent by email. |
| POST | `/auth/reset-password` | No | — | Submit a new password using a valid reset token. |

**Login request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

---

## 3. Products

Base path: `/products`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/products` | Yes | Any | List all active products for the active tenant. |
| GET | `/products/{id}` | Yes | Any | Retrieve a single product by ID. |
| GET | `/products/categories` | Yes | Any | List all product categories for the active tenant. |
| POST | `/products` | Yes | Manager | Create a new product. |
| PUT | `/products/{id}` | Yes | Manager | Replace a product (full update). |
| PATCH | `/products/{id}` | Yes | Manager | Partial update of a product. |
| DELETE | `/products/{id}` | Yes | Manager | Soft-delete a product (sets `active = false`). |
| POST | `/products/categories` | Yes | Manager | Create a new product category. |

**Create product request:**
```json
{
  "name": "Laptop Pro 15",
  "description": "High-performance workstation laptop",
  "sku": "LAP-PRO-15",
  "purchasePrice": 850.00,
  "salePrice": 1199.99,
  "categoryId": 3,
  "supplierId": 1
}
```

---

## 4. Sales

Base path: `/sales`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/sales` | Yes | Staff | List sales with pagination. Supports filters: `page`, `size`, `search`, `dateFrom`, `dateTo`. |
| GET | `/sales/my-orders` | Yes | Any | List sales created by the authenticated user. |
| GET | `/sales/summary` | Yes | Staff | Aggregated sales statistics (total count, revenue, average value). |
| GET | `/sales/{id}` | Yes | Staff | Retrieve a single sale by ID. |
| GET | `/sales/{id}/items` | Yes | Staff | List line items for a specific sale. |
| POST | `/sales` | Yes | Staff | Create a new sale. The `processedBy` field is automatically set from the JWT. |
| PATCH | `/sales/{id}/status` | Yes | Staff | Update the status of a sale (`PENDING` → `COMPLETED` or `CANCELLED`). |

**Create sale request:**
```json
{
  "customerId": 5,
  "taxRate": 0.21,
  "discountPercent": 0,
  "items": [
    { "productId": 12, "quantity": 2, "unitPrice": 1199.99 },
    { "productId": 7,  "quantity": 1, "unitPrice": 49.99  }
  ]
}
```

**Sale statuses:** `PENDING` → `COMPLETED` | `CANCELLED`

---

## 5. Inventory

Base path: `/inventory`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/inventory` | Yes | Staff | List inventory records with pagination. Filters: `page`, `pageSize`, `search`, `status`. |
| GET | `/inventory/low-stock` | Yes | Staff | List products whose current quantity is below `minStock` threshold. |
| GET | `/inventory/movements` | Yes | Staff | Full history of stock movements (in / out / adjustment). |
| GET | `/inventory/{id}` | Yes | Staff | Retrieve inventory record for a specific product. |
| POST | `/inventory` | Yes | Manager | Create a new inventory record for a product. |
| PUT | `/inventory/{id}` | Yes | Manager | Replace an inventory record (full update). |
| PATCH | `/inventory/{id}/stock` | Yes | Staff | Adjust stock quantity. Creates a `StockMovement` record. |
| DELETE | `/inventory/{id}` | Yes | Manager | Delete an inventory record. |

**Stock adjustment request:**
```json
{
  "type": "IN",
  "quantity": 50,
  "note": "Received supplier order #2024-089"
}
```

**Movement types:** `IN` (stock received), `OUT` (stock sold or transferred), `ADJUSTMENT` (manual correction)

---

## 6. Customers

Base path: `/customers`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/customers` | Yes | Staff | List customers with pagination. Filters: `page`, `size`, `search`. |
| GET | `/customers/{id}` | Yes | Staff | Retrieve a single customer by ID. |
| POST | `/customers` | Yes | Staff | Create a new customer. |
| PUT | `/customers/{id}` | Yes | Staff | Update customer details. |
| DELETE | `/customers/{id}` | Yes | Staff | Delete a customer. |

**Create customer request:**
```json
{
  "name": "Almacenes Torres",
  "email": "compras@almacenes-torres.es",
  "phone": "+34 91 555 0123",
  "address": "Calle Mayor 42, 28013 Madrid"
}
```

---

## 7. Employees

Base path: `/employees`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/employees` | Yes | Manager | List employees with pagination. Filters: `page`, `size`. |
| GET | `/employees/{id}` | Yes | Manager | Retrieve a single employee by ID. |
| POST | `/employees` | Yes | Manager | Create a new employee (also creates the associated user account). |
| PUT | `/employees/{id}` | Yes | Manager | Update employee details. |
| DELETE | `/employees/{id}` | Yes | Manager | Delete an employee. |
| PATCH | `/employees/{id}/role` | Yes | Manager | Change an employee's role within the tenant. |

---

## 8. Suppliers

Base path: `/suppliers`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/suppliers` | Yes | Manager | List suppliers with pagination. Filters: `page`, `size`, `search`. |
| GET | `/suppliers/{id}` | Yes | Manager | Retrieve a single supplier by ID. |
| GET | `/suppliers/{id}/products` | Yes | Manager | List products associated with this supplier. |
| POST | `/suppliers` | Yes | Manager | Create a new supplier. |
| PUT | `/suppliers/{id}` | Yes | Manager | Update supplier details. |
| DELETE | `/suppliers/{id}` | Yes | Manager | Delete a supplier. Returns `409 CONFLICT` if the supplier has active orders. |
| POST | `/suppliers/{supplierId}/orders` | Yes | Manager | Create a purchase order for the supplier. |

---

## 9. Analytics

Base path: `/analytics`

All analytics endpoints are tenant-scoped and return aggregated data for the active tenant. The `limit` parameter controls the number of results for ranked queries.

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/analytics/dashboard` | Yes | Manager | Dashboard metrics: total revenue, order count, average order value, low-stock count. |
| GET | `/analytics/recent-sales` | Yes | Manager | Most recent N sales. Query param: `limit` (default 5). |
| GET | `/analytics/sales` | Yes | Manager | Sales aggregated by period for a date range. Query params: `start`, `end` (ISO 8601). |
| GET | `/analytics/top-products` | Yes | Manager | Top N products by units sold. Query param: `limit`. |
| GET | `/analytics/top-customers` | Yes | Manager | Top N customers by total purchase value. Query param: `limit`. |
| GET | `/analytics/inventory-value` | Yes | Manager | Total value of current inventory (sum of `quantity × purchasePrice`). |
| GET | `/analytics/low-stock-alerts` | Yes | Manager | Products where `quantity <= minStock`. |

---

## 10. Notifications

Base path: `/notifications`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/notifications` | Yes | Any | List all notifications for the authenticated user. |
| PATCH | `/notifications/{id}/read` | Yes | Any | Mark a specific notification as read. |
| PATCH | `/notifications/read-all` | Yes | Any | Mark all notifications for the current user as read. |

---

## 11. Audit Log

Base path: `/audit`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/audit` | Yes | Company | Retrieve audit log entries. Filters: `entityType`, `userId`. |

The audit log records all create, update, and delete operations performed in the tenant, including the acting user, timestamps, and before/after data snapshots.

---

## 12. Settings

Base path: `/settings`

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/settings` | Yes | Any | Retrieve current tenant settings (company name, logo URL, currency, timezone). |
| PUT | `/settings` | Yes | Any | Update tenant settings. |

**Settings request:**
```json
{
  "companyName": "Acme Distribuciones S.L.",
  "logoUrl": "https://cdn.example.com/acme-logo.png",
  "currency": "EUR",
  "timezone": "Europe/Madrid"
}
```

---

## 13. Admin

Base path: `/admin`

All admin endpoints require the `ADMIN` role. Admin users have a `null` `tenantId` in their JWT and are not scoped to any single tenant.

| Method | Path | Auth | Min Role | Description |
|--------|------|------|----------|-------------|
| GET | `/admin/tenants` | Yes | Admin | List all tenants registered on the platform. |
| GET | `/admin/metrics` | Yes | Admin | Platform-wide metrics across all tenants. |
| POST | `/admin/tenants/{id}/activate` | Yes | Admin | Activate a suspended tenant. |
| POST | `/admin/tenants/{id}/suspend` | Yes | Admin | Suspend an active tenant. |
| POST | `/admin/tenants/{id}/impersonate` | Yes | Admin | Generate a short-lived impersonation token scoped to the target tenant. |

---

## 14. Error Format

All error responses follow a consistent JSON structure. The `Content-Type` is always `application/json`.

### Standard error

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description of what went wrong."
}
```

### Validation error

```json
{
  "code": "VALIDATION_ERROR",
  "errors": {
    "email": "Must be a valid email address",
    "name": "Name is required"
  }
}
```

### HTTP status codes

| Status | Code | Cause |
|--------|------|-------|
| 400 | `VALIDATION_ERROR` | Bean validation failure (missing or malformed fields) |
| 400 | `DOMAIN_ERROR` | Business rule violation (e.g., duplicate SKU within tenant) |
| 400 | `SALE_ERROR` | Sale processing failure (e.g., insufficient stock) |
| 401 | — | Missing or expired `Authorization` header (Spring Security default response) |
| 403 | `FORBIDDEN` | Authenticated user lacks the required role for this operation |
| 404 | `NOT_FOUND` | Requested resource does not exist or is not accessible to the active tenant |
| 409 | `CONFLICT` | Operation conflicts with existing state (e.g., deleting a supplier with active orders) |
| 500 | `INTERNAL_ERROR` | Unhandled exception — full stack trace is logged server-side |
