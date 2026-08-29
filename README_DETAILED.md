# Laksh MedChain — Platform Guide

This document explains how the Laksh MedChain demo platform works, how the code is structured, and how to run, modify, and extend it. It's written for engineers and maintainers who will work on the repository.

## Overview

Laksh MedChain is a single-page React + Vite application (TypeScript) that demonstrates an inventory and supply-chain command center for medicines and healthcare supplies. The UI shows key metrics, inventory tables, charts, and procurement workflows with role-based views.

Key features
- Role-based navigation and guards (Command Center, Hospital, Vendor, Distributor)
- Interactive inventory table with search, status filters, and add-to-cart
- Cart/PO drafting view and supplier comparison
- Charts and visualisations (Recharts + small inline SVG fallbacks)
- Animated UI with Framer Motion for a modern UX
- Global toast notifications

## Platform purpose & how it functions (non-technical)

### Purpose
Laksh MedChain is built to give operational teams — hospitals, regional distributors, manufacturers, and national command centers — a single view to keep essential medicines available, safe, and delivered on time. Its aim is to reduce stockouts, minimise wastage from expiry or cold-chain failures, speed procurement decisions, and make redistribution between facilities easy and auditable.

### Core functions (what the platform does)
- Real-time visibility: shows current on-hand units, condition (cold-chain, expiry) and actionable health scores so teams see problems before they become outages.
- Forecasting & replenishment recommendations: suggests quantities and timing for orders based on consumption trends and lead times so procurement is proactive, not reactive.
- Procurement workflow: enables hospitals or procurement teams to stage items in a cart, compare suppliers, and generate a draft PO — the platform tracks quantities, supplier quality signals and constraints.
- Alerts & triage: surfaces urgent incidents (temperature excursions, near-expiry batches, critical low stock) with severity and recommended actions so operators can triage quickly.
- Redistribution & routing: highlights opportunities to move stock from one facility or hub to another to avoid waste and address local shortages.
- Role-based workspaces: tailored dashboards and controls depending on whether the user is a Command Center operator, Hospital buyer, Vendor, or Distributor.

### How it functions (high-level flow)
1. Data capture: inventory snapshots, batch metadata, simple telemetry (temperature, timestamps), and order statuses are collected from source systems or entered by operators.
2. Normalisation & scoring: the platform converts raw inputs into standard metrics (available units, runout days, compliance score, cold-chain alerts) and computes health/reorder signals.
3. Visualisation & decision support: dashboards show these signals with recommended actions (reorder quantities, redistribution targets). Charts and sparklines reveal trends at a glance.
4. Action & audit: operators take actions (queue PO, mark redistribution, acknowledge an alert). Every action is recorded so decisions are traceable and reversible where needed.
5. Continuous feedback: after actions (receipts, shipments), the data refreshes and analytics update recommendations, closing the control loop.

### Typical user roles & journeys
- Command Center: monitors national/regional coverage, spot-checks hubs with low coverage, approves large redistribution plans, and sets governance constraints.
- Hospital procurement officer: searches inventory, queues replenishment items to a cart, compares suppliers, generates a draft PO, and monitors expected deliveries.
- Vendor: views orders assigned, checks batch readiness and compliance signals, and updates dispatch/readiness status.
- Distributor: plans routes and accepts/dispatches stock, monitors cold-chain alerts for shipments under their control.

### Alerts, priorities & recommended actions
- Severity levels: alerts are classified (info, warning, critical). Critical alerts (expiry within days, temperature breach) appear prominently in the decision alerts feed.
- Recommended action: each alert contains a recommended next step — redistribute, quarantine, expedite order, or adjust storage — with links to the inventory affected so operators can act quickly.

### Business value
- Reduce stockouts and ensure essential medicines are available when and where needed.
- Minimise wastage from expiry or cold-chain failure by enabling timely redistribution.
- Speed procurement decisions by surfacing recommended quantities and trusted suppliers.
- Provide traceability and audit trails for regulatory and governance needs.

### Operations, data sources & integrations (summary)
- The demo uses in-memory data; a production deployment would integrate with warehouse systems, EMRs, IoT telemetry for temperature, and procurement systems.
- The platform is designed to accept periodic snapshots and streaming telemetry; its core UX focuses on surfacing the right decisions rather than raw telemetry.

### What success looks like
- Fewer critical stockouts per month across tracked SKUs.
- Lower percent of units lost to expiry or cold-chain failure.
- Shorter cycle time from identified need → PO generation → receipt.

### Example scenario (end-to-end)
1. A hospital sees a rising local consumption of ORS. The forecast widget shows a 40% expected increase in 2 weeks. The platform recommends a replenishment quantity and flags a nearby regional hub with surplus units.
2. Hospital procurement adds recommended units to the cart and generates a draft PO to an approved supplier. Command Center authorises a one-off redistribution to cover immediate needs.
3. The distributor picks up the items, telemetry shows a temperature excursion en route; an alert quarantines affected batches and suggests alternate batches for the PO. The event and response are recorded for audit.

This is the functional picture the platform is intended to provide — decision-grade visibility, recommended workflows, and auditable actions focused on keeping medicine available and safe.

