# Product architecture

## Goal

Provide a guided, auditable workflow that converts an unknown source database
into a normalized staging contract and then into Aderant Expert. A merger must
be repeatable across discovery, rehearsal, validation, delta, and cutover runs.

## Boundaries

```text
Source DBMS
    |
    v
Source adapter -> landing data -> mapping/rules -> canonical staging
                                                    |
                                                    v
                                      validation + reconciliation
                                                    |
                                                    v
                              Aderant test conversion -> production promotion
```

- **Source adapter:** discovers metadata and reads source data. Vendor-specific
  SQL and drivers remain behind this boundary.
- **Landing data:** immutable, run-scoped data that preserves source values and
  provenance before conversion.
- **Canonical staging:** a versioned contract anchored to the existing tables
  used by `CONVERT*` and `PROMOTE*`: `NAMES`, `CLIENTS`, `ADDRESSES`, `CONTACTS`,
  `MATTERS`, `BILLGROUPS`, `ASSIGNMENTS`, `NOTES`, `RATES`, `VENDORS`, and
  `VENDORADDRESSES`. It adds explicit relationships and run metadata without
  casually breaking the proven procedure interface.
- **Validation:** structural, referential, business, and reconciliation checks.
  Blocking findings prevent promotion; accepted exceptions are recorded.
- **Target adapter:** the only component permitted to invoke reviewed Aderant
  test conversion and production promotion operations. It supports plan/dry-run
  before execution and keeps those two target environments distinct.
- **MAUI application:** manages merger projects, mappings, crosswalks, previews,
  runs, findings, approvals, and reports. Long-running data work executes in
  application services and must not depend on UI state.

## Proposed solution boundaries

- `MergerManager.App`: MAUI UI, navigation, view models, and platform services.
- `MergerManager.Domain`: entities, value objects, policies, and contracts.
- `MergerManager.Application`: use cases and orchestration.
- `MergerManager.Infrastructure`: persistence, connectors, staging, and logging.
- `MergerManager.Connectors.SqlServer`: first reference source connector.
- `MergerManager.Targets.Aderant`: reviewed Aderant staging/load implementation.
- `MergerManager.Tests.*`: unit, contract, integration, and end-to-end tests.

## Staging namespaces

- `control`: merger projects, contract versions, runs, steps, checkpoints,
  approvals, and artifacts.
- `landing`: immutable source-shaped data with source system, object, key,
  extraction timestamp, and run provenance.
- `stage`: a compatibility contract based on the eleven tables referenced by
  the conversion and promotion procedures. The initial implementation may keep
  their current `dbo` names while migrations and compatibility views provide a
  safe path to a dedicated namespace.
- `xref`: source-to-canonical identifiers and user-maintained crosswalks.
- `quality`: validation rules, findings, exceptions, and reconciliation results.

Parallel `_DELTA` tables and batch copies are replaced by `RunId`, load mode,
effective dates, and row disposition. Existing `BATCH` and `COMPANY_CODE`
behavior remains supported until procedure compatibility tests permit a
controlled migration. A contract version is stored on every run so old merger
evidence remains interpretable after the schema evolves.

## Safety principles

- Connections use least privilege: read-only at source, staging writer in the
  conversion database, and a narrowly scoped target execution identity.
- Credentials are stored through platform secure storage or an approved secret
  provider and never in project files, logs, exports, or issue attachments.
- Every target-changing operation has a dry-run plan, an operator confirmation,
  an idempotency key, and an audit record.
- Raw and staged data are treated as confidential client data. Retention,
  redaction, export, and deletion policies are explicit and testable.

## Decisions still required

- Supported MAUI desktop platforms and the supported .NET baseline.
- Supported source DBMSs after the SQL Server reference adapter.
- Whether staging is provisioned beside Aderant or in an isolated SQL Server.
- The reviewed Aderant import interface: stored procedures, supported import
  utility, or another vendor-approved mechanism.
- Data retention, encryption, and operator authorization requirements.
