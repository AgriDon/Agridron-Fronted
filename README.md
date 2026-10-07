# AgriDron Solutions (agridron-fronted)

## Overview

**agridron-fronted** is a Vue 3 client application for managing agricultural drone operations in the AgriDron Solutions domain. The current implementation focuses on maintaining farms, parcels, crops, fumigation areas, missions, drones, and inventory, with the codebase organized around Domain-Driven Design (DDD) bounded contexts and layered responsibilities.

In development mode, the application consumes a local fake API exposed through json-server. The frontend is configured to call `http://localhost:3000/api/v1` for agricultural resources.

## Features

- Farm maintenance with create, read, update, and delete behavior
- Parcel management with GeoJSON geometry support and farm/crop association
- Crop variety maintenance with create, read, update, and delete behavior
- Fumigation area management within parcels
- Mission reports and operational metrics tracking
- Drone fleet management with status, battery, and maintenance tracking
- Chemical and nozzle inventory management
- Weather monitoring with alerts for wind and precipitation
- Reactive state management with Vue 3 Composition API (ref, computed, watch)
- Material Design 3 (M3) styling with custom theme tokens via PrimeVue
- Internationalization with English and Spanish resources using vue-i18n
- Client-side navigation with Vue Router
- HTTP communication through Axios and REST Assembler pattern
- Layered organization by bounded context:
  - **fieldManagement**: Core agricultural domain (farms, parcels, crops, fumigation areas)
  - **shared**: Cross-cutting reusable technical contracts, base API infrastructure, shell layout, and internationalization components

## Current Scope

The currently enabled application routes expose:

- `/inicio` — Dashboard overview
- `/fincas` — Farm listing and management
- `/fincas/edit/:id?` — Farm creation and editing
- `/parcelas` — Parcel listing and management
- `/parcelas/edit/:id?` — Parcel creation and editing
- `/parcelas/:id` — Parcel detail view
- `/cultivos` — Crop listing and management
- `/cultivos/edit/:id?` — Crop creation and editing
- `/cultivos/:id` — Crop detail view
- `/misiones` — Mission listing (placeholder)
- `/drones` — Drone fleet listing (placeholder)
- `/reportes` — Reports and analytics (placeholder)
- `/configuracion` — Configuration (placeholder)

The codebase contains infrastructure for missions, drones, weather, chemicals, nozzles, and maintenance, but the presentation views for these features are currently placeholders.

## Architecture Overview

The application structure follows Domain-Driven Design (DDD) bounded contexts and layered responsibilities:

- **fieldManagement**: Core domain managing farms, parcels, crops, and fumigation areas.
- **shared**: Cross-cutting reusable technical contracts, base API infrastructure, shell layout, and internationalization components.

Each bounded context is structured into four distinct layers:

