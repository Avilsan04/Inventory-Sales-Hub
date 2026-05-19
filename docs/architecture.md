# Architecture

This document describes the internal architecture of Inventory Sales Hub: how each layer is structured, how data flows through the system, and why specific patterns were chosen.

---

## Table of Contents

1. [Frontend Web Architecture](#1-frontend-web-architecture)
   - [Directory Organization](#11-directory-organization)
   - [Feature Module Pattern](#12-feature-module-pattern)
   - [Data Flow](#13-data-flow)
   - [State Management](#14-state-management)
   - [Authentication Lifecycle](#15-authentication-lifecycle)
   - [Bundle Strategy](#16-bundle-strategy)
   - [Design Token System](#17-design-token-system)
2. [Backend Architecture](#2-backend-architecture)
   - [Layered Structure](#21-layered-structure)
   - [Multi-Tenancy](#22-multi-tenancy)
   - [Entity Model](#23-entity-model)
   - [Error Handling](#24-error-handling)
3. [Offline Sync Architecture](#3-offline-sync-architecture)
4. [Architectural Decisions](#4-architectural-decisions)

---

## 1. Frontend Web Architecture

The web frontend is a React 19 Single Page Application built with Vite. It follows a **feature-driven domain structure** where code is organized by business capability rather than technical type.

### 1.1 Directory Organization

```
src/
├── app/          Bootstrap, global providers, router, MSW initialization
├── core/         Framework wiring — not business logic
│   ├── api/      Query client, query key factory, Zod parse utilities, key mappers
│   ├── config/   Environment variables, API base URL, timing constants
│   ├── http/     Axios instance, request interceptor, response interceptor
│   ├── i18n/     i18next setup, locale files (es.json, en.json)
│   └── storage/  tokenStorage (sessionStorage), tenantStorage (localStorage)
├── entities/     Domain types + Zod schemas — consumed by all feature modules
├── features/     13 feature modules (see Feature Module Pattern below)
├── pages/        Route-level components — thin delegation to features and widgets
├── widgets/      Compound reusable components that combine UI with feature hooks
└── shared/
    ├── ui/       Design system — Radix-based primitives + composed components
    ├── hooks/    useDebounce, useOnlineStatus, useTheme, useTableFilters
    ├── adapters/ useCurrencyAdapter, useLanguageAdapter, useTranslationAdapter
    ├── lib/      Sentry observability, logger, cross-tab sync (broadcastTabSync)
    └── styles/   Design tokens (SCSS) — colors, typography, spacing, layout, z-index
```

**Key principle:** `pages/` is a thin layer. It delegates all logic and composition to `features/` (business logic) and `widgets/` (UI composition). A page component is typically 20–40 lines.

### 1.2 Feature Module Pattern

Each of the 13 feature modules in `features/{domain}/` follows the same internal structure:

```
features/products/
├── api/
│   ├── productsApi.ts        Raw API functions (getProducts, createProduct, etc.)
│   ├── products.mock.ts      MSW request handlers + seed data
│   └── index.ts
├── hooks/
│   ├── useProducts.ts        TanStack Query data hook
│   ├── useCreateProduct.ts   TanStack Query mutation hook
│   └── index.ts
├── components/               Feature-specific UI components (dialogs, forms)
├── ports/
│   └── IProductsApi.ts       TypeScript interface — decouples API from hook
└── index.ts                  Public API exports (barrel file)
```

**Why this structure:** Each feature is self-contained. Adding a new field to a product means touching `entities/product/`, `features/products/api/`, and `features/products/components/`. Nothing else changes. This reduces coupling and makes the scope of any change immediately visible.

### 1.3 Data Flow

A complete read cycle, from user action to rendered UI:

```
User navigates to /products
        │
        ▼
ProductsPage (pages/)
        │  mounts
        ▼
useProducts() hook (features/products/hooks/)
        │  calls
        ▼
productsApi.getProducts() (features/products/api/)
        │  executes via
        ▼
httpClient.get('/products') (core/http/)
        │  interceptors attach:
        │    Authorization: Bearer {accessToken}
        │    X-Tenant-ID: {tenantId}
        ▼
Backend → validates JWT → filters by tenantId → returns JSON
        │
        ▼
Zod parseOrThrow(productSchema) (core/api/)
        │  validates + transforms snake_case → camelCase
        ▼
TanStack Query caches result under key: [tenantId, 'products', 'list']
        │
        ▼
Component re-renders with typed, validated data
```

A write cycle (create/update/delete):

```
User submits form
        │
        ▼
useCreateProduct().mutate(payload) (features/products/hooks/)
        │
        ▼
productsApi.createProduct(payload) → POST /products
        │  on success:
        ▼
queryClient.invalidateQueries(['products', 'list'])
        │  triggers background refetch
        ▼
UI updates automatically — no manual state management
```

### 1.4 State Management

State is split across three distinct layers depending on its origin and lifetime:

| Layer | Tool | Manages | Why |
|-------|------|---------|-----|
| Server state | TanStack Query | API data, loading/error states, cache | Avoids duplicating server data in client stores; handles stale/refetch automatically |
| Client state | Zustand | Cart, notifications, theme, UI flags | Minimal boilerplate; appropriate for state that is not server-derived |
| Form state | React Hook Form + Zod | Input values, validation, submission | Uncontrolled inputs avoid re-render on every keystroke; Zod resolver gives compile-time type safety |

**Query key scoping:** All TanStack Query keys are prefixed with the active `tenantId` via the `withTenant()` helper in `core/api/queryKeys.ts`. This prevents cache collisions between sessions and tenants.

```typescript
// core/api/queryKeys.ts
export const productKeys = {
  all:        () => withTenant(['products']),
  lists:      () => withTenant(['products', 'list']),
  detail: (id: string) => withTenant(['products', 'detail', id]),
  categories: () => withTenant(['products', 'categories']),
};
// withTenant() prepends [tenantId] to the key array
```

When the active tenant changes or the user logs out, `clearAllCache()` flushes all cached queries to prevent stale cross-tenant data from appearing.

### 1.5 Authentication Lifecycle

Authentication is initialized **before React mounts**, ensuring the UI never renders in an indeterminate auth state:

```
main.tsx
  ├── bootstrapAuth()           Silent token refresh attempt via HttpOnly cookie
  │     ├── success → store new accessToken, fetch user profile, hydrate tenantId
  │     └── failure → clear stale token silently (user will hit login guard)
  └── ReactDOM.render(<App />)  Mounts only after auth state is resolved
```

**Token management:**

- `accessToken` — stored in `sessionStorage`. Deliberately not persisted across page reload to reduce XSS attack surface; `bootstrapAuth()` handles re-acquisition on reload.
- `refreshToken` — stored as an `HttpOnly` cookie (`SameSite=Strict`). Never accessible from JavaScript.

**Silent refresh queue (response interceptor in `core/http/interceptors.ts`):**

When a 401 response is received, the interceptor:
1. Pauses all in-flight requests by queuing them.
2. Sends a single `POST /auth/refresh` request using the HttpOnly cookie.
3. On success, replaces the stored access token and replays all queued requests.
4. On failure, calls `onUnauthorized()` which redirects to `/login`.

This prevents multiple simultaneous refresh attempts (a race condition sometimes called a "thundering herd") when several requests expire at the same time.

**Cross-tab synchronization:** `broadcastTabSync({ type: 'AUTH_LOGIN' | 'AUTH_LOGOUT' })` notifies other browser tabs of auth state changes via the BroadcastChannel API, keeping all open tabs consistent.

### 1.6 Bundle Strategy

Vite is configured with manual chunk splitting in `vite.config.ts` to optimize initial load time:

| Chunk | Contents |
|-------|---------|
| `vendor-react` | react, react-dom, react-router-dom |
| `vendor-query` | @tanstack/react-query |
| `vendor-radix` | All @radix-ui/* primitives |
| `vendor-charts` | recharts |
| `vendor-forms` | react-hook-form, zod |
| `vendor-motion` | framer-motion |
| `app-mock` | MSW handlers and seed data (excluded from production) |
| `features-auth` | Auth feature module |
| `features` | All other feature modules |
| `widgets-*` | Layout, POS, dashboard, shared widgets |
| `entities` | Domain types and Zod schemas |

This structure means a user navigating to the products page does not download POS or analytics code on the first visit.

### 1.7 Design Token System

All visual values (colors, spacing, typography, shadows, border radii, z-index) are defined as SCSS variables in `shared/styles/tokens/`. No literal values are written directly in component styles.

| Token File | Contents |
|------------|---------|
| `_colors.scss` | 150+ color variables for light theme, dark theme, sidebar, charts, and role-specific chips |
| `_typography.scss` | Font families (Inter, JetBrains Mono), 8 size variants, 4 weight levels, 5 line heights |
| `_spacing.scss` | Spacing scale (0.125rem → 12rem), border radii, shadow definitions, animation durations |
| `_layout.scss` | Breakpoints (xs → xl), container sizes, navbar and sidebar height constants |
| `_z-index.scss` | 8 stacking levels: base (1), topbar (30), sidebar (39), overlay (50), toast (100) |
| `_auth-colors.scss` | Login page branding: mesh gradients, glass morphism tokens, role card styling |

All token files are imported globally via `vite.config.ts` SCSS `additionalData`, so every component SCSS file has access to tokens without explicit imports.

---

## 2. Backend Architecture

The backend is a Spring Boot 4 application following a classical layered architecture, organized by technical role rather than domain.

### 2.1 Layered Structure

```
HTTP Request
     │
     ▼
Controller (controllers/)
     │  validates input (Bean Validation)
     │  extracts path/query params
     │  delegates to Manager
     ▼
Manager / Service (model/service/)
     │  enforces business rules
     │  calls TenantContext for tenant isolation
     │  orchestrates DAO calls
     │  maps entities to DTOs
     ▼
DAO / Repository (model/persistence/)
     │  Spring Data JPA interfaces
     │  tenant-aware query methods
     ▼
Entity (model/entities/)
     │  JPA-mapped POJOs
     │  Hibernate schema management
     ▼
PostgreSQL
```

**Manager naming convention:** Service classes are named `*Manager` (e.g., `ProductManager`, `SaleManager`, `InventoryManager`) to distinguish them from Spring-managed infrastructure services and make their role explicit in code navigation.

**DTO mapping:** All responses are mapped from entities to DTOs before leaving the Manager layer. Entities are never serialized directly to JSON. This keeps the API contract stable even when the internal model changes.

### 2.2 Multi-Tenancy

Every business entity has a `tenant_id` column. Tenant isolation is enforced at the DAO query level — not at the database level via row security, but via application-level filtering in every repository method.

**Backend flow:**

```
JWT → Spring Security → SecurityContext
                             │
                             ▼
                     TenantContext.currentTenantId()
                             │  reads from JWT claims
                             ▼
                     ProductManager.getAll()
                             │  calls:
                             ▼
                     productDao.findAllByActiveTrueAndTenantId(tenantId)
                             │
                             ▼
                     SQL: WHERE active = true AND tenant_id = ?
```

**Admin bypass:** Users with the `ADMIN` role have `tenant_id = NULL` in their JWT claims. `TenantContext` detects this and the DAO is called with a null tenant ID, which in practice means Admin-specific endpoints bypass the filter entirely and receive global data.

**Frontend enforcement (second layer):** The frontend also stores the `tenantId` in localStorage and sends it as the `X-Tenant-ID` header. This is not a security boundary (the JWT is authoritative), but it provides an explicit contract and simplifies debugging.

### 2.3 Entity Model

Core entities and their relationships:

```
Tenant ──< User
        ──< Product >── Category
                    └── Supplier ──< SupplierOrder >── SupplierOrderItem
        ──< Inventory >── StockMovement
        ──< Sale >── SaleItem >── Product
               └── Customer
        ──< Employee
        ──< AuditLog
        ──< Notification
```

Key design decisions in the entity model:

- **`SaleItem.unitPrice`** captures the product price at the time of sale. This ensures historical sales data is not affected by future price changes.
- **`StockMovement`** records `previousStock` and `newStock` for every inventory change, providing a complete audit trail of stock levels over time.
- **`AuditLog.beforeData` / `afterData`** store JSON snapshots of the entity state, enabling exact reconstruction of what changed and when.
- **`RefreshToken`** entities are stored in the database and validated server-side on every refresh request, enabling token revocation.

### 2.4 Error Handling

A single `@RestControllerAdvice` class (`GlobalExceptionHandler`) handles all exceptions and returns a consistent JSON format:

**Standard error:**
```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description"
}
```

**Validation error:**
```json
{
  "code": "VALIDATION_ERROR",
  "errors": {
    "fieldName": "Validation message",
    "email": "Must be a valid email address"
  }
}
```

**HTTP status mapping:**

| Condition | Status | Code |
|-----------|--------|------|
| Bean validation failure | 400 | `VALIDATION_ERROR` |
| Domain rule violation | 400 | `DOMAIN_ERROR` |
| Sale processing error | 400 | `SALE_ERROR` |
| Resource not found | 404 | `NOT_FOUND` |
| Delete conflict (FK) | 409 | `CONFLICT` |
| Role check failure | 403 | `FORBIDDEN` |
| Unhandled exception | 500 | `INTERNAL_ERROR` |

Domain exceptions (e.g., `ProductException`, `SaleException`) carry a message that the `GlobalExceptionHandler` inspects to determine the appropriate status code — `NOT_FOUND` for "not found" messages, `CONFLICT` for "cannot delete" messages, and `DOMAIN_ERROR` for everything else.

---

## 3. Offline Sync Architecture

The offline capability allows sales to be created and stored locally when the network is unavailable, then automatically synchronized when connectivity is restored.

**Two Dexie databases:**

```
AppDatabase (InventorySalesHub)
  tables: products, inventory, sales, customers, employees,
          suppliers, notifications, auditLogs
  purpose: local read cache for offline browsing

SyncDatabase (ISH_SyncQueue)
  table: syncQueue
    id        — UUID v4 (used as idempotency key)
    type      — operation type (e.g., CREATE_SALE)
    payload   — JSON serialized request body
    status    — pending | processing | completed | failed
    retries   — attempt count
    createdAt — timestamp for TTL enforcement
    updatedAt — last attempt timestamp
  purpose: outbox for mutations that failed due to no connectivity
```

**Worker lifecycle (`features/sales/workers/startSalesSyncWorker.ts`):**

```
App mounts
  └── startSalesSyncWorker()
        │  subscribes to onlineManager (TanStack Query integration)
        │
        ├── network goes offline → queue new mutations locally
        │
        └── network comes back online
              │
              ▼
          process pending queue
              │
              ├── entry → POST /sales with Idempotency-Key: {entry.id}
              │     ├── success → mark completed
              │     ├── 4xx error → mark failed (hard error, no retry)
              │     └── network error → increment retries, exponential backoff
              │
              └── entries older than 7 days → purge (TTL)
```

The `Idempotency-Key` header (set to the queue entry UUID) ensures the backend can safely deduplicate retried requests — a sale is never created twice even if the sync worker retries after a server-side timeout.

**UI indicators:**
- `OfflineBanner` — displayed in the header when `navigator.onLine === false`.
- `SalesSyncBanner` — shows pending/syncing counts; displays an error state with a manual retry button if sync fails permanently.

---

## 4. Architectural Decisions

The following decisions had meaningful alternatives. Each entry documents the choice made, what was considered, and the reasoning.

---

### Decision 1: Feature-driven directory structure

**Chosen:** `features/{domain}/` containing api, hooks, components, and ports per domain.

**Alternative:** Layer-driven structure — `api/`, `hooks/`, `components/` at the top level, with all domains mixed together.

**Reasoning:** Layer-driven structures scale poorly when a project has more than 3–4 features. Finding all files related to "sales" requires jumping between 4 top-level directories. Feature-driven structure keeps the scope of a change localized: touching the sales feature means working within `features/sales/`. It also makes it straightforward to add or remove an entire feature without leaving orphaned files in multiple directories.

---

### Decision 2: TanStack Query for server state

**Chosen:** TanStack Query (React Query v5).

**Alternatives:** SWR, Redux Toolkit Query, plain `useEffect` + `useState`.

**Reasoning:** TanStack Query provides the best combination of declarative caching, background refetch, automatic invalidation, and mutation handling. SWR is simpler but lacks first-class mutation management. Redux Toolkit Query requires Redux, adding significant boilerplate for state that is entirely server-derived. The stale-while-revalidate pattern and tenant-scoped cache key namespacing were decisive factors.

---

### Decision 3: Zustand for client state

**Chosen:** Zustand.

**Alternatives:** Redux, React Context + useReducer.

**Reasoning:** The application has limited client-side state that is not derived from the server: the shopping cart, notification preferences, and theme toggle. Redux introduces significant boilerplate (actions, reducers, selectors, slices) for this scope. React Context re-renders all consumers on every update, which creates performance problems for high-frequency state. Zustand provides a minimal store API with selective subscription, avoiding both problems.

---

### Decision 4: Mock Service Worker (MSW) for API mocking

**Chosen:** MSW at the Service Worker level.

**Alternatives:** JSON Server, Mirage.js, mocked Axios adapters.

**Reasoning:** MSW intercepts real network requests at the browser Service Worker layer, which means the application code — including Axios interceptors, headers, and error handling — runs exactly as it would against a real backend. JSON Server and Mirage.js require configuring a separate server or adapter layer that bypasses the real request pipeline. This matters because bugs in interceptor logic or header construction are only visible when real network calls are made.

---

### Decision 5: Dexie for offline persistence

**Chosen:** Dexie.js (IndexedDB wrapper).

**Alternatives:** localStorage, sessionStorage, a custom IndexedDB wrapper.

**Reasoning:** localStorage has a 5MB limit and is synchronous, making it unsuitable for structured data with indexing requirements. IndexedDB directly is verbose and callback-heavy. Dexie provides a clean, promise-based API with schema versioning, compound indexes, and transaction support — all of which are needed for the sync queue and local cache tables.

---

### Decision 6: Composition root for dependency injection

**Chosen:** `DependencyProvider` — a React context that instantiates services once and injects them via context.

**Alternatives:** Module-level singletons (direct imports), prop drilling, a DI container library.

**Reasoning:** `AuthService` depends on `tokenStorage` and `httpClient`, which need to be injectable for testing. Module-level singletons make testing difficult because they carry state between test runs. A DI container (InversifyJS, tsyringe) introduces significant complexity for a small number of injectable services. `DependencyProvider` provides a single composition root where dependencies are wired, making the dependency graph explicit and testable.

---

### Decision 7: Spring Boot 4 + Java 21 for the backend

**Chosen:** Spring Boot 4, Java 21, Gradle.

**Alternatives:** Node.js + Express/Fastify, NestJS, Python + FastAPI.

**Reasoning:** Spring Boot provides a mature, production-grade ecosystem for building REST APIs with authentication, validation, ORM, and connection pooling — all integrated and tested together. Java 21 LTS offers virtual threads (structured concurrency), modern language features (records, sealed classes), and strong type safety. A Node.js backend would allow code sharing with the frontend, but at the cost of a less opinionated structure and weaker typing without significant discipline. For a project that emphasizes multi-tenancy, RBAC, and audit compliance, Spring Security's declarative `@PreAuthorize` model was a significant advantage.

---

### Decision 8: npm Workspaces monorepo

**Chosen:** Single repository with npm workspaces (`frontend-web`, `frontend-mobile`).

**Alternatives:** Separate repositories per application, a dedicated monorepo tool (Nx, Turborepo).

**Reasoning:** A monorepo keeps related projects in one place, simplifying cross-cutting changes (shared types, shared dev tooling configuration, coordinated releases). npm Workspaces is a native npm feature requiring no additional tooling. Nx and Turborepo add build caching and task orchestration, which are valuable at scale but add meaningful complexity for a project with two frontend workspaces. The Spring Boot backend is not a Node workspace (it uses Gradle), so it sits alongside the workspaces as a conventional directory.
