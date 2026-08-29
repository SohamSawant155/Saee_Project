# Risk Register

| Risk | Impact | Probability | Owner | Mitigation |
| --- | --- | --- | --- | --- |
| Inaccurate inventory data | High | High | Tech Lead | Use barcode scans, reconciliation jobs, maker-checker approvals, and facility-level stock audits. |
| Integration with existing hospital systems is slow | High | Medium | Backend Lead | Build adapter layer, CSV import fallback, and staged ERP integrations. |
| Vendor data quality is inconsistent | Medium | High | Product Manager | Use mandatory fields, license validation, document review, and vendor scorecards. |
| Cold-chain telemetry is unavailable in pilot | High | Medium | IoT Lead | Allow manual temperature logs first, then integrate devices by priority facilities. |
| Forecast model is not trusted by procurement teams | Medium | Medium | Data Scientist | Show explainable drivers, confidence bands, and human approval before PO creation. |
| Cybersecurity breach | High | Low | Security Lead | Implement RBAC, encryption, audit log, security testing, secret management, and least privilege. |
| User adoption is low | High | Medium | Product Manager | Design around existing procurement workflow, reduce data entry, and train facility champions. |
| Regulatory interpretation varies by state | Medium | Medium | Compliance Owner | Keep compliance rules configurable by state and maintain policy change log. |
| Network connectivity in remote facilities is poor | Medium | Medium | Tech Lead | Add offline capture queue and sync retry logic in later release. |

## Risk Governance

- Review P0 and P1 risks every sprint.
- Attach measurable triggers to risks where possible.
- Convert recurring risks into backlog items.
- Keep audit and compliance risks visible to sponsors.
