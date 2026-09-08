# Staging data dictionary v1.0.0

Profile: `dbo-v1`. [Contract policy and limitations](README.md). All eleven tables remain in `dbo`.

Types, column order, nullability and identity come from the original export. Semantics describe intended roles inferred from names and the procedure review; unconfirmed business meanings are explicit.

Every field is at least client-confidential. Restricted fields require protected audit payloads. Classifications are proposed handling defaults, not claims about the contents of any particular database.

No defaults, primary keys, foreign keys, or uniqueness constraints are declared for these tables. Logical references below are validation requirements, not added SQL constraints.

## NAMES

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(50) | no | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| SOURCE_TYPE | varchar(2) | yes | source-provenance | client-confidential | retained | Name-owner discriminator; current procedures use CL for clients, CC for contacts, VN for vendors. |
| NAME_TYPE | varchar(1) | yes | normalized-business-data | personal-or-client-confidential | retained | Person/organization discriminator; current procedures create person detail for P; full code domain requires confirmation. |
| SORT_BY_NAME | varchar(30) | yes | normalized-business-data | personal-or-client-confidential | retained | Name sort key for Expert HBM_NAME.NAME_SORT. |
| DISPLAY_NAME | varchar(160) | yes | normalized-business-data | personal-or-client-confidential | retained | Display name of the party/vendor. |
| FIRST_NAME | varchar(20) | yes | normalized-business-data | personal-or-client-confidential | retained | Given name component. |
| MIDDLE_NAME | varchar(20) | yes | normalized-business-data | personal-or-client-confidential | retained | Middle name component. |
| LAST_NAME | varchar(30) | yes | normalized-business-data | personal-or-client-confidential | retained | Family name component. |
| TEST_NAME_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_NAME_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## CLIENTS

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| NAME_ID | int | no | staging-relationship | client-confidential | retained | Logical staging reference to NAMES.ID; not enforced by a foreign key in this export. Reference: NAMES.ID. |
| COMPANY_CODE | varchar(5) | yes | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(50) | no | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| SOURCE_CODE | varchar(50) | no | source-provenance | client-confidential | retained | Original source client code before mapping to target-firm codes. |
| TEST_CLIENT_CODE | varchar(10) | no | expert-test-mapping | client-confidential | retained | Expert test client code mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_CLIENT_CODE | varchar(10) | no | expert-production-mapping | client-confidential | retained | Expert production client code mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CLIENT_NAME | varchar(40) | yes | normalized-business-data | personal-or-client-confidential | retained | Short client display name. |
| CLIENT_INACTIVE | varchar(1) | yes | normalized-business-data | client-confidential | retained | Staged client inactive flag; not proof of application by CONVERTCLIENTS, which inserts a constant inactive value. |
| CLIENT_STATUS | varchar(5) | yes | normalized-business-data | client-confidential | retained | Mapped target client status code. |
| OPEN_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Business opening date for this client or matter. |
| CLOSE_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Business closing date for this client or matter. |
| TEST_NAME_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_NAME_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_CLIENT_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_CLIENT_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| OFFC | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target office code. |
| DEPT | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target department code. |
| PROF | varchar(4) | yes | normalized-business-data | client-confidential | retained | Legacy target PROF organizational code; business meaning and valid values require target-firm confirmation. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |
| SOURCE_SYSTEM | varchar(50) | yes | source-provenance | client-confidential | retained | Source PMS identification/provenance label. |
| TEST_CLIENT_NUMBER | int | yes | expert-test-mapping | client-confidential | retained | Expert test client number mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |

