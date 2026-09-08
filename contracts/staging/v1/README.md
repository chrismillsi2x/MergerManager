# Staging compatibility contract v1.0.0

Status: **candidate**, profile `dbo-v1`. This is the eleven-table physical
interface used by the legacy conversion/promotion procedures, preserved while
the source mapping and controlled Expert loader are developed.

- [Data dictionary](data-dictionary.md): type, nullability, purpose, role,
  sensitivity, retirement status, and logical reference for every column.
- [Machine-readable contract](contract.json): ordered columns and identity
  metadata, with the original source export's SHA-256.
- [Schema](schema.sql): DDL for a fresh, explicitly selected empty conversion
  database. It does not create a database, choose a server, drop objects, or
  upgrade an existing database. It has not been deployed by this PR.
- [Compatibility exceptions](compatibility.md): known differences and the
  boundary between physical compatibility and successful Expert execution.

## Version policy

Version 1 preserves existing schema/table names, column order, lengths, numeric
precision/scale, datetime precision, nullability, identity seed/increment, and
absence of defaults/keys. All eleven ID columns are IDENTITY(1,1); none is a
declared primary key. IDENTITY alone is not a uniqueness constraint.

A rename, removal, type/nullability/identity change, default, or new constraint
requires an explicit migration/compatibility review and a new major physical
profile if it can reject or reinterpret legacy input. Documentation corrections
can be patch releases; additive optional metadata outside the eleven-table
interface can be minor releases after compatibility review. Run/project metadata
belongs in control storage; v1 does not introduce ProjectId into these tables.

Schema files intentionally omit deployment-specific filegroups and data-file
paths. Database collation, SQL Server version and session settings are deployment
prerequisites; they are not proven by matching column definitions.

## Logical validation requirements

The dictionary's relationships are not newly enforced SQL foreign keys.
Validation must check same-project/company ownership, uniqueness and cardinality
before converting or promoting. COMPANY_CODE/BATCH alone cannot safely isolate
concurrent projects with the unmodified procedures; several promotions ignore
batch and some statements hard-code company scope (procedure decisions D02/D14).

Source IDs are scoped to source system/company/entity, not globally unique.
NAMES additionally uses SOURCE_TYPE to distinguish clients, contacts and vendors.
VENDORADDRESSES.VENDOR_SOURCE_ID references VENDORS.SOURCE_ID, not its identity ID.
RATES.CLIENT_ID and MATTER_ID are varchar(255) joined to integer IDs: validate
parseability and exact lookup before execution; do not silently coerce bad IDs.

Required business validations include code crosswalk completeness, duplicate
client/matter/vendor codes, string truncation checks, parent ownership,
assignment split percentages, rate effective/expiry dates, and note ownership.
SQL-nullable does not mean a value is optional to a particular operation. These
rules belong to the validation work in #15 and domain work in #18–#20.

TEST/PROD mappings remain distinct. No existing ID or approval can be carried
from a prior project/template into a new merger. Existing *_OBS columns and
EMAIL_DONOTUSE remain physically present. `retained-legacy-review` means a future
retirement candidate, not permission to stop populating a consumed field.

## Verification

```powershell
node --test scripts/staging-contract.test.mjs
# Optional exact-source comparison, using the authorized original attachment:
$env:CONVERSION_SOURCE_SQL = '<private-export-path>'
node --test scripts/staging-contract.test.mjs
```

Regenerate all three artifacts with:

```powershell
node scripts/staging-contract.mjs <private-export-path> contracts/staging/v1
```

The static suite checks all exported physical definitions, round trips generated
DDL, ensures every inventoried staging UPDATE column exists, and documents the
known client-variant mismatch. It does not compile or run the Expert procedures.
The final runtime compatibility acceptance criterion of issue #2 remains open
until the candidate is bound and exercised in an isolated approved SQL Server
test environment with the target schema and allocator available.
