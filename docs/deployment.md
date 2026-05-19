# Deployment & Configuration

This document covers environment setup, installation options, environment variables, Docker configuration, the CI/CD pipeline, and the testing strategy.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
   - [Option A — One Command](#21-option-a--one-command-windows-powershell)
   - [Option B — Manual](#22-option-b--manual-startup)
   - [Frontend Only (Demo Mode)](#23-frontend-only--demo-mode)
3. [Environment Variables](#3-environment-variables)
   - [Backend](#31-backend)
   - [Frontend Web](#32-frontend-web)
4. [Docker Configuration](#4-docker-configuration)
5. [CI/CD Pipeline](#5-cicd-pipeline)
6. [Testing Strategy](#6-testing-strategy)
   - [Unit Tests](#61-unit-tests)
   - [End-to-End Tests](#62-end-to-end-tests)
   - [Manual Testing](#63-manual-testing)
   - [Running Tests](#64-running-tests)

---

## 1. Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|----------------|-------|
| Node.js | 22.0.0 | Required for `frontend-web`. Mobile requires >= 20.0.0 |
| npm | 10.0.0 | Included with Node.js 22 |
| Java JDK | 21 | Any distribution (Eclipse Temurin, Amazon Corretto, Oracle JDK) |
| Docker Desktop | latest | Required to run the PostgreSQL container |
| Git | latest | For cloning the repository |

**Gradle wrapper** — `gradlew.bat` (Windows) and `gradlew` (Unix) are included in `backend-service/`. No local Gradle installation is required.

**React Native** (mobile only) — Android Studio with Android SDK, or Xcode (macOS only for iOS). Standard React Native environment setup applies.

---

## 2. Installation

### 2.1 Option A — One Command (Windows PowerShell)

Clone the repository and run:

```powershell
git clone <repository-url>
cd Inventory-Sales-Hub
npm install          # Install root + workspace dependencies
.\dev-start.ps1      # Start all services
```

`dev-start.ps1` performs the following steps:
1. Starts PostgreSQL via `docker compose up -d`
2. Waits 3 seconds for the container to initialize
3. Launches the backend in a new terminal window (`backend-service/run-dev.ps1`)
4. Launches the frontend web dev server in a new terminal window (`frontend-web/npm run dev`)

**Ports after startup:**

| Service | URL |
|---------|-----|
| Frontend Web | http://localhost:5173 |
| Backend REST API | http://localhost:8080/api |
| PostgreSQL | localhost:5432 |

### 2.2 Option B — Manual Startup

**Step 1 — Install dependencies (root):**
```powershell
npm install
```

**Step 2 — Start the database:**
```powershell
docker compose up -d
```

Wait until the container is healthy. Verify with:
```powershell
docker compose ps
```

**Step 3 — Start the backend** (new terminal):
```powershell
cd backend-service
.\run-dev.ps1
```

The backend is ready when the console shows:
```
Started AppApplication in X.XXX seconds
```

**Step 4 — Start the frontend** (new terminal):
```powershell
npm run dev:web
```

### 2.3 Frontend Only — Demo Mode

The frontend can run independently without any backend or database by enabling Mock Service Worker:

1. Edit `frontend-web/.env.development`:
   ```
   VITE_MOCK_ENABLED=true
   ```

2. Start the development server:
   ```powershell
   cd frontend-web
   npm run dev
   ```

All API requests are intercepted by MSW. The mock data layer includes realistic seed data (products, customers, employees, suppliers, 6 months of sales history) and 4 demo user accounts.

**Demo accounts:**

| Email | Role |
|-------|------|
| `admin@ish.dev` | Admin |
| `empresa@ish.dev` | Company |
| `test@ish.dev` | Manager |
| `cliente@ish.dev` | Customer |

> In demo mode, any password value is accepted.

---

## 3. Environment Variables

### 3.1 Backend

Configuration is located in `backend-service/src/main/resources/application.properties`. All sensitive values are read from environment variables.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_URL` | Yes | — | PostgreSQL JDBC URL. Example: `jdbc:postgresql://localhost:5432/inventory_db` |
| `DB_USERNAME` | No | `postgres` | Database username |
| `DB_PASSWORD` | No | `postgres` | Database password |
| `JWT_SECRET` | Yes | — | Secret key for signing JWTs. Must be at least 32 characters |

Additional properties configured directly in `application.properties` (not via env vars):

| Property | Value | Description |
|----------|-------|-------------|
| `app.cors.allowed-origins` | `http://localhost:5173,http://localhost:3000` | Allowed frontend origins |
| `app.cookie.secure` | `false` | Set to `true` in production (HTTPS only for refresh cookie) |
| `app.tax.rate` | `0.21` | Default tax rate applied to sales (21% VAT, Spain) |
| `spring.jpa.hibernate.ddl-auto` | `update` | Auto-creates and updates the schema on startup |
| `spring.datasource.hikari.maximum-pool-size` | `5` | Maximum concurrent database connections |

**Development values** (set by `run-dev.ps1`):
```powershell
$env:DB_URL      = 'jdbc:postgresql://localhost:5432/inventory_db'
$env:DB_USERNAME = 'postgres'
$env:DB_PASSWORD = 'postgres'
$env:JWT_SECRET  = 'inventory-sales-hub-dev-secret-key-2025-tfg'
```

> The JWT secret in `run-dev.ps1` is for local development only. Never use it in a production or shared environment.

### 3.2 Frontend Web

Variables are defined in `frontend-web/.env.development`. All variables must be prefixed with `VITE_` to be accessible in browser code.

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Backend REST API base URL |
| `VITE_MOCK_ENABLED` | `false` | Set to `true` to enable MSW (demo mode, no backend needed) |
| `VITE_APP_VERSION` | `0.0.1` | Application version displayed in the UI |
| `VITE_SENTRY_DSN` | (empty) | Sentry DSN for error monitoring in production |

For production builds, create `frontend-web/.env.production` with the appropriate values. Vite automatically selects the correct file based on the build mode.

---

## 4. Docker Configuration

The `docker-compose.yml` at the repository root defines the PostgreSQL service used in development:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: inventory_db
    environment:
      POSTGRES_DB: inventory_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

**Key points:**

- **Image:** `postgres:16-alpine` — minimal Alpine-based image, ~80 MB.
- **Persistent volume:** `postgres_data` ensures the database survives container restarts. To reset the database entirely, run `docker compose down -v`.
- **Port mapping:** `5432:5432` — the database is accessible locally at `localhost:5432`.
- **Credentials:** Match the `DB_USERNAME` and `DB_PASSWORD` environment variables expected by the backend.

**Common commands:**

```powershell
docker compose up -d          # Start in background
docker compose down           # Stop containers (data preserved)
docker compose down -v        # Stop containers and delete volume (resets DB)
docker compose logs postgres  # View database logs
```

---

## 5. CI/CD Pipeline

The GitHub Actions workflow is defined in `.github/workflows/ci.yml`. It runs exclusively on `frontend-web` code to validate correctness before merging.

**Triggers:**

```yaml
on:
  push:
    branches: [main, Sergio-Front]
    paths: [frontend-web/**]
  pull_request:
    branches: [main]
    paths: [frontend-web/**]
```

Changes outside `frontend-web/` (backend, mobile, docs) do not trigger the pipeline.

**Pipeline steps (sequential):**

| Step | Command | Purpose |
|------|---------|---------|
| 1. Checkout | `actions/checkout@v4` | Clone repository |
| 2. Node setup | `actions/setup-node@v4` (Node 24) | Install Node with npm cache |
| 3. Install | `npm ci --ignore-scripts` | Install dependencies reproducibly |
| 4. Rollup binary | `npm i @rollup/rollup-linux-x64-gnu` | Vite dependency required on Ubuntu CI runners |
| 5. Type check | `npm run type-check` | TypeScript strict compilation with no emit |
| 6. Lint | `npm run lint` | ESLint with `--max-warnings=0` (no warnings allowed) |
| 7. Test | `npm run test:coverage` | Vitest with coverage report generation |
| 8. Build | `npm run build` | Vite production build |
| 9. Playwright install | `npx playwright install --with-deps chromium` | Install Chromium for E2E |
| 10. E2E tests | `npx playwright test --reporter=html` | Run Playwright test suite |

**Artifacts produced** (7-day retention):

- `coverage-report/` — Vitest coverage in HTML and lcov format
- `playwright-report/` — Playwright HTML report with screenshots on failure

The pipeline fails fast: type errors, lint violations, unit test failures, and build errors all block the pipeline before E2E tests run.

**Pre-commit and pre-push hooks (Husky):**

In addition to CI, local Git hooks enforce quality before code reaches the remote:

| Hook | Trigger | Action |
|------|---------|--------|
| `pre-commit` | `git commit` | Runs lint-staged: Prettier format + ESLint fix on staged files |
| `pre-push` | `git push` | Runs `type-check` + `lint` on the full `frontend-web` codebase |

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Tool:** Vitest — Vite-native test runner that shares the same config and transform pipeline as the application.

**Test environment:** jsdom (browser simulation).

**What is tested:**

- Zod schema validation logic (edge cases, field transforms, cross-field validation like Luhn card number checks)
- Pure utility functions (currency formatting, date utilities, key mappers)
- Custom hooks where behavior can be tested in isolation

**What is not tested:**

- MSW handler implementations (covered by E2E)
- i18n locale files (static data)
- Mock seed data
- Component rendering tests are limited — the priority was on schema correctness and business logic

**Setup file:** `tests/setup.ts` runs before all tests to configure the jsdom environment and any global mocks.

### 6.2 End-to-End Tests

**Tool:** Playwright, targeting Chromium.

**Scope:** Critical user journeys that require a running frontend and MSW to be active:

- Login and role-based redirect
- Product creation and listing
- POS checkout flow (full 4-step wizard)
- Inventory stock adjustment
- Logout and session clearing

E2E tests run against the Vite dev server with `VITE_MOCK_ENABLED=true`, so no backend is required in CI.

### 6.3 Manual Testing

For feature correctness and visual verification, four demo accounts are provided covering all major roles. The role-switcher widget (available to Admin and Company roles) allows switching the UI view between all roles without logging out, which speeds up multi-role testing.

**Reset demo data:** A development-only button in the settings panel resets the Dexie database to its initial seeded state and reloads the application.

### 6.4 Running Tests

```powershell
# Unit tests (single run)
npm run test -w frontend-web

# Unit tests (watch mode)
npm run test:watch -w frontend-web

# Unit tests with coverage report
npm run test:coverage -w frontend-web
# → Report generated at frontend-web/coverage/index.html

# E2E tests (requires dev server running)
cd frontend-web
npx playwright test

# E2E tests with HTML report
npx playwright test --reporter=html
# → Report at frontend-web/playwright-report/index.html

# Type checking
npm run type-check -w frontend-web

# Linting
npm run lint -w frontend-web
npm run lint:fix -w frontend-web
```