- **domain**: Entities (with native ECMAScript # private fields), aggregates, and command models.
- **application**: Reactive state management use cases (computed, ref).
- **infrastructure**: REST API endpoints, DTO models, assemblers, HTTP client.
- **presentation**: Vue components, routed views, and forms.

## Project Structure

The repository layout uses the following tree structure:

```
agridron-fronted/
├── public/                             # Static public assets
│   └── Agridron_Logo.png               # Brand logo asset
├── server/                             # Fake REST API backend (json-server)
│   ├── db.json                         # Mock database resource collections
│   ├── routes.json                     # Custom route rewrite definitions (/api/v1/*)
│   └── start.sh                        # Shell launcher for fake backend
├── src/                                # Application source code
│   ├── index.html                      # Single-page HTML entry point
│   ├── main.js                         # Application bootstrap entry point
│   ├── style.css                       # Global CSS stylesheet
│   ├── vite.config.js                  # Vite configuration with proxy
│   ├── config/                         # Environment configuration
│   │   └── env.js                      # Single access point for env variables
│   ├── fieldManagement/                # Field Management Bounded Context
│   │   ├── application/                # Application state management (use cases)
│   │   │   ├── cultivo-use-cases.js    # Crop use cases (CRUD operations)
│   │   │   ├── finca-use-cases.js      # Farm use cases (CRUD operations)
│   │   │   └── parcela-use-cases.js    # Parcel use cases (CRUD operations)
│   │   ├── domain/                     # Domain model (entities)
│   │   │   └── model/
│   │   │       ├── crop.entity.js      # Crop entity with #private fields
│   │   │       ├── farm.entity.js      # Farm entity with #private fields
│   │   │       ├── fumigationArea.entity.js  # Fumigation area entity
│   │   │       ├── parcel.entity.js    # Parcel entity with GeoJSON geometry
│   │   │       └── user.entity.js      # User entity
│   │   ├── infrastructure/             # Endpoints, responses, assemblers
│   │   │   ├── crop-api-endpoint.js    # Crop REST endpoint
│   │   │   ├── crop-assembler.js       # Crop DTO ↔ Entity assembler
│   │   │   ├── farm-api-endpoint.js    # Farm REST endpoint
│   │   │   ├── farm-assembler.js       # Farm DTO ↔ Entity assembler
│   │   │   ├── field-management-api.js # Base API client for field management
│   │   │   ├── field-management-response.js  # Base response wrapper
│   │   │   ├── fumigation-area-api-endpoint.js  # Fumigation area REST endpoint
│   │   │   ├── fumigation-area-assembler.js     # Fumigation area assembler
│   │   │   ├── parcel-api-endpoint.js  # Parcel REST endpoint
│   │   │   ├── parcel-assembler.js     # Parcel DTO ↔ Entity assembler
│   │   │   ├── user-api-endpoint.js    # User REST endpoint
│   │   │   └── user-assembler.js       # User DTO ↔ Entity assembler
│   │   └── presentation/               # Components, views, forms
│   │       └── views/
│   │           ├── cultivo-detail-view.vue   # Crop detail view
│   │           ├── cultivo-form-view.vue     # Crop create/edit form
│   │           ├── cultivo-list.vue          # Crop list component
│   │           ├── finca-form-view.vue       # Farm create/edit form
│   │           ├── fincas-list.vue           # Farm list component
│   │           ├── parcela-detail-view.vue   # Parcel detail view
│   │           ├── parcela-form-view.vue     # Parcel create/edit form
│   │           └── parcela-list.vue          # Parcel list component
│   ├── layout/                         # Application shell layout
│   │   └── layout.vue                  # Main layout with sidebar, header, router-view
│   ├── locales/                        # Translation dictionaries for vue-i18n
│   │   ├── en.json                     # English locale strings
│   │   └── es.json                     # Spanish locale strings
│   ├── shared/                         # Shared Kernel & Infrastructure
│   │   ├── infrastructure/             # Base HTTP client, base API endpoint, base assembler
│   │   │   ├── base-api.js             # Axios HTTP client wrapper
│   │   │   ├── base-api-endpoint.js    # Base REST endpoint class
│   │   │   ├── base-assembler.js       # Base DTO ↔ Entity assembler
│   │   │   ├── base-entity.js          # Base entity with #private fields
│   │   │   ├── base-response.js        # Base API response wrapper
│   │   │   └── error-handling-enabled-base-type.js  # Error handling mixin
│   │   └── presentation/               # Shared views (routed pages)
│   │       └── views/
│   │           ├── configuracion-view.vue   # Configuration page (placeholder)
│   │           ├── cultivo-view.vue         # Crop list page (routes to fieldManagement)
│   │           ├── drones-view.vue          # Drones page (placeholder)
│   │           ├── fincas-view.vue          # Farm list page (routes to fieldManagement)
│   │           ├── inicio-view.vue          # Dashboard home page
│   │           ├── misiones-view.vue        # Missions page (placeholder)
│   │           ├── not-found-view.vue       # 404 page
│   │           ├── parcelas-view.vue        # Parcel list page (routes to fieldManagement)
│   │           └── reportes-view.vue        # Reports page (placeholder)
│   ├── App.vue                         # Root component
│   ├── router.js                       # Root routing definitions
│   ├── pinia.js                        # Pinia store setup
│   └── i18n.js                         # Vue I18n configuration
├── .env.development                    # Development environment variables
├── .env.production                     # Production environment variables
├── .env.example                        # Example environment variables
├── package.json                        # npm dependencies and project scripts
├── README.md                           # Main project documentation
├── vite.config.js                      # Vite configuration
└── package-lock.json                   # Locked dependency versions
```

## Technologies

- **Framework**: Vue 3.5 (Composition API, `<script setup>`, Signals via ref/computed)
- **Language**: JavaScript (ES2024, native # private fields in domain entities)
- **UI & Theming**: PrimeVue 5 (Material 3 tokens, custom theme via @primeuix/themes)
- **State & Reactivity**: Vue 3 Reactivity System (ref, computed, watch)
- **Internationalization**: vue-i18n 11
- **Routing**: Vue Router 5
- **State Management**: Pinia 4
- **HTTP Client**: Axios 1.20
- **Mock API**: json-server 0.17
- **Build Tool**: Vite 8
- **Code Quality**: ESLint (via Vite plugin)

## Documentation

- **Environment Configuration**: `src/config/env.js` — Single access point for all environment variables.
- **API Endpoints**: Defined in `.env.development` / `.env.production` and mapped in `src/config/env.js`.
- **Mock Database**: `server/db.json` — Complete mock data for farms, parcels, crops, drones, weather, missions, chemicals, nozzles, maintenance, and users.
- **Route Rewrites**: `server/routes.json` — Maps `/api/v1/*` to json-server collections.

## Prerequisites

Before running the project, make sure the environment includes:

- Node.js (v22.18.0+ or v24.12.0+)
- npm

## Installation

Install project dependencies from the project root:

```bash
npm install
```

## Running the Application

### Option 1: Start both frontend and fake API together (recommended)

```bash
npm run dev:full
```

This starts:
- JSON Server at `http://localhost:3000` (fake REST API)
- Vite dev server at `http://localhost:5173` (frontend)

### Option 2: Start separately

**Terminal 1: Fake REST API**
```bash
npm run server
# or manually:
cd server && sh start.sh
```

**Terminal 2: Frontend Dev Server**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173/`
- **Fake API**: `http://localhost:3000/api/v1/`

## Available Scripts

From the project root, the following scripts are available:

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts Vite development server |
| `npm run server` | Starts json-server on port 3000 |
| `npm run dev:full` | Runs both server and dev concurrently |
| `npm run dev:staging` | Starts Vite with staging mode |
| `npm run build` | Compiles and builds production bundles |
| `npm run preview` | Previews production build locally |

## Fake API Notes

- The fake API provides resources for: farms, parcels, fumigation-areas, crops, weather, mission-reports, mission-histories, operational-metrics, performance-indicators, drones, chemicals, nozzles, maintenance, and users.
- The development environment maps `/api/v1/*` requests through `server/routes.json` to json-server collections.
- Vite proxies `/api` requests to `http://localhost:3000` (configurable via `VITE_DEV_PROXY_TARGET`).
- The API base URL is `/api/v1` (relative, proxied by Vite in dev).

## Environment Variables

Key environment variables (defined in `.env.development` / `.env.production`):

| Variable | Description | Default (dev) |
|----------|-------------|---------------|
| `VITE_API_BASE_URL` | Base URL for API calls | `/api/v1` |
| `VITE_DEV_PROXY_TARGET` | Vite proxy target for `/api` | `http://localhost:3000` |
| `VITE_FARMS_ENDPOINT_PATH` | Farms endpoint path | `/farms` |
| `VITE_PARCELS_ENDPOINT_PATH` | Parcels endpoint path | `/parcels` |
| `VITE_CROPS_ENDPOINT_PATH` | Crops endpoint path | `/crops` |
| `VITE_FUMIGATION_AREAS_ENDPOINT_PATH` | Fumigation areas endpoint path | `/fumigation-areas` |
| `VITE_DRONES_METRICS_ENDPOINT_PATH` | Drones endpoint path | `/drones` |
| `VITE_CHEMICALS_ENDPOINT_PATH` | Chemicals endpoint path | `/chemicals` |
| `VITE_NOZZLES_ENDPOINT_PATH` | Nozzles endpoint path | `/nozzles` |
| `VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH` | Maintenance records endpoint path | `/maintenance` |
| `VITE_WEATHER_ENDPOINT_PATH` | Weather endpoint path | `/weather` |
| `VITE_MISSION_REPORTS_ENDPOINT_PATH` | Mission reports endpoint path | `/mission-reports` |
| `VITE_MISSION_HISTORIES_ENDPOINT_PATH` | Mission histories endpoint path | `/mission-histories` |
| `VITE_OPERATIONAL_METRICS_ENDPOINT_PATH` | Operational metrics endpoint path | `/operational-metrics` |
| `VITE_PERFORMANCE_INDICATORS_ENDPOINT_PATH` | Performance indicators endpoint path | `/performance-indicators` |
| `VITE_USERS_ENDPOINT_PATH` | Users endpoint path | `/users` |
| `VITE_SIGNIN_ENDPOINT_PATH` | Sign-in endpoint path | `/authentication/sign-in` |
| `VITE_SIGNUP_ENDPOINT_PATH` | Sign-up endpoint path | `/authentication/sign-up` |

## Project Notes

- Translation files are located in `src/locales/` (currently English only, Spanish ready to add).
- The development API base URL is defined in `.env.development` and loaded via `src/config/env.js`.
- The production environment file points to `/api/v1` which should be adjusted for the real deployment target.
- PrimeVue components are registered with both `pv-` prefix (e.g., `pv-button`) and standard names (e.g., `Button`).
- The layout uses a fixed sidebar (240px) and top header (76px) with responsive content area.
- Domain entities use native ECMAScript `#` private fields for encapsulation.
- Assemblers transform DTOs ↔ Domain Entities, keeping the domain pure.

## Development Workflow

For local development, start the fake API first and then start the Vue application:

```bash
# Terminal 1: Fake REST API
npm run server

# Terminal 2: Vue Dev Server
npm run dev
```

Or simply use the combined command:

```bash
npm run dev:full
```