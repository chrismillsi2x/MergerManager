# Product architecture

## Goal

Provide a guided, auditable workflow that converts the source firm's practice
management database into a normalized staging contract and then into the target
firm's Aderant Expert system. A merger must be repeatable across discovery,
rehearsal, validation, delta, and cutover runs.

## Terminology

- **Source firm:** the firm being acquired. Its practice management system is
  the source of the data being converted.
- **Target firm:** the acquiring firm. Its Aderant Expert environments receive
  the converted data.
- **Source system:** the source firm's practice management product, version,
  database engine, schema, and relevant customizations.
- **Staging contract:** the stable intermediate structure separating uncertain
  source mapping from controlled Expert loading.
- **Source-system template:** a reusable, sanitized mapping package for a known
  source system family and staging-contract version.

## Boundaries

```text
Source firm's practice management system
                  |
                  v
    connector -> landing -> source template + project overrides
                                      |
                                      v
                         stable staging contract
                                      |
                         validation + reconciliation
                                      |
                                      v
             versioned Expert loader (product-owned)
                  |                         |
                  v                         v
       target firm's Expert test -> target firm's Expert production
```

- **Source adapter:** discovers metadata and reads source data. Vendor-specific
  SQL and drivers remain behind this boundary.
- **Source mapping:** the deliberately flexible portion of the product. A
  project may start from a compatible source-system template and add explicit
  firm-specific overrides until the staging contract is complete.
- **Landing data:** immutable, run-scoped data that preserves source values and
  provenance before conversion.
- **Canonical staging:** a versioned contract anchored to the existing tables
  used by `CONVERT*` and `PROMOTE*`: `NAMES`, `CLIENTS`, `ADDRESSES`, `CONTACTS`,
  `MATTERS`, `BILLGROUPS`, `ASSIGNMENTS`, `NOTES`, `RATES`, `VENDORS`, and
  `VENDORADDRESSES`. It adds explicit relationships and run metadata without
  casually breaking the proven procedure interface.
- **Validation:** structural, referential, business, and reconciliation checks.
  Blocking findings prevent promotion; accepted exceptions are recorded.
- **Data mutation gateway:** the only application service allowed to change
  landing, staging, Aderant test, or Aderant production data. Every mutation is
  a versioned change set with phase, scope, preview, approval, before/after
  evidence, execution result, and verification. Ad hoc SQL can be imported as a
  governed change set but cannot bypass this boundary.
- **Target adapter:** the only component permitted to invoke reviewed Aderant
  test conversion and production promotion operations. It supports plan/dry-run
  before execution and keeps those two target environments distinct. Its load
  graph and table mappings are versioned product assets, not editable merger
  rules. A project selects a compatible loader version and bounded parameters.
- **MAUI application:** manages merger projects, mappings, crosswalks, previews,
  runs, findings, approvals, and reports. Long-running data work executes in
  application services and must not depend on UI state.

## Project system

Each company merger is represented by one portable `.mergerproj` manifest. It
is the authoritative definition of scope, decisions, connection-profile
references, staging-contract version, mappings, transformations, validations,
crosswalk references, and pipeline policy. Credentials, extracted data, run
history, and generated evidence are never embedded in the manifest.

The application may open and operate several projects concurrently. Each open
project receives an isolated application-service scope, cancellation boundary,
working directory, staging/run identity, and log context. An app-local workspace
store remembers recent and open project paths but is not part of any merger and
cannot change its behavior. See [Multi-project and project-file architecture](project-system.md).

A project may derive its initial source mappings from a source-system template.
The project records the exact template ID/version and retains only explicit
overrides. Compatibility is established from product/version metadata plus a
schema fingerprint and drift report; sharing a vendor name alone is not enough.
See [Source-to-staging template architecture](source-system-templates.md).

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
- Ordinary operator identities do not have direct DML rights. Native database
  auditing records exceptional break-glass access that occurs outside the app;
  application audit and database audit are reconciled.
- Raw and staged data are treated as confidential client data. Retention,
  redaction, export, and deletion policies are explicit and testable.

## Decisions still required

- Supported MAUI desktop platforms and the supported .NET baseline.
- Supported source DBMSs after the SQL Server reference adapter.
- Whether staging is provisioned beside Aderant or in an isolated SQL Server.
- The reviewed Aderant import interface: stored procedures, supported import
  utility, or another vendor-approved mechanism.
- Data retention, encryption, and operator authorization requirements.
- Required retention and encryption tier for row-level before/after evidence.
