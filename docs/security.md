# Security & Authentication

This document describes the authentication architecture, token lifecycle, role-based access control, and multi-tenancy isolation model of Inventory Sales Hub.

---

## Table of Contents

1. [Authentication Architecture](#1-authentication-architecture)
   - [Token Lifecycle](#11-token-lifecycle)
   - [Silent Refresh](#12-silent-refresh)
   - [Cross-Tab Synchronization](#13-cross-tab-synchronization)
2. [Password Security](#2-password-security)
3. [Role-Based Access Control](#3-role-based-access-control)
   - [Role Definitions](#31-role-definitions)
   - [Frontend Enforcement](#32-frontend-enforcement)
   - [Backend Enforcement](#33-backend-enforcement)
4. [Multi-Tenancy Isolation](#4-multi-tenancy-isolation)
   - [Backend Layer](#41-backend-layer)
   - [Frontend Layer](#42-frontend-layer)
   - [Admin Bypass](#43-admin-bypass)
5. [CORS Configuration](#5-cors-configuration)
6. [Public vs. Protected Endpoints](#6-public-vs-protected-endpoints)
7. [Security Considerations for Production](#7-security-considerations-for-production)

---

## 1. Authentication Architecture

The system uses a **stateless JWT-based authentication** model. The server does not maintain session state. Every request is authenticated by validating the JWT signature and claims.

### 1.1 Token Lifecycle

Two tokens are issued on login:

| Token | Location | Lifetime | Accessible from JS |
|-------|----------|----------|-------------------|
| Access token | `sessionStorage` | Short-lived (JWT `exp` claim) | Yes — read by Axios interceptor |
| Refresh token | `HttpOnly` cookie | 7 days | No — sent automatically by browser |

**Access token claims:**

```json
{
  "sub": "username",
  "id": 42,
  "role": "MANAGER",
  "tenantId": "7",
  "iat": 1716000000,
  "exp": 1716003600
}
```

**Why sessionStorage for the access token?**

Storing the access token in `sessionStorage` means it is cleared when the browser tab closes. This reduces the risk of an access token persisting in a compromised environment. The `bootstrapAuth()` function, called before React mounts, performs a silent refresh to re-acquire the token on page reload — so the user experience is seamless.

**Why not localStorage for the access token?**

`localStorage` persists across sessions and is readable by any script running on the same origin. An XSS vulnerability in a third-party script could exfiltrate a persistent token. `sessionStorage` limits this exposure to the active tab lifetime.

### 1.2 Silent Refresh

The response interceptor in `core/http/interceptors.ts` handles token expiry transparently:

```
Axios request → 401 response received
       │
       ├── is a refresh already in progress?
       │     YES → queue this request, wait for refresh to complete
       │     NO  → begin refresh:
       │             POST /auth/refresh (browser sends HttpOnly cookie)
       │               ├── success → store new accessToken
       │               │           → replay all queued requests
       │               └── failure → call onUnauthorized()
       │                             → navigate to /login
       │                             → clear all queued requests
```

This pattern ensures that when multiple requests expire simultaneously, only one refresh attempt is made. All other in-flight requests wait for the result and are retried with the new token.

### 1.3 Cross-Tab Synchronization

When a user logs in or logs out in one browser tab, other open tabs are notified via the `BroadcastChannel` API:

```typescript
broadcastTabSync({ type: 'AUTH_LOGIN'  })  // on successful login
broadcastTabSync({ type: 'AUTH_LOGOUT' })  // on logout
```

Receiving tabs update their auth state accordingly, preventing scenarios where one tab shows authenticated content after the user has logged out in another.

---

## 2. Password Security

- Passwords are hashed using **BCrypt** before storage. BCrypt is a one-way adaptive hash function designed to be slow, making brute-force attacks computationally expensive.
- The raw password is never logged or stored.
- The `PATCH /auth/me/password` endpoint requires the current password before accepting a new one, preventing unauthorized password changes if a session is compromised.
- Password reset uses a time-limited, single-use token stored in the `PasswordResetToken` entity. The token is invalidated after use.

---

## 3. Role-Based Access Control

### 3.1 Role Definitions

| Role | Tenant Scope | Primary Capabilities |
|------|-------------|----------------------|
| **ADMIN** | Global (no tenant) | Manage all tenants, view platform metrics, impersonate any tenant, access all data |
| **COMPANY** | Own tenant | All Manager capabilities + employees, suppliers, analytics, audit log, tenant settings |
| **MANAGER** | Own tenant | Products, inventory, customers, suppliers, analytics; read-only on employees |
| **STAFF** | Own tenant | Create and manage sales (POS), inventory adjustments, customer management |
| **CUSTOMER** | Own tenant | Browse product catalog, manage own cart, view own order history |

Roles are stored in the `users.role` column and embedded in the JWT at login time. If a user's role changes, the change takes effect on the next login (when a new JWT is issued).

### 3.2 Frontend Enforcement

Routes are protected by two guard components defined in `app/router/`:

**`ProtectedRoute`** — Verifies that the user is authenticated. Redirects to `/login` if no valid token is found.

**`RoleRoute`** — Accepts an `allowedRoles` array prop. Redirects the user to their role default path if their role is not in the allowed list.

```tsx
<Route
  path="/admin/tenants"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={['admin']}>
        <AdminTenantsPage />
      </RoleRoute>
    </ProtectedRoute>
  }
/>
```

The **`DashboardResolver`** component reads the authenticated user's role and redirects to the appropriate dashboard variant (admin dashboard, company dashboard, staff dashboard, customer dashboard).

> **Important:** Frontend route guards are a UX convenience, not a security boundary. All access control is enforced server-side.

### 3.3 Backend Enforcement

Role enforcement is applied at the method level using Spring Security's `@PreAuthorize` annotation:

```java
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@PostMapping
public ResponseEntity<ProductResponse> create(@RequestBody @Valid CreateProductRequest req) { ... }

@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/{id}/suspend")
public ResponseEntity<Void> suspendTenant(@PathVariable Long id) { ... }
```

The role is extracted from the JWT `role` claim by the `TenantContext` service and made available to Spring Security's method security evaluation. Requests that fail the role check receive a `403 FORBIDDEN` response with code `FORBIDDEN`.

---

## 4. Multi-Tenancy Isolation

Data isolation between tenants is enforced at two independent layers. Neither layer alone is sufficient — both work together to provide defense in depth.

### 4.1 Backend Layer (authoritative)

Every business entity has a `tenant_id` column. The `TenantContext` service extracts the `tenantId` claim from the JWT and makes it available throughout the request lifecycle via Spring's `SecurityContextHolder`.

All Manager (service) classes call `TenantContext.currentTenantId()` before executing any data operation:

```java
public List<ProductResponse> getAll() {
    Long tenantId = tenantContext.currentTenantId();
    return productDao.findAllByActiveTrueAndTenantId(tenantId)
                     .stream()
                     .map(this::toResponse)
                     .collect(toList());
}
```

DAO (repository) query methods embed the `tenant_id` filter directly in the method name:

```java
Optional<Product> findByIdAndActiveTrueAndTenantId(Long id, Long tenantId);
List<Product>     findAllByActiveTrueAndTenantId(Long tenantId);
```

This means it is structurally impossible for a Manager to return data for a different tenant without explicitly bypassing `TenantContext` — which no Manager does.

### 4.2 Frontend Layer (cache isolation)

The frontend enforces two complementary isolation mechanisms:

**Header injection:** Every Axios request carries `X-Tenant-ID: {tenantId}`. The value is read from `localStorage` (key: `ish.{env}.tenant_id`). This provides an explicit, inspectable contract between frontend and backend.

**Cache isolation:** All TanStack Query keys are namespaced by the active `tenantId` via the `withTenant()` helper:

```typescript
// Result: [tenantId, 'products', 'list']
productKeys.lists()
```

This means cached data for Tenant A and Tenant B is stored under completely different cache keys and will never be confused.

**Cache clearing:** On every login, logout, or tenant switch, `clearAllCache()` is called to flush all cached data. This prevents stale data from a previous session or tenant from being displayed.

### 4.3 Admin Bypass

Admin users have `tenantId = null` in their JWT. `TenantContext.currentTenantId()` returns `null` for Admin users. Admin-specific endpoints (e.g., `GET /admin/tenants`) operate on global data and do not apply the tenant filter.

When an Admin impersonates a tenant via `POST /admin/tenants/{id}/impersonate`, the backend returns a short-lived impersonation token scoped to that tenant. The frontend stores this token separately and sends it as the `X-Impersonation-Token` header, which the backend uses to override the tenant context for that session.

---

## 5. CORS Configuration

Cross-Origin Resource Sharing is configured in `SecurityConfig` with the following defaults:

| Setting | Value |
|---------|-------|
| Allowed origins | `http://localhost:5173`, `http://localhost:3000` |
| Allowed methods | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Allowed headers | `*` (all headers) |
| Credentials allowed | `true` (required for HttpOnly cookie on refresh) |
| Applied to | `/**` (all paths) |

Allowed origins are configurable via the `app.cors.allowed-origins` property. In production, this should be set to the actual frontend domain.

---

## 6. Public vs. Protected Endpoints

**Public endpoints** (no JWT required):

```
POST /auth/login
POST /auth/signup
POST /auth/register
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

**All other endpoints** require a valid JWT in the `Authorization: Bearer` header. An invalid, expired, or missing token results in a `401` response from Spring Security.

---

## 7. Security Considerations for Production

The following settings are appropriate for development but must be changed before any production deployment:

| Setting | Development value | Production recommendation |
|---------|------------------|--------------------------|
| `app.cookie.secure` | `false` | `true` — restricts refresh cookie to HTTPS |
| `app.cookie.sameSite` | `Strict` | Keep `Strict` |
| `app.cors.allowed-origins` | `http://localhost:5173` | Actual frontend domain(s) |
| `JWT_SECRET` | Dev key in `run-dev.ps1` | Long random secret (>= 32 bytes), managed via secrets manager |
| `DB_PASSWORD` | `postgres` | Strong unique password |
| `spring.jpa.hibernate.ddl-auto` | `update` | `validate` or `none` — use migration tool (Flyway/Liquibase) |
| `spring.sql.init.mode` | `always` | `never` after initial setup |
| `app.tax.rate` | `0.21` | Configure per tenant via `TenantSettings` |
| HikariCP `maximum-pool-size` | `5` | Scale based on expected concurrency |
