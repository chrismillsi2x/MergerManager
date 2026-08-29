# Legacy schema assessment

## Scope

This assessment is based on the supplied `ConversionSource` SQL Server script
dated August 29, 2026. It is an inventory and disposition proposal, not an
assertion that every legacy object is still used in production.

## Inventory

| Signal | Count | Interpretation |
| --- | ---: | --- |
| Tables | 163 | Several merger generations are combined in one database. |
| `dbo` tables | 108 | Reusable, target-shaped, and temporary objects share a namespace. |
| `cw` / `gip` / `source` tables | 55 | Source- and merger-specific objects are embedded in the database. |
| Date/delta/old/backup-like tables | 56 | Run state is represented by physical copies and names. |
| `MA_*` tables | 44 | This prefix appears company-specific and does not define the reusable contract. |
| Procedures | 23 | 12 convert, 10 promote, and one matter-number reset procedure. |
| Declared foreign keys | 0 | Relationship integrity is procedural rather than expressed in the schema. |

Only a handful of key/index declarations appear in the script. The importance
of an object is determined by procedure dependency, not its prefix or schema.

## Procedure-derived staging contract

The following eleven local tables are directly referenced by the active
`CONVERT*` or `PROMOTE*` procedures and are therefore the initial compatibility
contract:

| Domain | Tables |
| --- | --- |
| Party identity | `NAMES`, `CLIENTS`, `CONTACTS`, `ADDRESSES` |
| Matters and billing | `MATTERS`, `BILLGROUPS`, `ASSIGNMENTS` |
| Content and rates | `NOTES`, `RATES` |
| Vendors | `VENDORS`, `VENDORADDRESSES` |

These tables already contain useful staging concerns: source identifiers,
company and batch scope, test and production identifiers, timestamps, and in
many cases a promotion flag. They should be preserved as the initial external
interface while their missing constraints, inconsistent key types, obsolete
columns, and run semantics are documented and improved compatibly.

The procedures establish two distinct stages after normalization:

1. `CONVERT*` allocates keys and writes Aderant test tables.
2. `PROMOTE*` uses staged and test identifiers to write Aderant production.

Three client conversion variants (`CONVERTCLIENTS`, `_OG`, and `HOLDER`) must be
compared before one is selected or consolidated. The local `CXA_FOLDER_OBJECT`
table and `BATCH_HISTORY` are not directly used by the reviewed procedures;
similarly named Aderant target tables should not be confused with local staging.

## Disposition

| Legacy family | Proposed treatment |
| --- | --- |
| Eleven procedure-referenced staging tables | Preserve names and required columns as the v1 compatibility contract; add constraints and run metadata only through tested migrations or compatibility views. |
| `CONVERT*` procedures | Encapsulate as the Aderant test-conversion adapter; document staging reads, target writes, key allocation, and stage-table updates. |
| `PROMOTE*` procedures | Encapsulate as the Aderant production-promotion adapter; test ordering, idempotency, and target side effects. |
| `BATCH_HISTORY` | Replace with project, run, step, checkpoint, artifact, and approval records. |
| `MA_*` and `MA_*_DELTA` tables | Treat as company-specific evidence unless a verified active procedure or mapping requires an object. Do not infer meaning from the prefix. |
| `source`, `cw`, and `gip` tables | Treat as merger-specific evidence or fixtures, not reusable product schema. |
| Dated, `_OG`, `_OLD`, `_BAK`, and scratch tables | Exclude from the product schema after documenting any unique rules they contain. |
| Name-parsing helper functions | Replace with explicit, testable transformation rules and exception handling. |
| Database creation settings and physical file paths | Exclude; deploy through environment-neutral migrations and configuration. |

## Candidate canonical entity groups

1. Parties: names, contacts, clients, addresses, and vendors.
2. Matters: matter data, bill groups, and assignments.
3. Financial configuration: rates.
4. Content: client and matter notes.
5. Control: projects, runs, mappings, crosswalks, validations, exceptions,
   reconciliation, checkpoints, and artifacts.

## Exit criteria for the schema redesign

- Every column in the eleven procedure-referenced tables maps to a canonical
  field, adapter-only field, or an explicit retirement decision.
- Canonical fields have types, nullability, keys, relationships, semantics,
  sensitivity classification, and validation rules.
- Load order is derived from declared dependencies rather than procedure names.
- Full, rehearsal, delta, retry, and rollback behavior does not require cloned
  tables.
- Versioned compatibility tests prove all `CONVERT*` and `PROMOTE*` procedures
  receive the required columns and preserve their test/production identifier
  updates.
