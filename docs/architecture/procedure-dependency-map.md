# Procedure dependency map

This map is derived from SQL read/write statements in the supplied database
definition. It intentionally lists the local staging tables only; the procedures
also write many Aderant test and production tables.

## Test conversion procedures

| Procedure | Local staging dependencies |
| --- | --- |
| `CONVERTADDRESSES` | `ADDRESSES`, `CLIENTS`, `NAMES` |
| `CONVERTASSIGNMENTS` | `ASSIGNMENTS` |
| `CONVERTBILLGROUPS` | `BILLGROUPS`, `MATTERS` |
| `CONVERTCLIENTS` | `CLIENTS`, `NAMES` |
| `CONVERTCLIENTS_OG` | `CLIENTS`, `NAMES` |
| `CONVERTCLIENTSHOLDER` | `CLIENTS`, `NAMES` |
| `CONVERTCONTACTS` | `ADDRESSES`, `CLIENTS`, `CONTACTS`, `NAMES` |
| `CONVERTMATTERS` | `CLIENTS`, `MATTERS` |
| `CONVERTNOTES` | `CLIENTS`, `MATTERS`, `NOTES` |
| `CONVERTRATES` | `RATES` |
| `CONVERTVENDORADDRESSES` | `VENDORADDRESSES`, `VENDORS` |
| `CONVERTVENDORS` | `NAMES`, `VENDORS` |

## Production promotion procedures

| Procedure | Local staging dependencies |
| --- | --- |
| `PROMOTEASSIGNMENTS` | `ASSIGNMENTS`, `CLIENTS`, `MATTERS` |
| `PROMOTEBILLGROUPS` | `ADDRESSES`, `BILLGROUPS`, `CLIENTS`, `CONTACTS`, `MATTERS` |
| `PROMOTECLIENTADDRESSES` | `ADDRESSES`, `CLIENTS`, `MATTERS`, `NAMES` |
| `PROMOTECLIENTS` | `CLIENTS`, `NAMES` |
| `PROMOTECONTACTS` | `ADDRESSES`, `CLIENTS`, `CONTACTS`, `NAMES` |
| `PROMOTEMATTERS` | `CLIENTS`, `MATTERS` |
| `PROMOTENOTES` | `CLIENTS`, `MATTERS`, `NOTES` |
| `PROMOTERATES` | `CLIENTS`, `MATTERS`, `RATES` |
| `PROMOTEVENDORADDRESSES` | `VENDORADDRESSES`, `VENDORS` |
| `PROMOTEVENDORS` | `NAMES`, `VENDORS` |

## Initial load-order hypothesis

The dependency map suggests the following starting order. It must be verified
against target-side dependencies and actual procedure behavior before execution:

1. Names and clients
2. Client addresses
3. Contacts
4. Matters
5. Bill groups
6. Assignments
7. Notes
8. Rates
9. Vendors
10. Vendor addresses

## Findings requiring decisions

- Select or consolidate the three client conversion variants.
- Determine why `PROMOTEBILLGROUPS` depends on address and contact staging and
  whether that is an intentional prerequisite.
- Determine why `PROMOTECLIENTADDRESSES` also reads matters.
- Confirm whether rates are valid at client, matter, and employee scopes and
  formalize those conditional relationships.
- Inventory every Aderant test/production table written by each procedure and
  classify direct inserts, updates, key allocation calls, and fake/faux tables.
- Define whether a failed procedure can be retried safely after it has allocated
  keys or partially updated test/production identifiers in staging.
