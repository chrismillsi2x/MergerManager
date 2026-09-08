// Generates a compatibility baseline from an authorized private export.
// Reads metadata only. Does not connect to or execute against a database.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export const tables = ['NAMES','CLIENTS','ADDRESSES','CONTACTS','MATTERS','BILLGROUPS','ASSIGNMENTS','NOTES','RATES','VENDORS','VENDORADDRESSES'];

const meanings = {
  ID: 'Staging row identity; join key in the legacy procedures. Identity is not a declared primary key.',
  COMPANY_CODE: 'Source-firm/company scope discriminator supplied to legacy procedures; not a unique project or run ID.',
  BATCH: 'Legacy extraction/conversion batch within company scope. Most promotion procedures do not filter this value.',
  PROMOTE: 'Legacy eligibility flag; promotion predicates generally require 1. NULL is not implicitly approved.',
  SOURCE_ID: 'Identifier of this entity in the source PMS; retain its original representation within the declared SQL type.',
  SOURCE_CODE: 'Original source client code before mapping to target-firm codes.',
  SOURCE_SYSTEM: 'Source PMS identification/provenance label.',
  SOURCE_TYPE: 'Name-owner discriminator; current procedures use CL for clients, CC for contacts, VN for vendors.',
  SOURCE_EMPLOYEE: 'Original source employee identifier for personnel mapping.',
  SOURCE_MATTER_CODE: 'Original source matter code before target code assignment.',
  SOURCE_MATT_TYPE_CODE: 'Original source matter-type code for target code crosswalk.',
  SOURCE_MATTER_ID: 'Source matter identifier retained for provenance/crosswalk.',
  SOURCE_CLIENT_ID_OBS: 'Legacy source client identifier; retained pending caller and mapping review.',
  SOURCE_NAME_ID_OBS: 'Legacy source name identifier; retained pending caller and mapping review.',
  VENDOR_SOURCE_ID: 'Source vendor key, joined to VENDORS.SOURCE_ID within company/batch scope; not VENDORS.ID.',
  CREATE_DATE: 'Staging creation timestamp supplied by importer; no default or timezone convention is declared.',
  MODIFIED_DATE: 'Staging modification timestamp; no automatic update or default is declared.',
  NAME_TYPE: 'Person/organization discriminator; current procedures create person detail for P; full code domain requires confirmation.',
  SORT_BY_NAME: 'Name sort key for Expert HBM_NAME.NAME_SORT.',
  DISPLAY_NAME: 'Display name of the party/vendor.',
  FIRST_NAME: 'Given name component.', MIDDLE_NAME: 'Middle name component.', LAST_NAME: 'Family name component.',
  CLIENT_NAME: 'Short client display name.', CONTACT_NAME: 'Contact display name.',
  CLIENT_INACTIVE: 'Staged client inactive flag; not proof of application by CONVERTCLIENTS, which inserts a constant inactive value.',
  CLIENT_STATUS: 'Mapped target client status code.', STATUS_CODE: 'Mapped target matter status code.',
  INACTIVE: 'Staged matter inactive flag; null/value handling must follow the selected loader.',
  OPEN_DATE: 'Business opening date for this client or matter.', CLOSE_DATE: 'Business closing date for this client or matter.',
  OFFC: 'Mapped target office code.', DEPT: 'Mapped target department code.',
  PROF: 'Legacy target PROF organizational code; business meaning and valid values require target-firm confirmation.',
  SEQUENCE_NO: 'Source address ordering/sequence metadata; preferred-address policy requires confirmation.',
  ATTENTION: 'Address attention/addressee text.', ADDRESS1: 'Postal address line 1.', ADDRESS2: 'Postal address line 2.',
  ADDRESS3: 'Postal address line 3.', ADDRESS4: 'Postal address line 4.', CITY: 'Postal city/locality.',
  STATE: 'Mapped state/province code; fixed-width in vendor addresses and variable-width in client addresses.',
  COUNTRY: 'Staged country code; CONVERTADDRESSES currently writes an empty target country code.',
  COUNTRY_CODE: 'Mapped vendor-address country code.', ZIP: 'Postal code, retaining leading zeros.',
  ADDRESS_TYPE: 'Address purpose code; MAIN is used for client defaults, 1099 then REMIT for preferred vendor addresses.',
  PHONE_NUMBER: 'Primary telephone number.', PHONE_NUMBER2: 'Secondary telephone number.',
  FAX_NUMBER: 'Fax number.', EMAIL: 'Contact email address.',
  EMAIL_DONOTUSE: 'Legacy address email field explicitly marked do-not-use; preserve physically pending retirement approval.',
  VENDOR_PHONE: 'Vendor address telephone number.',
  BILLGRP_CODE: 'Target bill-group code.', BILL_DELIVERY_METHOD: 'Mapped bill distribution/delivery method.',
  MATT_TYPE_CODE: 'Mapped target matter-type code.', LONG_MATT_NAME: 'Long matter description.', MATTER_NAME: 'Short matter name.',
  MATTER_NUMBER: 'Numeric matter-number component; relationship to string matter code requires loader validation.',
  BILL_EMPL_UNO: 'Unqualified legacy billing employee identifier; intended target environment needs confirmation.',
  RESP_EMPL_UNO: 'Unqualified legacy responsible employee identifier; intended target environment needs confirmation.',
  ASSIGNMENT_CODE: 'Mapped participation category for TBM_CLMAT_PART.PART_CAT_CODE.',
  ASSIGNMENT_PERCENT: 'Participation percentage. Precision is numeric(10,2); valid range/split-total policy is a business validation.',
  EFF_DATE: 'Business effective date of the assignment or rate.', EXP_DATE: 'Rate expiry date.',
  TXT: 'Client/matter note content; may contain sensitive free text. Text aggregation policy is unresolved.',
  RANK_CODE: 'Personnel rank/category used by the rate.', RATE_LEVEL: 'Rate-level selector; valid target values require confirmation.',
  AMOUNT: 'Rate amount in the legacy numeric(10,2) representation. Currency is not recorded in this table.',
  FEIN: 'Vendor tax identifier; restricted data, never diagnostic output.',
  TEN99TYPE: 'Vendor tax-reporting classification code.', ONECHECK: 'Vendor check-consolidation flag; allowed codes require confirmation.',
  PAYMENT_TERM: 'Mapped vendor payment-term code.', VENDOR_ID: 'Target vendor business code, distinct from source ID and allocated vendor UNO.',
};
const relationships = { NAME_ID: 'NAMES.ID', CLIENT_ID: 'CLIENTS.ID', CONTACT_ID: 'CONTACTS.ID',
  MATTER_ID: 'MATTERS.ID', BILLGRP_ID: 'BILLGROUPS.ID', ADDRESS_ID: 'ADDRESSES.ID' };
