# Compatibility evidence and exceptions

The v1 contract preserves every column of all eleven original tables. Therefore
it introduces no table/column signature changes to existing consumers. Static
shape equality is distinct from proving that a procedure compiles and runs.

| Consumer / behavior | Status | Evidence and next step |
| --- | --- | --- |
| Eleven exported staging tables | Physical baseline retained | Exact ordered type, precision, nullability and identity comparison with the original export; no new keys/defaults |
| All local UPDATE columns in the procedure inventory | Statically present | Automated check resolves each LOCAL target and verifies every written column |
| CONVERTCLIENTS_OG | Known incompatible source reference | Uses NAMES.SOURCE (export 5100, 5121); original and v1 define SOURCE_TYPE instead. Resolve selection/consolidation in #4; do not invent a SOURCE alias |
| CONVERTCLIENTS / CONVERTCLIENTSHOLDER | Physical tables retained, execution unverified | Target environment, join semantics and repeated insertion concerns remain D03/D04 in the procedure review |
| Remaining conversion and promotion bodies | Physical tables retained, execution unverified | Requires actual target DDL, allocator, linked-server bindings and fixture execution; static tests do not certify these dependencies |
| *_OBS columns consumed by bill groups/rates | Retained | Renaming/removing would break source expressions; both normal and OBS mappings remain in v1 |
| Vendor promotion flags | Legacy absence retained | VENDORS and VENDORADDRESSES lack PROMOTE; uniform promotion eligibility is future work, not an added v1 column |
| Transaction, hard-coded scopes, FAUX contacts, disabled pointer updates | Existing behavioral exceptions | Preserve the evidence without approving it for production. See D01–D17 in the procedure review |

See [procedure decisions](../../../docs/architecture/procedure-dependency-map.md).
Each run must pin the staging profile and selected loader version; a physical
match does not waive these unresolved loader decisions.

## Runtime verification still required

1. Provision a disposable conversion database from schema.sql on an approved
   test instance with matching collation and session assumptions.
2. Provide isolated Expert test/production doubles with the required columns and
   allocator behavior; never route the original four-part names to production.
3. Select the supported client variant or explicitly mark it blocked under #4.
4. Bind all selected procedures, then run synthetic fixtures covering the eleven
   tables, parent relations and generated IDs through conversion and promotion.
5. Compare before/after staging mappings and Expert outputs; include empty,
   repeat, partial-failure, and optional-parent cases. Document legacy failures
   separately from any contract regression.

No production or local existing SQL database was modified to create this
candidate. Issue #2 must remain open until this acceptance evidence is obtained.
