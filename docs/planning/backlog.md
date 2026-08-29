# Backlog and work breakdown

## How to read the backlog

The issue title prefix is the work-breakdown identifier. `P0` establishes the
contracts needed by most other work. `P1` creates a safe end-to-end walking
skeleton. `P2` expands domain coverage and operational readiness.

An issue is complete only when its acceptance criteria, tests, and relevant
operator/developer documentation are complete. Unknown Aderant behavior must be
captured as an explicit decision or spike rather than assumed in code.

## Proposed issues

| WBS | Priority | Title | Depends on |
| --- | --- | --- | --- |
| 0.1 | P0 | `[Epic] Establish the reusable merger platform` | — |
| 1.1 | P0 | Map every `CONVERT*` and `PROMOTE*` table dependency and side effect | — |
| 1.2 | P0 | Define and version the eleven-table staging compatibility contract | 1.1 |
| 1.3 | P0 | Define merger run lifecycle, provenance, and audit model | 1.2 |
| 1.4 | P0 | Select the active client conversion procedure and validate Aderant safety constraints | 1.1 |
| 1.5 | P0 | Record security, privacy, and data-retention requirements | — |
| 2.1 | P0 | Scaffold the .NET MAUI solution and automated test projects | 1.3, 1.5 |
| 2.2 | P1 | Implement merger project workspace and versioned configuration | 2.1 |
| 2.3 | P1 | Define source connector contracts and capability model | 1.2 |
| 2.4 | P1 | Implement the SQL Server reference source connector | 2.3 |
| 2.5 | P1 | Implement source schema discovery and profiling | 2.4 |
| 3.1 | P1 | Provision run-aware landing, staging, crosswalk, and quality schemas | 1.2, 1.3 |
| 3.2 | P1 | Build the mapping and transformation rule engine | 2.5, 3.1 |
| 3.3 | P1 | Build crosswalk management with import, export, and validation | 3.1 |
| 3.4 | P1 | Implement dependency-aware pipeline orchestration and checkpoints | 1.3, 3.1 |
| 3.5 | P1 | Implement validation findings, exception approvals, and gating | 3.2, 3.4 |
| 3.6 | P1 | Implement reconciliation reports and evidence export | 3.5 |
| 4.1 | P1 | Wrap test `CONVERT*` and production `PROMOTE*` procedures with plan/dry-run mode | 1.4, 3.4 |
| 4.2 | P1 | Migrate contacts, clients, and addresses end to end | 3.2, 4.1 |
| 4.3 | P1 | Migrate matters, bill groups, and assignments end to end | 4.2 |
| 4.4 | P2 | Migrate personnel, rates, vendors, and notes end to end | 4.2 |
| 4.5 | P1 | Support idempotent rehearsal, delta, retry, and cutover runs | 3.4, 4.1 |
| 5.1 | P1 | Build the MAUI mapping, preview, validation, and run experience | 2.2, 3.2, 3.5 |
| 5.2 | P2 | Create deterministic fixtures and connector contract tests | 2.3, 3.1 |
| 5.3 | P2 | Add CI, packaging, diagnostics, and support matrix | 2.1, 5.2 |
| 6.1 | P1 | Publish the reusable merger playbook and automation coverage matrix | 3.6, 4.5 |

## Reusable merger work breakdown

| Phase | Human outcome | Tool automation target |
| --- | --- | --- |
| 1. Initiate | Scope, owners, systems, retention, and success measures agreed | Project template, checklist, roles, decision log |
| 2. Discover | Source connectivity, inventory, volumes, keys, and quality known | Schema discovery, profiling, sampling, sensitivity flags |
| 3. Map | Every in-scope field and code has a disposition | Mapping suggestions, crosswalk import, rule preview, coverage report |
| 4. Configure | Versioned extraction, transformation, validation, and load plan ready | Connector profiles, rule sets, dependency graph, dry-run plan |
| 5. Rehearse | Repeatable full conversion completes in a safe environment | Checkpoints, retries, timing, validation and reconciliation reports |
| 6. Remediate | Blocking findings resolved or explicitly accepted | Finding ownership, exception workflow, rule revision history |
| 7. Cut over | Approved delta/final run loads in dependency order | Freeze checklist, delta capture, approvals, idempotent execution |
| 8. Verify | Counts, totals, relationships, and samples are signed off | Automated reconciliation, evidence package, sign-off record |
| 9. Close | Data is retained or destroyed per policy and lessons are reusable | Archive package, retention actions, reusable rule promotion |

## Suggested labels

- Type: `type:epic`, `type:feature`, `type:spike`, `type:chore`
- Area: `area:architecture`, `area:data`, `area:connector`, `area:aderant`,
  `area:ui`, `area:quality`, `area:security`, `area:docs`
- Priority: `priority:p0`, `priority:p1`, `priority:p2`
- Workflow: `blocked`, `needs-decision`

## Release slices

1. **Contract baseline:** WBS 1.x and the accepted staging contract.
2. **Walking skeleton:** create a project, discover SQL Server, map a small
   contact/client fixture, validate it, dry-run the Aderant plan, and reconcile.
3. **Core merger:** contacts/clients/addresses plus matters/billing/assignments,
   with rehearsal, delta, retry, and operator UI.
4. **Full operational release:** remaining entity groups, packaging, support
   matrix, playbook, and evidence-based cutover workflow.
