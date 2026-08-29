# Project Plan

## Delivery Strategy

The project should be delivered in thin, demonstrable slices. Each sprint must produce visible product value, working data flows, and a testable increment.

## Sprint Roadmap

| Sprint | Duration | Outcome | Key Deliverables |
| --- | --- | --- | --- |
| Sprint 1 | 1 week | Demonstration MVP | UI shell, seed data, role switcher, inventory dashboard, charts, order timeline. |
| Sprint 2 | 1 week | Core workflows | Vendor onboarding, PO creation, receiving, dispatch update, invoice record. |
| Sprint 3 | 2 weeks | Backend foundation | PostgreSQL schema, API services, authentication, RBAC, audit events. |
| Sprint 4 | 2 weeks | Integrations | ERP import, logistics events, cold-chain telemetry, notification templates. |
| Sprint 5 | 2 weeks | Forecasting | Demand model, reorder suggestions, stockout alerts, redistribution rules. |
| Sprint 6 | 1 week | Pilot hardening | Security testing, performance checks, accessibility, reporting, deployment. |

## MVP Backlog

| Priority | Feature | Owner | Acceptance Criteria |
| --- | --- | --- | --- |
| P0 | Role-based dashboard | Frontend | User can switch roles and see relevant operational context. |
| P0 | Inventory tracking | Frontend, Backend | User can view batch, stock, expiry, vendor, location, and status. |
| P0 | Purchase order workflow | Frontend, Backend | Hospital can add items to cart and create a PO. |
| P0 | Order lifecycle tracking | Backend, Logistics | Order events update status from submitted to delivered. |
| P1 | License verification | Backend, Compliance | Vendor records include license and verification state. |
| P1 | Cold-chain alerts | IoT, Backend | Temperature deviations produce alerts and audit events. |
| P1 | Demand forecasting | Data Science | Forecast produces reorder quantity and confidence level. |
| P2 | Government reporting | Analytics | Admin can view district, state, vendor, and stockout reports. |

## Team Roles

| Role | Responsibility |
| --- | --- |
| Product Manager | Scope, roadmap, demo narrative, stakeholder alignment. |
| Tech Lead | Architecture, code quality, integration decisions. |
| Frontend Engineer | React dashboard, role views, workflow screens. |
| Backend Engineer | APIs, database, auth, audit log. |
| Data Scientist | Demand forecast, stockout risk, model evaluation. |
| QA Engineer | Functional testing, regression testing, accessibility checks. |
| DevOps Engineer | Deployment, monitoring, secrets, CI/CD. |

## Milestones

- Demo MVP complete.
- Backend schema approved.
- Role and license workflow complete.
- Procurement and dispatch workflow complete.
- Forecast recommendations validated with sample data.
- Pilot deployment ready.

## Definition Of Done

- Feature is usable from the UI.
- API contract is documented.
- Core logic has tests.
- Role permissions are respected.
- Audit event is generated for state-changing action.
- Error and empty states are handled.
- Product documentation is updated.
