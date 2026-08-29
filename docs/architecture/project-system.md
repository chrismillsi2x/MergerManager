# Multi-project and project-file architecture

## Decision

MergerManager uses a project model similar to an IDE:

- one company merger equals one portable `.mergerproj` file;
- the application can keep multiple merger projects open simultaneously; and
- local workspace state remembers open/recent projects without becoming part of
  a merger definition.

The `.mergerproj` file is the authoritative, reviewable input to a run. A run
stores an immutable snapshot and content hash of that definition so later edits
cannot change the meaning of historical evidence.

## What belongs in the project file

The manifest is UTF-8 JSON with canonical serialization and a published JSON
Schema. JSON is selected for deterministic parsing, schema validation, useful
source-control diffs, and first-class .NET support.

```json
{
  "$schema": "https://schemas.example.invalid/mergermanager/project/v1.json",
  "formatVersion": "1.0",
  "projectId": "b2cab395-fce8-4e40-8e48-57fc449879aa",
  "name": "Example Company Merger",
  "companyCode": "EX",
  "stagingContract": { "version": "1.0", "compatibilityProfile": "dbo-v1" },
  "connections": {
    "source": { "connector": "sqlserver", "profile": "example-source" },
    "aderantTest": { "profile": "aderant-test" },
    "aderantProduction": { "profile": "aderant-production" }
  },
  "scope": { "entities": ["names", "clients", "addresses", "matters"] },
  "decisions": [],
  "rules": {
    "mappings": [],
    "transformations": [],
    "validations": [],
    "crosswalks": []
  },
  "pipeline": { "enabledSteps": [], "policies": {} }
}
```

Required sections:

| Section | Responsibility |
| --- | --- |
| Identity | Stable project ID, display name, company code, timestamps, and owners |
| Contract | Project format, application compatibility, and staging-contract versions |
| Connections | Connector types and named profile references, never credentials |
| Scope | Included entities, source objects, target environments, and exclusions |
| Decisions | Structured question, chosen option, rationale, status, author, and timestamp |
| Mappings | Source-to-staging field mappings and unmapped-field dispositions |
| Transformations | Ordered, typed, versioned ETL expressions and parameters |
| Validations | Rule configuration, severity, gate behavior, and approved policy |
| Crosswalks | Inline small mappings or relative artifact references with SHA-256 hashes |
| Pipeline | Enabled steps, dependencies, run policies, and environment gates |

## What does not belong in the project file

- Passwords, connection strings containing secrets, tokens, or encryption keys
- Extracted client data, samples, staging rows, validation findings, or logs
- Mutable test/production identifiers allocated during a run
- Machine-specific absolute paths
- UI layout, selected tabs, window positions, or recent-file history

Those values live in secure profile storage, the run/control database, the
project artifact directory, or the app-local workspace store as appropriate.

## Project directory convention

```text
ExampleCompany/
|-- ExampleCompany.mergerproj
|-- crosswalks/
|   `-- matter-types.csv
|-- scripts/
|   `-- source-extract.sql
|-- tests/
|   `-- expected-counts.json
`-- artifacts/                 # generated; retention policy applies
    `-- <run-id>/
```

Every referenced file uses a normalized relative path beneath the project
directory and records its content hash when it affects execution. References
that escape the project root are rejected. Generated artifacts are not inputs
unless explicitly imported and versioned.

## Multi-project runtime isolation

Each open project has its own `ProjectSession` and dependency-injection scope:

```text
Application
|-- Workspace catalog (paths and UI state only)
|-- ProjectSession A
|   |-- Project snapshot / dirty state
|   |-- Connector and target clients
|   |-- Run coordinator and cancellation boundary
|   `-- Project-scoped logs and notifications
`-- ProjectSession B
    `-- independently scoped services and resources
```

No process-wide mutable "current project" is permitted. Commands carry a
`ProjectId`/session identity, background progress is routed to that session,
and closing one project cannot cancel or dispose resources owned by another.
Connections may be pooled by infrastructure only when pool keys include the
complete non-secret profile identity and environment.

## Save, recovery, and concurrency

- Saves validate first, write a sibling temporary file, flush it, and atomically
  replace the previous manifest while retaining a recoverable backup.
- The loader rejects unsupported major versions and migrates supported older
  versions through explicit, tested transformations.
- Unknown extension fields are preserved when possible so older clients do not
  silently destroy newer data.
- A project detects external edits using its last-read content hash and asks the
  operator to reload or resolve the conflict rather than overwriting blindly.
- A per-project write lease prevents two application windows from saving the
  same manifest concurrently. Read-only open remains possible.
- Autosave/recovery state is app-local and never mistaken for the committed
  project definition.

## Reproducible runs

Before extraction begins, MergerManager:

1. validates the project against its declared schema;
2. resolves and hashes every execution-affecting referenced artifact;
3. resolves connection profile identities without copying their secrets;
4. stores an immutable canonical project snapshot in the run record; and
5. includes the snapshot hash in all checkpoints and evidence exports.

Changing a decision, mapping, rule, crosswalk, or pipeline policy produces a new
project revision. An existing run continues with its snapshot; a new run uses
the latest saved revision.

## Open decisions

- Whether project packages should later support a signed archive format for
  transfer between operators.
- Whether inline crosswalks need a size threshold before externalization.
- Whether collaborative editing is required beyond single-writer file locking.
- Whether a future `.mergerworkspace` file should be shareable; it is not
  required for the first release.
