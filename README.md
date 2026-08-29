# Laksh MedChain

Smart India Hackathon 2024 problem statement SIH1627: Drug Inventory and Supply Chain Tracking System.

Laksh MedChain is a working React and TypeScript project for real-time drug inventory visibility, hospital procurement, vendor accountability, distributor order tracking, AI-assisted replenishment, and compliance monitoring.

## What Is Built

- Role-aware operating workspace for Command Center, Hospital, Vendor, and Distributor users.
- Inventory dashboard with batch, expiry, reserved stock, cold-chain temperature, vendor, and reorder status.
- Hospital store and procurement cart with verified suppliers, stock-aware quantities, invoice summary, and PO generation action.
- Order tracking with source, destination, ETA, status progress, and event timeline.
- AI forecasting view with predicted demand, consumption trend, reorder recommendations, and risk drivers.
- Compliance module for license registry, audit log, batch traceability, RBAC, and cybersecurity controls.
- Senior PM delivery section with sprint plan, risks, and workflow map.
- Unit tests for inventory analytics and operational scoring.

## Tech Stack

- React
- TypeScript
- Vite
- Recharts
- Lucide React
- Vitest

## Run Locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite.

## Quality Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Product Modules

| Module | Primary users | Purpose |
| --- | --- | --- |
| Command Center | Government admin, program manager | Monitor availability, stockout risk, service levels, and alerts. |
| Inventory | Vendor, distributor, hospital stores | Manage batch-level stock, expiry, reserved quantity, and storage conditions. |
| Store | Hospital procurement | Compare verified suppliers and create purchase orders. |
| Orders | All roles | Track order lifecycle from PO to dispatch, QA, and receipt. |
| Forecasting | Admin, procurement, distributor | Predict demand, replenishment quantity, and redistribution opportunities. |
| Compliance | Admin, QA | Verify licenses, audit events, and trace batches. |
| Delivery Plan | Team Laksh | Present roadmap, risks, and implementation strategy. |

## Suggested Production Evolution

1. Add a backend service with PostgreSQL, Prisma, REST or GraphQL APIs, and role-based authentication.
2. Integrate barcode or QR scanning for batch receiving, dispatch, and expiry checks.
3. Connect hospital ERP, e-procurement, logistics, and cold-chain IoT telemetry feeds.
4. Deploy forecast service using historical consumption, disease signals, seasonality, and supplier lead times.
5. Add government reporting dashboards for medicine availability, wastage, vendor reliability, and policy decisions.

## Documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Project Plan](docs/PROJECT_PLAN.md)
- [Risk Register](docs/RISK_REGISTER.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
