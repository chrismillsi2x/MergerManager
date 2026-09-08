import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inventory, markdown } from './inventory-procedures.mjs';

test('comments, escaped strings and CTEs do not invent physical dependencies', () => {
  const result = inventory(`CREATE PROCEDURE dbo.CONVERTEXAMPLE AS
/* UPDATE MATTERS SET x=1; /* JOIN NAMES */ */
-- INSERT INTO ADDRESSES SELECT * FROM NAMES
SELECT 'GO', 'JOIN VENDORS; it''s text';
;WITH Keys AS (SELECT ID FROM CLIENTS)
UPDATE c SET TEST_CLIENT_UNO = k.ID
FROM CLIENTS AS c JOIN Keys k ON k.ID=c.ID
GO`).procedures[0];
  assert.deepEqual([...new Set(result.reads.map(r => r.object))], ['LOCAL.dbo.CLIENTS']);
  assert.deepEqual(result.writes, [{ operation: 'UPDATE', object: 'LOCAL.dbo.CLIENTS', line: 6, columns: ['TEST_CLIENT_UNO'] }]);
});

test('alias reuse is resolved separately for successive mutations', () => {
  const p = inventory(`CREATE PROCEDURE dbo.PROMOTEEXAMPLE AS
UPDATE a SET PROD_CLIENT_UNO=1 FROM CLIENTS a
UPDATE a SET ADDRESS_UNO=1 FROM SFADRNTSQL.Expert_PROD.dbo.HBM_NAME a
GO`).procedures[0];
  assert.deepEqual(p.writes.map(w => w.object), ['LOCAL.dbo.CLIENTS', 'PROD.dbo.HBM_NAME']);
});

test('key allocation, dynamic SQL and bare rollback stay distinct', () => {
  const p = inventory(`CREATE PROCEDURE dbo.PROMOTEEXAMPLE AS
EXEC Expert_NEWTEST_MnA.dbo.SP_CMSNEXTKEY_OUTPUT @table='HBM_NAME', @numKeys=1;
EXEC(@sql);
EXEC sys.sp_executesql @sql;
BEGIN TRAN
INSERT INTO SFADRNTSQL.Expert_PROD.dbo.HBM_NAME SELECT * FROM NAMES
ROLLBACK
UPDATE c SET PROD_CLIENT_UNO=1 FROM CLIENTS c
GO`).procedures[0];
  assert.equal(p.calls[0].allocationTable, 'HBM_NAME');
  assert.deepEqual(p.dynamicSql, [3, 4]);
  assert.deepEqual(p.controls.map(c => c.operation), ['BEGIN TRAN', 'ROLLBACK']);
});

const baseline = JSON.parse(readFileSync(new URL('../docs/architecture/procedure-inventory.json', import.meta.url), 'utf8'));
test('checked-in baseline covers all 22 conversion/promotion bodies and the reset helper', () => {
  assert.equal(baseline.procedures.length, 23);
  assert.equal(baseline.procedures.filter(p => p.name.startsWith('CONVERT')).length, 12);
  assert.equal(baseline.procedures.filter(p => p.name.startsWith('PROMOTE')).length, 10);
  assert.equal(baseline.procedures.flatMap(p => p.calls).length, 32);
  assert.equal(baseline.procedures.flatMap(p => p.dynamicSql).length, 0);
  const local = new Set(baseline.procedures.flatMap(p => p.reads).map(r => r.object).filter(o => o.startsWith('LOCAL.')));
  assert.equal(local.size, 11);
});
test('reviewed baseline excludes commented address/matter edges and records rollback', () => {
  const get = name => baseline.procedures.find(p => p.name === name);
  assert.deepEqual([...new Set(get('CONVERTCONTACTS').reads.filter(r => r.object.startsWith('LOCAL.')).map(r => r.object))].sort(), ['LOCAL.dbo.CLIENTS','LOCAL.dbo.CONTACTS','LOCAL.dbo.NAMES']);
  assert.equal(get('PROMOTECLIENTADDRESSES').writes.length, 2);
  assert.equal(get('PROMOTEBILLGROUPS').controls.find(c => c.operation === 'ROLLBACK').line, 7743);
  assert.ok(get('PROMOTEBILLGROUPS').reads.some(r => r.object === 'REMOTE_STAGE.dbo.MATTERS'));
  assert.ok(get('PROMOTECONTACTS').writes.some(w => w.object === 'PROD.dbo.FAUX_CXA_FOLDER_OBJECT'));
});
test('published markdown matches the machine-readable baseline', () => {
  assert.equal(readFileSync(new URL('../docs/architecture/procedure-operation-inventory.md', import.meta.url), 'utf8').replaceAll('\r\n', '\n'), markdown(baseline));
});

test('private source reproduces the baseline when supplied', { skip: !process.env.CONVERSION_SOURCE_SQL }, () => {
  const actual = inventory(readFileSync(process.env.CONVERSION_SOURCE_SQL, 'utf8'));
  assert.deepEqual(actual, baseline);
});
