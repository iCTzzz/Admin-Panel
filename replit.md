# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### MBS Dashboard (`artifacts/mbs-dashboard`)

A professional administrative dashboard for MBS — a company that manages clients, projects, and services.

**Features:**
- Dashboard overview with KPI cards, charts (recharts), and recent activity feed
- Clients module: searchable/paginated table with "View Detail" modal + "New Client" form
- Projects module: card/table view with status badges (active/pending/completed), filters, and search
- Services module: service cards with pricing
- Reports module: revenue by month (line chart) and projects by status (pie/bar charts)
- Dark mode by default with #0F172A background, #111827 cards, #3B82F6 accent

**Tech:** React + Vite + Tailwind CSS + Recharts + Lucide React + Wouter routing

### API Server (`artifacts/api-server`)

Express 5 REST API serving all dashboard data.

**Routes:**
- `GET /api/dashboard/summary` — KPI metrics
- `GET /api/dashboard/projects-by-month` — chart data
- `GET /api/dashboard/recent-activity` — activity feed
- `GET /api/clients` — paginated + searchable client list
- `POST /api/clients` — create client
- `GET /api/clients/:id` — client detail
- `GET /api/projects` — paginated + filterable project list
- `POST /api/projects` — create project
- `GET /api/projects/:id` — project detail
- `GET /api/services` — list services
- `POST /api/services` — create service
- `GET /api/reports/revenue-by-month` — revenue chart data
- `GET /api/reports/projects-by-status` — status breakdown

## Database Schema (PostgreSQL)

- `clients` — id, name, email, phone, company, created_at
- `projects` — id, name, client_id (FK), status, start_date, estimated_revenue, created_at
- `services` — id, name, description, estimated_price, created_at
- `activity` — id, type, description, created_at
