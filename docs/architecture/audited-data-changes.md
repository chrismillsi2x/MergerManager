# Audited data changes and go-live corrections

## Problem

Merger work often requires a temporary correction that is valid only during a
particular rehearsal or cutover phase. Today those corrections may be executed
as ad hoc SQL. The resulting database state does not reliably answer who changed
what, why, which rows were affected, what the previous values were, whether the
change was approved, or whether it should still be active after go-live.

MergerManager treats every mutation as managed conversion work. It does not
attempt to make unaudited SQL safer by adding a free-form query window.

## Control boundary

```text
Operator / pipeline / imported SQL
                |
                v
       Governed ChangeSet
       | validate + authorize
       | select + preview
       | approve
       v
      Data Mutation Gateway
       | transaction / idempotency
       | before + after capture
       | append-only audit events
       v
 landing | staging | Aderant test | Aderant production
                |
                v
        verify + reconcile + retire/reverse
```

Application code, UI commands, pipeline steps, and imported scripts all use the
same gateway. Repository and architecture tests prevent infrastructure code
from obtaining a write-capable connection except through that component.

This guarantees only application-mediated changes. To cover all changes:

- ordinary users and service identities receive no direct DML permission;
- environment-specific gateway identities receive least-privilege operations;
- database-native auditing records DDL, direct DML, permission changes, and
  break-glass activity outside MergerManager; and
- a reconciliation job flags native database changes with no matching
  MergerManager execution record.

## Change-set definition

A `ChangeSet` is a versioned intent, not merely SQL text.

| Field | Purpose |
| --- | --- |
| Identity | Stable change-set ID, version, project ID, title, and owner |
| Reason | Business purpose, source request/ticket, rationale, and expected outcome |
| Phase | Exact lifecycle point at which the change may run |
| Environment | Landing, staging, Aderant test, or Aderant production |
| Scope | Entity/table, selection predicate, business keys, and expected row bounds |
| Mutation | Typed rule or reviewed parameterized SQL artifact and its SHA-256 hash |
| Preconditions | Required project/run state, data assertions, and dependency changes |
| Evidence policy | Before/after columns, sensitive classifications, and retention tier |
| Verification | Postconditions, counts/totals, validation rules, and reconciliation checks |
| Recovery | Inverse operation when safe, snapshot restore plan, or explicit irreversibility |
| Activation | One run, a bounded run range, or a bounded go-live window |
| Governance | Required approvals, separation of duties, and emergency policy |

The lifecycle is:

```text
Draft -> Validated -> Ready for approval -> Approved -> Executing
                                              |             |
                                              v             v
                                           Rejected   Applied / Failed
                                                          |
                                                          v
                                               Verified -> Retired
                                                          |
                                                          v
                                               Reversed or Superseded
```

Definitions and executed versions are never deleted or edited in place. A
correction creates a new version; a replacement links to the superseded change.

## Supported phases

- `PreExtract`: exceptional source correction before extraction; disabled by
  default because source connections should normally be read-only.
- `PostLanding`: preserve raw source evidence while correcting the working copy.
- `PostNormalize`: repair normalized staging data before validation.
- `PreTestConvert` and `PostTestConvert`: changes around Aderant test conversion.
- `PreProductionPromote`: final approved cutover adjustment.
- `PostGoLive`: tightly controlled production correction and verification.

A change set is eligible only in its declared phase and environment. One-shot
changes automatically retire after successful verified execution. Recurring
rules must declare a bounded activation window and are reevaluated for each run.

## Preview and approval

Before approval, the system runs the selector without mutation and displays:

- target project, run, environment, entity, and phase;
- selected row count versus minimum/maximum bounds;
- business keys and a redacted before/proposed-after diff sample;
- impacted relationships and validations;
- script/rule and project revision hashes;
- transaction, locking, recovery, and irreversibility warnings; and
- required approvers and separation-of-duties status.

The preview receives a content hash. Approval applies only to that exact hash
and expires if the project, selector result, script, parameters, environment, or
data preconditions change. Production approval requires a second identity when
policy calls for it. Emergency execution records who invoked the break-glass
path, the justification, its expiration, and mandatory retrospective approval.

## Row-level evidence

For every affected row, the execution journal records:

- change-set/execution/run/project IDs and immutable definition hashes;
- environment, database, schema, table/entity, and stable business key;
- before and after field values or encrypted evidence-artifact references;
- per-field change type and source-lineage reference;
- executing identity, approving identities, timestamps, correlation ID, and
  transaction/commit outcome; and
- verification and reversal linkage.

Large row images are written to encrypted, chunked evidence artifacts; the
queryable journal stores business keys, classifications, artifact offsets, and
cryptographic hashes. Sensitive values are masked in normal UI and logs while
remaining available to specifically authorized audit workflows.

Audit events are append-only and hash-chained within an execution. Retention
policy may remove encrypted payloads when legally required, but it leaves a
tombstone containing classification, hashes, deletion authority, and time so
the audit sequence remains explainable.

## Imported SQL

Existing ad hoc SQL can be brought under control without pretending it is a
typed transformation:

1. import the `.sql` file into the project directory;
2. record its content hash, parameters, declared target, and permitted phase;
3. statically reject unsafe constructs or require an explicit exception;
4. require a separately declared, bounded selector for preview/evidence;
5. execute only through the mutation gateway with transaction and timeout
   policy; and
6. retain the exact executed script hash, parameter values according to
   sensitivity policy, affected-row evidence, and verification result.

Unbounded updates, environment-changing statements, dynamic connection changes,
permission changes, and DDL are denied by default. Necessary DDL uses a separate
reviewed migration workflow rather than a data change set.

## Recovery semantics

"Auditable" does not imply automatically reversible. Before execution, each
change is classified as:

- **Naturally reversible:** a validated inverse can restore captured values.
- **Snapshot reversible:** recovery restores encrypted before-images under a
  separately approved reversal execution.
- **Compensating only:** downstream effects require a new corrective change.
- **Irreversible:** execution is blocked unless policy explicitly permits it and
  a recovery/runbook decision is recorded.

A reversal is itself a new governed execution linked to the original; history
is never erased.

## Minimum evidence for go-live

A go-live evidence package includes all applied, failed, reversed, superseded,
and still-active change sets; their approvals; before/after counts and hashes;
unmatched native database audit events; verification results; and a report of
temporary changes that must be retired after go-live. Closure is blocked while
an expired or unverified temporary production change remains active.
