# Architecture

## Current Demo Architecture

```text
React UI
  |
  |-- typed seed data
  |-- analytics functions
  |-- role-aware views
  |-- chart visualizations
  |
Browser runtime
```

The current repository is a frontend MVP designed for SIH demonstration. It proves workflows, data model, calculations, and user experience before backend integration.

## Production Architecture

```text
Web App
  |
API Gateway
  |
Application Services
  |-- Identity and RBAC
  |-- Inventory Service
  |-- Procurement Service
  |-- Order Tracking Service
  |-- Vendor Compliance Service
  |-- Forecasting Service
  |-- Notification Service
  |
Data Layer
  |-- PostgreSQL for transactional records
  |-- Object storage for invoices and certificates
  |-- Time-series store for cold-chain telemetry
  |-- Analytics warehouse for policy dashboards
  |
External Integrations
  |-- Hospital ERP
  |-- Government e-procurement
  |-- Logistics providers
  |-- IoT temperature devices
  |-- SMS, email, and WhatsApp notifications
```

## Suggested Database Entities

- users
- roles
- facilities
- vendors
- distributor_licenses
- medicines
- batches
- inventory_positions
- stock_movements
- purchase_orders
- order_lines
- shipments
- shipment_events
- invoices
- qa_checks
- telemetry_readings
- forecast_runs
- audit_events

## API Surface

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/auth/login` | POST | Authenticate user and issue token. |
| `/vendors/verify` | POST | Submit and verify vendor license documents. |
| `/inventory` | GET | List inventory by role, facility, medicine, status, and geography. |
| `/inventory/:batchId/move` | POST | Record stock transfer or reservation. |
| `/orders` | POST | Create purchase order from cart. |
| `/orders/:id/events` | POST | Add dispatch, transit, QA, or delivery event. |
| `/forecast/runs` | POST | Generate demand forecast and replenishment recommendations. |
| `/alerts` | GET | Return active stock, expiry, cold-chain, and compliance alerts. |
| `/audit` | GET | Query immutable audit trail. |

## Security Design

- Role-based access control for Admin, Hospital, Vendor, Distributor, and QA.
- JWT or session-based authentication with refresh-token rotation.
- Field-level access policies for commercial and patient-sensitive metadata.
- Audit event for every create, update, approval, dispatch, receipt, and override.
- Encryption at rest for documents and personally identifiable records.
- TLS for all API and telemetry ingestion.

## Forecasting Approach

Initial model:

- Moving average over historical consumption.
- Seasonality correction by month and disease profile.
- Supplier lead-time buffer.
- Facility-level safety stock.
- Expiry-aware redistribution priority.

Advanced model:

- Gradient boosting or temporal neural model.
- External signals such as outbreak reports and climate seasonality.
- Confidence intervals for procurement planners.
- Drift monitoring to flag model degradation.
