# Inventory Sales Hub

**Multi-tenant inventory and sales management platform for small and medium businesses.**

![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Status](#2-project-status)
3. [Key Features](#3-key-features)
4. [System Architecture](#4-system-architecture)
5. [Tech Stack](#5-tech-stack)
6. [Repository Structure](#6-repository-structure)
7. [Quick Start](#7-quick-start)
8. [Screenshots](#8-screenshots)
9. [Extended Documentation](#9-extended-documentation)
10. [Future Improvements](#10-future-improvements)
11. [Author](#11-author)

---

## 1. Project Overview

Inventory Sales Hub is a web and mobile platform for managing inventory, sales, customers, employees, and suppliers in a multi-tenant environment. It was developed as a Final Degree Project (TFG) for the Higher Technician in Multiplatform Application Development (DAM), with the goal of applying modern development practices used in professional environments.

### Problem

Small and medium businesses commonly manage their inventory in spreadsheets, process sales through disconnected tools, and have no integrated view of their operations. There is no single platform that combines stock tracking, point of sale, customer management, supplier relationships, business analytics, and a complete audit trail.

### Solution

Inventory Sales Hub consolidates these operations into a unified application:

- Product and category catalog with SKU tracking and pricing
- Real-time stock management with full movement history (in / out / adjustment)
- Integrated point of sale (POS) with a guided multi-step checkout flow
- Customer and supplier relationship management
- Business analytics (revenue trends, top products, inventory value)
- Complete audit trail for operational traceability
- Support for multiple independent business tenants on shared infrastructure

---

## 2. Project Status

| Module | Status | Notes |
|--------|--------|-------|
| Backend API | Functional | 11 controllers, 70+ endpoints |
| Frontend Web | Functional | All main features implemented |
| Mobile App | Beta | Catalog, cart, orders, profile |
| Offline Sales Sync | Implemented | IndexedDB queue with retry logic |
| Multi-tenancy | Implemented | Full JWT-based data isolation |
| i18n (ES / EN) | Complete | Auto-detection + persistence |
| Unit & E2E Tests | Partial | Vitest unit tests + Playwright on critical paths |
| CI/CD Pipeline | Active | GitHub Actions (frontend web) |

**Known limitations:**

- Password reset email is not delivered in development environments. The reset token is logged to the application console.
- The mobile application does not yet have offline sync parity with the web frontend.
- Backend unit and integration tests are not included in the current version.

---

## 3. Key Features

- **Multi-tenancy** — Each business operates in complete data isolation. All entities are scoped by `tenant_id`. An Admin role has global cross-tenant access for platform management.

- **Role-based access control** — Five roles (Admin, Company, Manager, Staff, Customer) with enforcement at both route level (frontend guard components) and API level (Spring Security `@PreAuthorize`).

- **Point of Sale** — A guided 4-step checkout wizard covering item selection with discount and tax application, shipping details, payment method selection (card with format validation, bank transfer, cash on delivery), and order summary confirmation.

- **Offline capability** — Sales created while offline are queued locally in IndexedDB via Dexie and automatically synchronized when the connection is restored. A background worker handles retry logic with exponential backoff.

- **Audit trail** — All critical operations (create, update, delete) are recorded in an audit log with before/after data snapshots and the identity of the acting user.

- **Analytics dashboard** — Revenue over time, top-selling products, top customers by purchase value, and total inventory valuation.

- **Mobile companion** — React Native application covering product catalog, shopping cart, order history, and user profile.

- **Demo mode** — The frontend runs fully without a backend using Mock Service Worker (MSW). Includes realistic seed data with 6 months of pre-generated sales history and multiple test personas.

- **Bilingual** — Complete Spanish and English interface via i18next, with automatic language detection from browser settings.

---

## 4. System Architecture

The project is organized as an npm workspace monorepo containing two frontend applications and one Spring Boot backend service.

```
┌─────────────────────────────────────────────────────────────────┐
│                           MONOREPO                              │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────────────────┐    │
│  │  frontend-web    │      │      frontend-mobile          │    │
│  │   React 19       │      │    React Native 0.77.3        │    │
│  │   Vite + TS      │      │    TypeScript + RN Nav        │    │
│  └────────┬─────────┘      └──────────────┬───────────────┘    │
│           │  HTTP · Authorization · X-Tenant-ID                 │
│  ┌────────▼─────────────────────────────────────────────────┐  │
│  │              backend-service  (Spring Boot 4)             │  │
│  │  Controller → Manager (Service) → DAO → Entity           │  │
│  │  Spring Security · JWT · RBAC · Global Exception Handler │  │
│  └────────────────────────────┬─────────────────────────────┘  │
│                               │ JDBC (HikariCP)                 │
│                        ┌──────▼──────┐                         │
│                        │ PostgreSQL  │                         │
│                        │ 16-alpine   │                         │
│                        └─────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

**Request lifecycle:**

1. Every request from the frontend carries an `Authorization: Bearer <token>` header and an `X-Tenant-ID` header, both attached automatically by Axios interceptors.
2. Spring Security validates the JWT signature and extracts role and tenant claims.
3. The `TenantContext` service makes the active tenant ID available throughout the request lifecycle.
4. Manager services apply tenant filtering in every DAO call, ensuring data never crosses tenant boundaries.
5. Responses are validated and transformed on the frontend using Zod schemas before reaching the UI layer.

For a detailed breakdown of each layer, see [docs/architecture.md](docs/architecture.md).

---

## 5. Tech Stack

### Backend

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Java | 21 | Language | LTS version with virtual threads, records, and sealed classes |
| Spring Boot | 4.0.2 | Application framework | Mature ecosystem, convention over configuration, strong Spring Security integration |
| Spring Security | 4.0.2 | Authentication & authorization | Native OAuth2 Resource Server for stateless JWT validation |
| Spring Data JPA | 4.0.2 | ORM / persistence | Eliminates DAO boilerplate; tenant-aware query methods via method naming conventions |
| PostgreSQL | 16 | Relational database | Robust open-source database; well-suited for multi-tenant schemas with `tenant_id` columns |
| jjwt | 0.11.5 | JWT creation and parsing | Lightweight, well-maintained Java JWT library with Jackson integration |
| Lombok | latest | Code generation | Reduces boilerplate (getters, setters, builders) without runtime overhead |
| HikariCP | (via Boot) | Connection pooling | Fastest JDBC connection pool; minimal configuration required |

### Frontend Web

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| React | 19 | UI library | Component model, concurrent features, large ecosystem |
| TypeScript | 5.7.2 | Type system | Strict compilation catches errors early; improves refactor safety across 13 feature modules |
| Vite | 6 | Build tool | Near-instant HMR, native ESM, fine-grained manual chunk splitting |
| TanStack Query | 5.96 | Server state management | Separates server and client state; declarative caching, background refetch, and query invalidation |
| Zustand | 5.0 | Client state management | Minimal boilerplate; appropriate for non-server state (cart, theme, notifications) |
| React Hook Form | 7.73 | Form state | Uncontrolled inputs with minimal re-renders; native Zod resolver integration |
| Zod | 4.3 | Schema validation | Single schema definition produces both TypeScript types and runtime validation |
| Axios | 1.7 | HTTP client | Interceptor API for token attachment, tenant header injection, and silent token refresh |
| MSW | 2.12 | API mocking | Intercepts requests at the Service Worker level; enables full frontend development without a running backend |
| Dexie | latest | IndexedDB wrapper | Clean promise-based API over IndexedDB for offline data persistence and sync queue |
| Radix UI | latest | UI primitives | Accessible, unstyled components; full design control without overriding framework styles |
| Recharts | 3.8 | Charts | Composable SVG-based chart components |
| Framer Motion | 12 | Animation | Declarative animation API for transitions and micro-interactions |
| i18next | 25 | Internationalisation | Standard i18n solution with React bindings; JSON locale files for ES and EN |
| Sentry | 10 | Error monitoring | Production error capture and performance monitoring |
| Vitest | 4.1 | Unit testing | Vite-native test runner; shares the same config and transform pipeline |
| Playwright | 1.59 | E2E testing | Reliable cross-browser automation for critical user journeys |

### Frontend Mobile

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| React Native | 0.77.3 | Mobile framework | Shares React knowledge and patterns with the web frontend |
| React Navigation | latest | Navigation | Standard navigation solution for React Native; supports tabs and native stacks |
| Encrypted Storage | latest | Secure token storage | OS-level encryption for credentials; safer than AsyncStorage for auth tokens |
| Axios | latest | HTTP client | Consistent interceptor pattern with the web frontend |

### Infrastructure

| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| Docker | latest | Container runtime | Reproducible PostgreSQL environment; no local database installation required |
| Docker Compose | latest | Service orchestration | Single-command startup with persistent volume |
| GitHub Actions | latest | CI/CD | Native GitHub integration; type-check, lint, test, build, and E2E on every push |
| npm Workspaces | npm 10 | Monorepo management | Native npm feature; orchestrates both frontend workspaces from the root |
| Husky | 8 | Git hooks | Pre-commit (format + lint) and pre-push (type-check + lint) enforcement |

---

## 6. Repository Structure

```
Inventory-Sales-Hub/
│
├── backend-service/                      Spring Boot 4 application
│   ├── src/main/java/com/inventory_sales_hub/app/
│   │   ├── config/                       SecurityConfig, TenantContext, CORS
│   │   ├── controllers/                  11 REST controllers (one per domain)
│   │   ├── model/
│   │   │   ├── dto/                      Request and response objects
│   │   │   ├── entities/                 18 JPA entities
│   │   │   ├── persistence/              Spring Data JPA repositories (DAOs)
│   │   │   └── service/                  Business logic (Manager classes)
│   │   └── exceptions/                   GlobalExceptionHandler + domain exceptions
│   └── src/main/resources/
│       ├── application.properties        Configuration (env-var driven)
│       └── data.sql                      Idempotent seed data (tenant, constraints)
│
├── frontend-web/                         React 19 + Vite SPA
│   ├── src/
│   │   ├── app/                          Bootstrap, global providers, router, MSW setup
│   │   ├── core/                         HTTP client, interceptors, query client, i18n, storage
│   │   ├── entities/                     Domain types + Zod schemas (source of truth)
│   │   ├── features/                     13 feature modules (api + hooks + components + ports)
│   │   ├── pages/                        Route-level page components (thin delegation layer)
│   │   ├── widgets/                      Reusable compound UI components
│   │   └── shared/                       Primitives, hooks, design tokens, utilities
│   ├── vite.config.ts                    Path aliases, chunk strategy, SCSS global imports
│   ├── vitest.config.ts                  Test environment and coverage configuration
│   └── .env.development                  Local environment variables
│
├── frontend-mobile/                      React Native 0.77.3 companion app
│   └── src/
│       ├── app/                          App root, navigation setup
│       ├── core/                         HTTP client, config, storage
│       └── features/                     auth, products, cart, orders, profile
│
├── docs/                                 Extended technical documentation
│   ├── architecture.md                   Architecture, patterns, decisions
│   ├── api.md                            Full API reference
│   ├── security.md                       Auth, RBAC, multi-tenancy
│   └── deployment.md                     Installation, env vars, CI/CD, testing
│
├── docker-compose.yml                    PostgreSQL 16 service definition
├── dev-start.ps1                         One-command development startup (PowerShell)
└── package.json                          Workspace root (scripts, husky, MSW config)
```

---

## 7. Quick Start

### Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|----------------|-------|
| Node.js | 22.0.0 | Frontend web; mobile requires >= 20.0.0 |
| npm | 10.0.0 | Included with Node.js |
| Java JDK | 21 | Any distribution (Temurin, Corretto, etc.) |
| Docker Desktop | latest | Required for the PostgreSQL container |

The Gradle wrapper (`gradlew.bat`) is included in the repository. No local Gradle installation is required.

### Option A — One command (Windows PowerShell)

```powershell
.\dev-start.ps1
```

This script starts PostgreSQL via Docker Compose, waits for initialization, then launches the backend and web frontend in separate terminal windows.

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:5173 |
| Backend (REST API) | http://localhost:8080/api |
| Database | localhost:5432 |

### Option B — Manual startup (three terminals)

**Terminal 1 — Database:**
```powershell
docker compose up -d
```

**Terminal 2 — Backend** (after Docker is ready):
```powershell
cd backend-service
.\run-dev.ps1
```

**Terminal 3 — Frontend:**
```powershell
npm run dev:web
```

### Demo mode (frontend only — no backend required)

Enable `VITE_MOCK_ENABLED=true` in `frontend-web/.env.development`, then:

```powershell
cd frontend-web
npm run dev
```

All API calls are intercepted by Mock Service Worker. The mock database includes 6 months of pre-generated sales data and realistic demo entities.

> **Demo mode requires `VITE_MOCK_ENABLED=true`** in `frontend-web/.env.development`. The accounts below do not exist in the real backend.

**Demo accounts:**

| Email | Role | Access Level |
|-------|------|-------------|
| `admin@ish.dev` | Admin | Global access, tenant management, impersonation |
| `cliente@ish.dev` | Customer | Catalog, cart, and own order history |
| `test@ish.dev` | Test | Limited role for exploration |

Password field is not validated in demo mode. Any non-empty value is accepted.

---

## 8. Screenshots

> Screenshots are located in `docs/screenshots/`. Recommended captures: login screen, role-based dashboard (admin view), POS checkout flow (payment step), inventory management table, analytics dashboard, and mobile product catalog.

---

## 9. Extended Documentation

| Document | Contents |
|----------|---------|
| [docs/architecture.md](docs/architecture.md) | Frontend feature module pattern, data flow, state management, auth lifecycle, offline sync, design system, architectural decisions |
| [docs/api.md](docs/api.md) | All REST endpoints organized by domain, authentication requirements, role restrictions, error format |
| [docs/security.md](docs/security.md) | JWT implementation, token lifecycle, silent refresh, RBAC roles and permissions, multi-tenancy isolation |
| [docs/deployment.md](docs/deployment.md) | Full environment variable reference, Docker configuration, CI/CD pipeline, testing strategy |

---

## 10. Future Improvements

- **Email service integration** — SMTP configuration for password reset delivery and notification emails in production environments.
- **PDF receipt generation** — Export POS receipts as downloadable PDF documents from the checkout confirmation screen.
- **Push notifications** — Real-time server-to-client notifications via WebSocket or Server-Sent Events.
- **Mobile offline sync** — Extend the offline sales queue to the React Native application, matching the web frontend's capability.
- **Backend test suite** — Unit and integration tests covering Manager services and DAO query correctness.
- **API rate limiting** — Per-tenant request throttling to prevent abuse in shared infrastructure scenarios.
- **Multi-currency checkout** — Dynamic currency support at point of sale with per-tenant currency configuration.
- **Audit log export** — Export filtered audit trail results to CSV or PDF for compliance reporting.

---

## 11. Author

**Sergio Ramos**
Final Degree Project — Higher Technician in Multiplatform Application Development (DAM)
Academic Year 2024–2025
