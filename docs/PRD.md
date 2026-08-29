# Product Requirements Document

## 1. Product Vision

Build a trusted, real-time platform that ensures the right drugs are available in the right quantity, at the right place, at the right time, at the right cost, in the right condition, and for the right people.

## 2. Problem

Hospitals and medical institutions often face fragmented drug procurement, stockouts, short-dated inventory, limited vendor accountability, weak batch traceability, and delayed distribution visibility. These gaps increase cost, waste, and patient risk.

## 3. Target Users

- Hospital procurement officer
- Hospital pharmacy or store manager
- Drug vendor or manufacturer
- Regional distributor
- Quality assurance officer
- Government health command center
- Policy and program manager

## 4. Goals

- Improve drug availability and reduce stockouts.
- Reduce procurement delays and manual follow-ups.
- Track inventory at batch level across vendors, distributors, and hospitals.
- Forecast demand and generate reorder recommendations.
- Monitor cold-chain and expiry risk.
- Improve vendor performance transparency.
- Maintain audit-ready compliance records.

## 5. Functional Requirements

### Role and Onboarding

- Users choose Vendor, Distributor, Hospital, or Command Center workspace.
- Vendors and distributors submit license details for verification.
- Verified accounts receive role-specific dashboards and actions.

### Inventory

- Track medicine name, generic name, batch, quantity, reserved stock, vendor, warehouse, state, expiry, price, and storage band.
- Calculate available stock after reservation.
- Flag Critical, Reorder, Expiry Watch, Cold Chain Alert, and Healthy statuses.
- Suggest replenishment quantity using forecast and safety stock.

### Procurement Store

- Hospitals browse verified inventory.
- Users compare suppliers by price, lead time, fill rate, compliance, and available quantity.
- Cart limits requested quantity to available stock.
- System creates a purchase order and invoice summary.

### Orders and Tracking

- Track order status from Draft to Delivered.
- Show source, destination, ETA, risk, and timeline.
- Distributor updates dispatch and in-transit events.
- Hospital confirms quality check and receipt.

### Forecasting

- Predict demand using historical consumption, seasonality, disease signals, supplier lead time, and current inventory.
- Recommend procurement windows and redistribution opportunities.
- Surface stockout and wastage risk.

### Compliance

- Maintain license registry for vendors and distributors.
- Track cold-chain deviations.
- Store auditable events for inventory movement, QA release, dispatch, and receipt.
- Enforce RBAC for sensitive actions.

## 6. Non-Functional Requirements

- Availability target: 99.5 percent for production release.
- Responsive web UI for laptop, tablet, and mobile.
- Role-based access control.
- Encrypted transport and storage for sensitive records.
- Audit logging for all inventory-changing events.
- API-first architecture for integration with external systems.

## 7. Success Metrics

- Stockout incidents reduced by 35 percent in pilot facilities.
- Inventory wastage reduced by 25 percent through expiry redistribution.
- PO cycle time reduced by 40 percent.
- Vendor fill-rate visibility for 100 percent of verified suppliers.
- Cold-chain deviations detected within 5 minutes of telemetry ingestion.

## 8. MVP Scope Implemented In This Repository

- Frontend operating dashboard.
- Seeded inventory, vendor, order, alert, and forecast data.
- Reorder and runout business logic.
- Procurement cart and invoice summary.
- Order tracking and timeline.
- Compliance and delivery-plan screens.
- Unit tests for core analytics.

## 9. Future Scope

- Backend APIs and database.
- Real authentication and authorization.
- Barcode or QR batch scanning.
- IoT telemetry ingestion.
- Payment and e-procurement integrations.
- ML model training pipeline and monitoring.
