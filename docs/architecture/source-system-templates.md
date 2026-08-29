# Source-to-staging template architecture

## Architectural seam

The conversion has two fundamentally different parts:

1. **Source firm PMS to staging:** exploratory and source-specific. Database
   structures, naming, quality, customizations, and business semantics vary.
2. **Staging to target firm Expert:** regimented and product-owned. Given a
   compatible, validated staging contract, the same versioned load graph should
   produce the same Expert operations for every merger.

Firm-specific logic is permitted only on the source side of this seam. The
Expert loader may expose approved parameters such as target environment,
company code, batch/run identity, and loader compatibility profile, but a
merger project cannot replace target table mappings or reorder load steps.

## Template purpose

A source-system template captures reusable knowledge learned while mapping a
known practice management system to a specific staging-contract version. It is
not a copy of the prior source firm's project.

```text
Certified template v2.1
    |-- connector requirements
    |-- compatible source-system versions
    |-- expected schema fingerprint/shape
    |-- extraction definitions
    |-- source-to-staging mappings
    |-- transformations and validations
    |-- generic code crosswalks
    |-- required project decisions
    |-- known limitations and fixtures
    `-- staging contract v1
                     |
                     v
New merger project overlay
    |-- source/target firm identities
    |-- observed schema drift
    |-- firm-specific mappings and crosswalks
    |-- decision answers and exceptions
    `-- exact template version + override provenance
```

## Template contents

| Section | Content |
| --- | --- |
| Identity | Template ID, semantic version, status, owners, and release notes |
| Compatibility | PMS product/version ranges, DBMS/driver requirements, staging-contract versions, and loader prerequisites |
| Fingerprint | Expected objects, columns, types, keys, relationships, optional features, and canonical schema hash |
| Extraction | Parameterized source queries or connector-native extraction definitions |
| Mapping | Source fields to the eleven staging tables with typed transformations and provenance |
| Validation | Source assumptions, mapping coverage rules, staging rules, and expected control totals |
| Decisions | Questions every new project must answer and permitted/default choices |
| Reusable crosswalks | Product-generic codes only, with ownership and evidence |
| Tests | Synthetic fixtures, expected staging output, and known drift cases |
| Limitations | Unsupported modules/customizations, manual steps, risks, and required specialist review |

A template never contains source-firm names, client/matter data, credentials,
server names, environment identifiers, allocated Expert IDs, approvals, run
history, or firm-specific crosswalk values.

## Compatibility and schema drift

When creating a project from a template, MergerManager discovers the actual
source system and compares it with the template fingerprint. The result is not
just compatible/incompatible; it classifies drift:

- exact required object/column match;
- compatible type or nullability variation;
- missing required or optional source element;
- unexpected source element requiring disposition;
- changed key/relationship/cardinality assumption;
- source customization colliding with a template rule; and
- product/version or database capability outside the certified range.

The operator receives a coverage and drift report before accepting the
template. Safe matches may be applied automatically; uncertain matches become
explicit project decisions. A template never silently ignores new source fields
or applies a rule solely because a column name looks similar.

## Project overlay and provenance

Templates are immutable after release. A project references an exact version
and stores an overlay rather than copying rules without provenance. Each
resolved rule records whether it is:

- inherited unchanged from the template;
- parameterized by a project decision;
- overridden for the source firm, with reason and approval;
- disabled as not applicable; or
- newly created for an uncovered source customization.

Runs snapshot the fully resolved mapping, not just the template reference.
Updating a project to a newer template produces a three-way comparison between
the old template, new template, and project overlay. Conflicts require an
explicit choice and validation rerun.

## Promoting knowledge from a completed project

Reusable work does not flow automatically back into a template. A promotion
workflow:

1. selects candidate extraction, mapping, transformation, validation, and
   decision assets from a successful project;
2. removes or parameterizes firm-specific identifiers and values;
3. scans for confidential data, credentials, absolute paths, and environment
   references;
4. replaces real examples with synthetic fixtures;
5. proves the candidate against the template contract tests and at least one
   independently reviewable schema snapshot;
6. records limitations and migration notes; and
7. publishes a new immutable template version after approval.

## Template certification states

- **Draft:** editable and usable only for development.
- **Candidate:** structurally valid with passing synthetic tests; requires
  explicit warning when used.
- **Certified:** approved for its declared compatibility range and staging
  contract.
- **Deprecated:** still resolvable for historical projects but not recommended.
- **Withdrawn:** blocked for new projects due to correctness or security risk.

Certification does not mean a new source firm is automatically compatible. It
means the template itself has passed its declared tests; the project-specific
schema drift and mapping coverage gates still apply.

## Staging-to-Expert invariants

After staging validation succeeds:

- one versioned loader profile defines target tables, columns, procedures, and
  dependency order for a declared Expert/staging-contract compatibility pair;
- loader definitions are shipped and signed as product assets;
- projects cannot edit loader SQL or target mappings;
- plan/dry-run shows the resolved fixed graph and bounded parameters;
- compatibility, environment identity, audit, validation, and approval gates
  must pass before execution; and
- differences between mergers are represented in staged data and approved
  loader parameters, never by a hidden target-side script fork.