function meaning(column) {
  if (meanings[column]) return meanings[column];
  if (relationships[column]) return `Logical staging reference to ${relationships[column]}; not enforced by a foreign key in this export.`;
  const m = column.match(/^(TEST|PROD)_(.+)$/);
  if (m) {
    const subject = m[2].replace(/_OBS$/, '').replaceAll('_', ' ').toLowerCase();
    return `${m[1] === 'TEST' ? 'Expert test' : 'Expert production'} ${subject} mapping. ID/code semantics follow the corresponding loader field; do not copy across environments.${column.endsWith('_OBS') ? ' Legacy OBS designation does not authorize removal; some OBS values remain loader inputs.' : ''}`;
  }
  throw new Error('Missing semantics: ' + column);
}
function role(column) {
  if (column === 'ID') return 'staging-identity';
  if (column.startsWith('SOURCE_') || column === 'VENDOR_SOURCE_ID') return 'source-provenance';
  if (column.startsWith('TEST_')) return 'expert-test-mapping';
  if (column.startsWith('PROD_')) return 'expert-production-mapping';
  if (relationships[column]) return 'staging-relationship';
  if (['COMPANY_CODE','BATCH','PROMOTE','CREATE_DATE','MODIFIED_DATE'].includes(column)) return 'control';
  return 'normalized-business-data';
}
function sensitivity(column) {
  if (['FEIN','TXT'].includes(column)) return 'restricted';
  if (/NAME|ADDRESS[1-4]|ATTENTION|CITY|STATE|COUNTRY|ZIP|PHONE|FAX|EMAIL/.test(column) && !/(_ID|_UNO)(_OBS)?$/.test(column)) return 'personal-or-client-confidential';
  return 'client-confidential';
}
export function extract(sql) {
  return tables.map(name => {
    const block = sql.match(new RegExp('^CREATE TABLE \\[dbo\\]\\.\\[' + name + '\\]\\([\\s\\S]*?^GO\\r?$', 'm'));
    if (!block) throw new Error('Missing table: ' + name);
    const definitions = block[0].split(/\r?\n/).filter(l => /^\s*\[/.test(l));
    const columns = definitions.map((line, ordinal) => {
      const m = line.match(/^\s*\[([^\]]+)\]\s+\[([^\]]+)\](\([^)]*\))?\s*(IDENTITY\((-?\d+),\s*(-?\d+)\)\s*)?(NOT NULL|NULL),?\s*$/);
      if (!m) throw new Error('Unsupported column definition in ' + name);
      const column = m[1];
      return { ordinal: ordinal + 1, name: column, sqlType: m[2] + (m[3]?.replaceAll(' ', '') ?? ''),
        nullable: m[7] === 'NULL', identity: m[4] ? { seed: Number(m[5]), increment: Number(m[6]) } : null,
        default: null, semantics: meaning(column), role: role(column), sensitivity: sensitivity(column),
        retirementStatus: /_OBS$|DONOTUSE/.test(column) ? 'retained-legacy-review' : 'retained',
        logicalReference: relationships[column] ?? (column === 'VENDOR_SOURCE_ID' ? 'VENDORS.SOURCE_ID' : null) };
    });
    // Fail rather than quietly discard constraints not handled by this baseline extractor.
    if (/\b(CONSTRAINT|PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK|DEFAULT)\b/i.test(block[0]) ||
        new RegExp('ALTER TABLE \\[dbo\\]\\.\\[' + name + '\\]', 'i').test(sql)) {
      throw new Error('Constraint review required: ' + name);
    }
    return { schema: 'dbo', name, primaryKey: null, foreignKeys: [], columns };
  });
}
export function ddl(contract) {
  return ['-- MergerManager staging compatibility contract ' + contract.contractVersion,
    '-- Fresh, explicitly selected empty conversion database only. Not an upgrade migration.',
    '-- Preserves the exported physical interface; no new keys, defaults, or constraints.',
    'SET ANSI_NULLS ON;', 'SET QUOTED_IDENTIFIER ON;', 'GO', '',
    ...contract.tables.map(t => `CREATE TABLE [${t.schema}].[${t.name}](\n` + t.columns.map(c =>
      `    [${c.name}] ${c.sqlType.replace(/^([a-z0-9]+)/, '[$1]')}${c.identity ? ` IDENTITY(${c.identity.seed},${c.identity.increment})` : ''} ${c.nullable ? 'NULL' : 'NOT NULL'}`
    ).join(',\n') + '\n);\nGO\n')].join('\n');
}
export function dictionary(contract) {
  const lines = ['# Staging data dictionary v' + contract.contractVersion, '',
    'Profile: `dbo-v1`. [Contract policy and limitations](README.md). All eleven tables remain in `dbo`.', '',
    'Types, column order, nullability and identity come from the original export. Semantics describe intended roles inferred from names and the procedure review; unconfirmed business meanings are explicit.', '',
    'Every field is at least client-confidential. Restricted fields require protected audit payloads. Classifications are proposed handling defaults, not claims about the contents of any particular database.', '',
    'No defaults, primary keys, foreign keys, or uniqueness constraints are declared for these tables. Logical references below are validation requirements, not added SQL constraints.', ''];
  for (const t of contract.tables) {
    lines.push(`## ${t.name}`, '', '| Column | SQL type | Nullable | Role | Sensitivity | Retirement | Semantics / relationship |', '| --- | --- | --- | --- | --- | --- | --- |');
    for (const c of t.columns) lines.push(`| ${c.name} | ${c.sqlType}${c.identity ? ' IDENTITY(1,1)' : ''} | ${c.nullable ? 'yes' : 'no'} | ${c.role} | ${c.sensitivity} | ${c.retirementStatus} | ${c.semantics}${c.logicalReference ? ' Reference: ' + c.logicalReference + '.' : ''} |`);
    lines.push('');
  }
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [source, output] = process.argv.slice(2);
  if (!source || !output) throw new Error('Usage: node scripts/staging-contract.mjs <private-export> <existing-output-directory>');
  const sql = readFileSync(source, 'utf8');
  const contract = { contractVersion: '1.0.0', profile: 'dbo-v1', status: 'candidate',
    sourceSha256: createHash('sha256').update(sql, 'utf8').digest('hex'), tables: extract(sql) };
  writeFileSync(resolve(output, 'contract.json'), JSON.stringify(contract, null, 2) + '\n');
  writeFileSync(resolve(output, 'schema.sql'), ddl(contract));
  writeFileSync(resolve(output, 'data-dictionary.md'), dictionary(contract));
  console.log(`${contract.tables.length} tables, ${contract.tables.reduce((n,t) => n + t.columns.length,0)} columns; no SQL executed.`);
}