## ADDRESSES

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| NAME_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to NAMES.ID; not enforced by a foreign key in this export. Reference: NAMES.ID. |
| CLIENT_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| COMPANY_CODE | varchar(30) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(50) | no | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| SOURCE_NAME_ID_OBS | varchar(50) | yes | source-provenance | client-confidential | retained-legacy-review | Legacy source name identifier; retained pending caller and mapping review. |
| SEQUENCE_NO | int | yes | normalized-business-data | client-confidential | retained | Source address ordering/sequence metadata; preferred-address policy requires confirmation. |
| ATTENTION | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Address attention/addressee text. |
| ADDRESS1 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 1. |
| ADDRESS2 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 2. |
| ADDRESS3 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 3. |
| ADDRESS4 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 4. |
| CITY | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal city/locality. |
| STATE | varchar(5) | yes | normalized-business-data | personal-or-client-confidential | retained | Mapped state/province code; fixed-width in vendor addresses and variable-width in client addresses. |
| COUNTRY | varchar(5) | yes | normalized-business-data | personal-or-client-confidential | retained | Staged country code; CONVERTADDRESSES currently writes an empty target country code. |
| ZIP | varchar(50) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal code, retaining leading zeros. |
| ADDRESS_TYPE | varchar(5) | yes | normalized-business-data | client-confidential | retained | Address purpose code; MAIN is used for client defaults, 1099 then REMIT for preferred vendor addresses. |
| PHONE_NUMBER | varchar(20) | yes | normalized-business-data | personal-or-client-confidential | retained | Primary telephone number. |
| PHONE_NUMBER2 | varchar(20) | yes | normalized-business-data | personal-or-client-confidential | retained | Secondary telephone number. |
| FAX_NUMBER | varchar(20) | yes | normalized-business-data | personal-or-client-confidential | retained | Fax number. |
| EMAIL_DONOTUSE | varchar(500) | yes | normalized-business-data | personal-or-client-confidential | retained-legacy-review | Legacy address email field explicitly marked do-not-use; preserve physically pending retirement approval. |
| TEST_NAME_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_NAME_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| TEST_ADDRESS_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_ADDRESS_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## CONTACTS

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| NAME_ID | int | no | staging-relationship | client-confidential | retained | Logical staging reference to NAMES.ID; not enforced by a foreign key in this export. Reference: NAMES.ID. |
| CLIENT_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(50) | no | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| SOURCE_CLIENT_ID_OBS | varchar(50) | yes | source-provenance | client-confidential | retained-legacy-review | Legacy source client identifier; retained pending caller and mapping review. |
| CONTACT_NAME | varchar(50) | yes | normalized-business-data | personal-or-client-confidential | retained | Contact display name. |
| EMAIL | varchar(120) | yes | normalized-business-data | personal-or-client-confidential | retained | Contact email address. |
| TEST_NAME_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_NAME_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| TEST_CONTACT_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test contact uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_CONTACT_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production contact uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_ADDRESS_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_ADDRESS_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## MATTERS

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| CLIENT_ID | int | no | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| BILLGRP_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to BILLGROUPS.ID; not enforced by a foreign key in this export. Reference: BILLGROUPS.ID. |
| ADDRESS_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to ADDRESSES.ID; not enforced by a foreign key in this export. Reference: ADDRESSES.ID. |
| COMPANY_CODE | varchar(5) | yes | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(250) | no | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| SOURCE_MATTER_CODE | varchar(50) | no | source-provenance | client-confidential | retained | Original source matter code before target code assignment. |
| SOURCE_MATT_TYPE_CODE | varchar(50) | yes | source-provenance | client-confidential | retained | Original source matter-type code for target code crosswalk. |
| TEST_MATTER_CODE | varchar(10) | no | expert-test-mapping | client-confidential | retained | Expert test matter code mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_MATTER_CODE | varchar(10) | no | expert-production-mapping | client-confidential | retained | Expert production matter code mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| MATT_TYPE_CODE | varchar(5) | yes | normalized-business-data | client-confidential | retained | Mapped target matter-type code. |
| LONG_MATT_NAME | varchar(250) | yes | normalized-business-data | personal-or-client-confidential | retained | Long matter description. |
| MATTER_NAME | varchar(40) | yes | normalized-business-data | personal-or-client-confidential | retained | Short matter name. |
| INACTIVE | varchar(1) | yes | normalized-business-data | client-confidential | retained | Staged matter inactive flag; null/value handling must follow the selected loader. |
| STATUS_CODE | varchar(5) | no | normalized-business-data | client-confidential | retained | Mapped target matter status code. |
| OPEN_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Business opening date for this client or matter. |
| CLOSE_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Business closing date for this client or matter. |
| OFFC | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target office code. |
| DEPT | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target department code. |
| PROF | varchar(4) | yes | normalized-business-data | client-confidential | retained | Legacy target PROF organizational code; business meaning and valid values require target-firm confirmation. |
| TEST_MATTER_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test matter uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_MATTER_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production matter uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_COMMENT_TEXT_ID | int | yes | expert-test-mapping | client-confidential | retained | Expert test comment text id mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_COMMENT_TEXT_ID | int | yes | expert-production-mapping | client-confidential | retained | Expert production comment text id mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_RESP_EMPL_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test resp empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_RESP_EMPL_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production resp empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_BILL_EMPL_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test bill empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_BILL_EMPL_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production bill empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |
| BILL_EMPL_UNO | int | yes | normalized-business-data | client-confidential | retained | Unqualified legacy billing employee identifier; intended target environment needs confirmation. |
| MATTER_NUMBER | int | yes | normalized-business-data | client-confidential | retained | Numeric matter-number component; relationship to string matter code requires loader validation. |
| RESP_EMPL_UNO | int | yes | normalized-business-data | client-confidential | retained | Unqualified legacy responsible employee identifier; intended target environment needs confirmation. |
| TEST_MATTER_OPT_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test matter opt uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_MATTER_OPT_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production matter opt uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |

