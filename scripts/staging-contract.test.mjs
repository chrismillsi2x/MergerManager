import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tables, extract, ddl, dictionary } from './staging-contract.mjs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const contract = JSON.parse(read('../contracts/staging/v1/contract.json'));
const inventory = JSON.parse(read('../docs/architecture/procedure-inventory.json'));
const column = (table, name) => contract.tables.find(t => t.name === table).columns.find(c => c.name === name);

test('v1 documents all eleven tables and 248 columns without inventing constraints', () => {
  assert.equal(contract.contractVersion, '1.0.0');
  assert.equal(contract.status, 'candidate');
  assert.deepEqual(contract.tables.map(t => t.name), tables);
  assert.equal(contract.tables.reduce((n, t) => n + t.columns.length, 0), 248);
  for (const table of contract.tables) {
    assert.equal(table.primaryKey, null);
    assert.deepEqual(table.foreignKeys, []);
    assert.equal(new Set(table.columns.map(c => c.name)).size, table.columns.length);
    table.columns.forEach((c, i) => {
      assert.equal(c.ordinal, i + 1);
      for (const key of ['sqlType', 'semantics', 'role', 'sensitivity', 'retirementStatus']) assert.ok(c[key], `${table.name}.${c.name}: ${key}`);
      assert.equal(typeof c.nullable, 'boolean');
      assert.equal(c.default, null);
    });
    assert.deepEqual(column(table.name, 'ID').identity, { seed: 1, increment: 1 });
    assert.equal(column(table.name, 'ID').nullable, false);
  }
});

test('generated SQL and dictionary reproduce the checked-in contract', () => {
  assert.equal(read('../contracts/staging/v1/schema.sql'), ddl(contract));
  assert.equal(read('../contracts/staging/v1/data-dictionary.md'), dictionary(contract));
  assert.deepEqual(extract(ddl(contract)), contract.tables);
});

test('all inventoried local staging write columns exist (not a read/binding test)', () => {
  for (const procedure of inventory.procedures) {
    for (const write of procedure.writes.filter(w => w.object.startsWith('LOCAL.dbo.'))) {
      const table = write.object.split('.').at(-1);
      assert.ok(tables.includes(table), `${procedure.name}: ${table}`);
      for (const name of write.columns) assert.ok(column(table, name), `${procedure.name}: ${table}.${name}`);
    }
  }
});

test('legacy fields and known OG exception remain explicit', () => {
  assert.equal(column('NAMES', 'SOURCE'), undefined);
  assert.ok(column('NAMES', 'SOURCE_TYPE'));
  assert.equal(column('VENDORS', 'FEIN').sensitivity, 'restricted');
  assert.equal(column('NOTES', 'TXT').sensitivity, 'restricted');
  for (const c of contract.tables.flatMap(t => t.columns).filter(c => /_OBS$|DONOTUSE/.test(c.name))) {
    assert.equal(c.retirementStatus, 'retained-legacy-review');
  }
  assert.equal(column('VENDORADDRESSES', 'VENDOR_SOURCE_ID').logicalReference, 'VENDORS.SOURCE_ID');
});

test('extractor rejects missing tables, unknown semantics and added constraints', () => {
  const sql = ddl(contract);
  assert.throws(() => extract(sql.replace('CREATE TABLE [dbo].[NAMES](', 'CREATE TABLE [dbo].[OTHER](')), /Missing table/);
  assert.throws(() => extract(sql.replace('[SOURCE_TYPE]', '[UNKNOWN_FIELD]')), /Missing semantics/);
  assert.throws(() => extract(sql + '\nALTER TABLE [dbo].[NAMES] ADD CONSTRAINT test UNIQUE(ID);'), /Constraint review/);
  assert.throws(() => extract(sql.replace('[ID] [int] IDENTITY(1,1) NOT NULL', '[ID] [int] IDENTITY(1,1) NOT NULL DEFAULT 1')), /Unsupported column/);
});

test('private export reproduces every column and source fingerprint', { skip: !process.env.CONVERSION_SOURCE_SQL }, () => {
  const sql = readFileSync(process.env.CONVERSION_SOURCE_SQL, 'utf8');
  assert.equal(createHash('sha256').update(sql, 'utf8').digest('hex'), contract.sourceSha256);
  assert.deepEqual(extract(sql), contract.tables);
});