## Repo layout (important files)
- `index.html` — HTML shell and fonts.
- `src/main.tsx` — App bootstrap; wraps the app in the `ToastProvider`.
- `src/App.tsx` — Main app UI and routing by section; most of the views live here.
- `src/index.css` — Global styles, variables, layout and component styles.
- `src/data.ts` — Demo data for inventory, orders, forecast, vendors, roles.
- `src/analytics.ts` — Helper functions for metrics: available stock, runout days, scores.
- `src/types.ts` — TypeScript types used across the app.
- `src/components/ToastContext.tsx` — Global toast provider and `useToast()` hook (animated toasts).
- `src/components/charts/ForecastArea.tsx` — Lazy-loaded Area chart with reveal animation.
- `src/components/charts/CategoryBarChart.tsx` — Lazy-loaded Category bar chart with legend and percent bars.
- `src/components/Sparkline.tsx` — Lightweight inline sparkline SVG (fallback/quick visual).
- `src/components/SimpleBars.tsx` — Lightweight inline bar series SVG.

## Architecture & Key Patterns

- SPA structure: `App.tsx` controls the top-level state (active role, section, cart, filters). Views are conditionally rendered based on `activeSection`.
- Role-based navigation: `rolePermissions` maps `Role` -> allowed `Section[]`. `useEffect` enforces the active section when role changes.
- Toasts: `ToastProvider` provides `useToast().show({type,message})` to show animated messages.
- Animations: Framer Motion components (`motion.div`, `motion.button`) are used; to avoid typing friction across React versions the project uses local `const MotionDiv: any = motion.div` aliases.
- Charts: Recharts are used for full charts, but small inline SVG components (`Sparkline`, `SimpleBars`) are rendered in the overview so some visuals are always visible even while lazy charts load.
- Lazy loading: Large charts are lazy-loaded with `React.lazy` + `Suspense` and a skeleton fallback for fast initial paint.

## How it runs (dev)

Prerequisites:
- Node.js (16+ recommended)
- npm

Commands:
- `npm install --legacy-peer-deps` — install dependencies (the project used this during setup to avoid peer resolution issues).
- `npm run dev` — start Vite dev server (auto-selects an available port, commonly 5173 or 5174).
- `npm run typecheck` — run `tsc --noEmit` to run TypeScript checks.
- `npm run build` — produces a production build (`dist/`).
- `npm run preview` — serve the production build locally.

Notes about dependencies and peer-deps:
- `framer-motion` was added and the install used `--legacy-peer-deps` to avoid peer conflicts with the React version in this repo. For production-grade projects prefer aligning React and Framer versions.

## How the data flows

- `src/data.ts` contains in-memory demo data (inventory, forecast, orders). The app reads this directly—no backend is required for the demo.
- `analytics.ts` contains pure functions that compute derived metrics (stock health, runout days, recommended order qty). Views call those functions to display metrics.

## Extending charts and UI

- To add a new chart component, prefer creating a lazy-loaded file under `src/components/charts/` and export a default React component that accepts a `data` prop.
- Use `ResponsiveContainer` from Recharts for responsive sizing, and ensure the parent wrapper has a non-zero height (CSS: `.chart-wrap` in `src/index.css`).
- For initial UX, provide a small inline SVG fallback (use `Sparkline` or `SimpleBars`) so the overview shows visuals while lazy charts load.

## RBAC and Actions

- Role selection is located in the sidebar. The `rolePermissions` map in `App.tsx` controls which nav items appear.
- The `addToCart` action is guarded: only `Hospital` and `Command Center` roles may add items to the procurement cart. Non-authorized attempts trigger an error toast.
- To add more fine-grained permissions, replace `rolePermissions` with a permission-check utility and update UI/controls to call it before performing sensitive actions.

## Notifications & UX

- Global toasts: Use `const toast = useToast()` and call `toast.show({ type: 'success'|'error'|'info', message })`.
- Animations: The app uses Framer Motion. Respect `prefers-reduced-motion` if you plan to ship for accessibility — consider wrapping motion props in a reduced-motion check.

## Performance & Bundle

- The project uses code-splitting for charts via `React.lazy` which reduced the initial code surface.
- Build may show warnings about chunk size; if you see those, consider further splitting heavy modules (store, vendors) or deferring them behind routes.

## Next work items (suggested)
- Implement a backend endpoint and replace `src/data.ts` with fetching from an API.
- Add user authentication and proper RBAC enforcement on server side.
- Add unit and integration tests for critical logic in `analytics.ts` and RBAC checks.
- Add `prefers-reduced-motion` support and more UI-level accessibility improvements.
- Optimize bundle further by lazy-loading more UI fragments.

## Troubleshooting
- If charts do not show, verify CSS `.chart-wrap` has non-zero height (some wrappers rely on `min-height` to allow Recharts to render).
- If `framer-motion` cannot be resolved during `npm install`, try aligning React version or use `npm install --legacy-peer-deps` as a temporary workaround.
- If TypeScript errors appear after edits, run `npm run typecheck` and follow the `tsc` errors.

## Where to find things in code
- Main UI and routing: `src/App.tsx`
- Data fixtures: `src/data.ts`
- Derived metrics: `src/analytics.ts`
- Types: `src/types.ts`
- Styles: `src/index.css`
- Toasts: `src/components/ToastContext.tsx`
- Charts: `src/components/charts/*`
- Tiny inline charts (always visible): `src/components/Sparkline.tsx`, `src/components/SimpleBars.tsx`

---

If you'd like, I can also:
- Add a short contributor section with commands for running tests and formatting rules.
- Produce a one-page architecture diagram (Mermaid) or a short video walkthrough automation.

Tell me if you want one of those added to `README_DETAILED.md` and I'll append it automatically.