## BILLGROUPS

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| CLIENT_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| CONTACT_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to CONTACTS.ID; not enforced by a foreign key in this export. Reference: CONTACTS.ID. |
| ADDRESS_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to ADDRESSES.ID; not enforced by a foreign key in this export. Reference: ADDRESSES.ID. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(50) | yes | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| BILLGRP_CODE | varchar(10) | yes | normalized-business-data | client-confidential | retained | Target bill-group code. |
| BILL_DELIVERY_METHOD | varchar(25) | yes | normalized-business-data | client-confidential | retained | Mapped bill distribution/delivery method. |
| TEST_CLIENT_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_CLIENT_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| TEST_ADDRESS_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_ADDRESS_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| TEST_CONTACT_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test contact uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_CONTACT_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production contact uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| TEST_BL_EMPL_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test bl empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_BL_EMPL_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production bl empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_BILLGRP_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test billgrp uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_BILLGRP_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production billgrp uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## ASSIGNMENTS

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| CLIENT_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| MATTER_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to MATTERS.ID; not enforced by a foreign key in this export. Reference: MATTERS.ID. |
| TEST_CLIENT_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_CLIENT_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_MATTER_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test matter uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_MATTER_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production matter uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_EMPL_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_EMPL_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| SOURCE_EMPLOYEE | varchar(10) | yes | source-provenance | client-confidential | retained | Original source employee identifier for personnel mapping. |
| ASSIGNMENT_CODE | varchar(5) | yes | normalized-business-data | client-confidential | retained | Mapped participation category for TBM_CLMAT_PART.PART_CAT_CODE. |
| ASSIGNMENT_PERCENT | numeric(10,2) | yes | normalized-business-data | client-confidential | retained | Participation percentage. Precision is numeric(10,2); valid range/split-total policy is a business validation. |
| TEST_ASSIGNMENT_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test assignment uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_ASSIGNMENT_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production assignment uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| EFF_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Business effective date of the assignment or rate. |
| BATCH | int | no | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## NOTES

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| TXT | varchar(max) | yes | normalized-business-data | restricted | retained | Client/matter note content; may contain sensitive free text. Text aggregation policy is unresolved. |
| TEST_TEXT_ID | int | yes | expert-test-mapping | client-confidential | retained | Expert test text id mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_TEXT_ID | int | yes | expert-production-mapping | client-confidential | retained | Expert production text id mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| BATCH | int | no | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| CLIENT_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| MATTER_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to MATTERS.ID; not enforced by a foreign key in this export. Reference: MATTERS.ID. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## RATES

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| CLIENT_ID | varchar(255) | yes | staging-relationship | client-confidential | retained | Logical staging reference to CLIENTS.ID; not enforced by a foreign key in this export. Reference: CLIENTS.ID. |
| MATTER_ID | varchar(255) | yes | staging-relationship | client-confidential | retained | Logical staging reference to MATTERS.ID; not enforced by a foreign key in this export. Reference: MATTERS.ID. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | varchar(255) | yes | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| SOURCE_MATTER_ID | varchar(250) | yes | source-provenance | client-confidential | retained | Source matter identifier retained for provenance/crosswalk. |
| SOURCE_CLIENT_ID_OBS | varchar(255) | yes | source-provenance | client-confidential | retained-legacy-review | Legacy source client identifier; retained pending caller and mapping review. |
| TEST_MATTER_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test matter uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_MATTER_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production matter uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| TEST_CLIENT_UNO_OBS | int | yes | expert-test-mapping | client-confidential | retained-legacy-review | Expert test client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| PROD_CLIENT_UNO_OBS | int | yes | expert-production-mapping | client-confidential | retained-legacy-review | Expert production client uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. Legacy OBS designation does not authorize removal; some OBS values remain loader inputs. |
| RANK_CODE | varchar(10) | yes | normalized-business-data | client-confidential | retained | Personnel rank/category used by the rate. |
| RATE_LEVEL | int | yes | normalized-business-data | client-confidential | retained | Rate-level selector; valid target values require confirmation. |
| AMOUNT | numeric(10,2) | yes | normalized-business-data | client-confidential | retained | Rate amount in the legacy numeric(10,2) representation. Currency is not recorded in this table. |
| OFFC | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target office code. |
| DEPT | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target department code. |
| PROF | varchar(4) | yes | normalized-business-data | client-confidential | retained | Legacy target PROF organizational code; business meaning and valid values require target-firm confirmation. |
| EFF_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Business effective date of the assignment or rate. |
| EXP_DATE | datetime2(7) | yes | normalized-business-data | client-confidential | retained | Rate expiry date. |
| TEST_EMPL_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_EMPL_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production empl uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_RATE_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test rate uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_RATE_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production rate uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| PROMOTE | int | yes | control | client-confidential | retained | Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved. |

## VENDORS

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | int | yes | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| DISPLAY_NAME | varchar(160) | yes | normalized-business-data | personal-or-client-confidential | retained | Display name of the party/vendor. |
| FEIN | varchar(20) | yes | normalized-business-data | restricted | retained | Vendor tax identifier; restricted data, never diagnostic output. |
| TEN99TYPE | varchar(4) | yes | normalized-business-data | client-confidential | retained | Vendor tax-reporting classification code. |
| ONECHECK | varchar(1) | yes | normalized-business-data | client-confidential | retained | Vendor check-consolidation flag; allowed codes require confirmation. |
| PAYMENT_TERM | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped vendor payment-term code. |
| TEST_NAME_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_NAME_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_VENDOR_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test vendor uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_VENDOR_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production vendor uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_ADDRESS_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_ADDRESS_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| VENDOR_ID | char(10) | yes | normalized-business-data | client-confidential | retained | Target vendor business code, distinct from source ID and allocated vendor UNO. |
| OFFC | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target office code. |
| PROF | varchar(4) | yes | normalized-business-data | client-confidential | retained | Legacy target PROF organizational code; business meaning and valid values require target-firm confirmation. |
| DEPT | varchar(4) | yes | normalized-business-data | client-confidential | retained | Mapped target department code. |
| NAME_ID | int | yes | staging-relationship | client-confidential | retained | Logical staging reference to NAMES.ID; not enforced by a foreign key in this export. Reference: NAMES.ID. |

## VENDORADDRESSES

| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |
| --- | --- | --- | --- | --- | --- | --- |
| ID | int IDENTITY(1,1) | no | staging-identity | client-confidential | retained | Staging row identity; join key in the legacy procedures. Identity is not a declared primary key. |
| VENDOR_SOURCE_ID | int | yes | source-provenance | client-confidential | retained | Source vendor key, joined to VENDORS.SOURCE_ID within company/batch scope; not VENDORS.ID. Reference: VENDORS.SOURCE_ID. |
| COMPANY_CODE | varchar(5) | no | control | client-confidential | retained | Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID. |
| SOURCE_ID | int | yes | source-provenance | client-confidential | retained | Identifier of this entity in the source PMS; retain its original representation within the declared SQL type. |
| ADDRESS1 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 1. |
| ADDRESS2 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 2. |
| ADDRESS3 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 3. |
| ADDRESS4 | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal address line 4. |
| CITY | varchar(60) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal city/locality. |
| STATE | char(5) | yes | normalized-business-data | personal-or-client-confidential | retained | Mapped state/province code; fixed-width in vendor addresses and variable-width in client addresses. |
| ZIP | varchar(50) | yes | normalized-business-data | personal-or-client-confidential | retained | Postal code, retaining leading zeros. |
| VENDOR_PHONE | varchar(20) | yes | normalized-business-data | personal-or-client-confidential | retained | Vendor address telephone number. |
| TEST_NAME_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_NAME_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production name uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| TEST_ADDRESS_UNO | int | yes | expert-test-mapping | client-confidential | retained | Expert test address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| PROD_ADDRESS_UNO | int | yes | expert-production-mapping | client-confidential | retained | Expert production address uno mapping. ID/code semantics follow the corresponding loader field; do not copy across environments. |
| CREATE_DATE | datetime2(7) | no | control | client-confidential | retained | Staging creation timestamp supplied by importer; no default or timezone convention is declared. |
| MODIFIED_DATE | datetime2(7) | no | control | client-confidential | retained | Staging modification timestamp; no automatic update or default is declared. |
| BATCH | int | yes | control | client-confidential | retained | Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value. |
| COUNTRY_CODE | varchar(5) | yes | normalized-business-data | personal-or-client-confidential | retained | Mapped vendor-address country code. |
| ADDRESS_TYPE | varchar(5) | yes | normalized-business-data | client-confidential | retained | Address purpose code; MAIN is used for client defaults, 1099 then REMIT for preferred vendor addresses. |
