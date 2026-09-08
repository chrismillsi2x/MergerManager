// Offline lexical inventory for the supplied SQL Server export. Never executes SQL.
// This is deliberately a bounded extractor, not a SQL parser or safety validator.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function tokens(sql) {
  const out = [];
  let i = 0, line = 1;
  const advance = () => { if (sql[i++] === '\n') line++; };
  while (i < sql.length) {
    if (/\s/.test(sql[i])) { advance(); continue; }
    if (sql.startsWith('--', i)) { while (i < sql.length && sql[i] !== '\n') advance(); continue; }
    if (sql.startsWith('/*', i)) {
      let depth = 1; i += 2;
      while (i < sql.length && depth) {
        if (sql.startsWith('/*', i)) { depth++; i += 2; }
        else if (sql.startsWith('*/', i)) { depth--; i += 2; }
        else advance();
      }
      if (depth) throw new Error('Unterminated comment');
      continue;
    }
    const start = i, at = line;
    let kind = 'symbol';
    if (sql[i] === "'") {
      kind = 'string'; advance();
      let closed = false;
      while (i < sql.length) {
        if (sql[i] === "'") {
          advance();
          if (sql[i] === "'") { advance(); continue; }
          closed = true; break;
        }
        advance();
      }
      if (!closed) throw new Error('Unterminated string');
    } else if (sql[i] === '[') {
      kind = 'identifier'; advance();
      while (i < sql.length) {
        if (sql[i] === ']') { advance(); if (sql[i] === ']') { advance(); continue; } break; }
        advance();
      }
    } else if (/[A-Za-z_@#]/.test(sql[i])) {
      kind = 'word'; while (i < sql.length && /[A-Za-z0-9_@$#]/.test(sql[i])) advance();
    } else advance();
    const raw = sql.slice(start, i);
    out.push({ value: kind === 'identifier' ? raw.slice(1, -1).replaceAll(']]', ']') : raw, kind, line: at });
  }
  return out;
}
const upper = t => t?.value.toUpperCase();
function objectAt(ts, i) {
  if (!['word', 'identifier'].includes(ts[i]?.kind) || ts[i].value.startsWith('@')) return null;
  const parts = [ts[i++].value];
  while (ts[i]?.value === '.' && ['word', 'identifier'].includes(ts[i + 1]?.kind)) {
    parts.push(ts[i + 1].value); i += 2;
  }
  return { name: parts.join('.').toUpperCase(), next: i };
}
const environments = new Map([
  ['EXPERT_NEWTEST_MNA.DBO', 'TEST.dbo'],
  ['EXPERT_TEST.DBO', 'LEGACY_TEST.dbo'],
  ['SFADRNTSQL.EXPERT_PROD.DBO', 'PROD.dbo'],
  ['SFADRNTTSTSQL.CONVERSIONSOURCE.DBO', 'REMOTE_STAGE.dbo'],
]);
function display(name) {
  for (const [prefix, role] of environments) if (name.startsWith(prefix + '.')) return role + name.slice(prefix.length);
  if (!name.includes('.')) return 'LOCAL.dbo.' + name;
  if (name.startsWith('DBO.')) return 'LOCAL.dbo.' + name.slice(4);
  throw new Error('Unclassified qualified object: ' + name);
}
export function inventory(sql) {
  const ts = tokens(sql), procedures = [];
  for (let i = 0; i < ts.length; i++) {
    if (upper(ts[i]) !== 'CREATE' || upper(ts[i + 1]) !== 'PROCEDURE') continue;
    const obj = objectAt(ts, i + 2);
    let end = obj.next;
    while (end < ts.length && !(ts[end].kind === 'word' && upper(ts[end]) === 'GO')) end++;
    const p = ts.slice(obj.next, end);
    const name = obj.name.split('.').at(-1);
    if (!/^(CONVERT|PROMOTE)/.test(name) && name !== 'RESETCLIENTNEXTMATTERNUMBER') continue;
    const ctes = new Set();
    for (let j = 0; j < p.length; j++) {
      if (upper(p[j]) === 'WITH' && objectAt(p, j + 1)) ctes.add(objectAt(p, j + 1).name);
    }
    const references = [];
    for (let j = 0; j < p.length; j++) {
      if (!['FROM', 'JOIN'].includes(upper(p[j]))) continue;
      const ref = objectAt(p, j + 1);
      if (ref) references.push({ ...ref, index: j, line: p[j].line, alias: upper(p[ref.next]) === 'AS' ? upper(p[ref.next + 1]) : upper(p[ref.next]) });
    }
    const reads = references.filter(r => !ctes.has(r.name)).map(r => ({ object: display(r.name), line: r.line }));
    const writes = [], calls = [], controls = [], dynamicSql = [];
    for (let j = 0; j < p.length; j++) {
      const op = upper(p[j]);
      if (['INSERT', 'UPDATE', 'DELETE', 'MERGE', 'TRUNCATE'].includes(op) && p[j].kind === 'word') {
        let targetIndex = j + 1;
        if (['INTO', 'FROM', 'TABLE'].includes(upper(p[targetIndex]))) targetIndex++;
        const target = objectAt(p, targetIndex);
        if (!target) throw new Error(`${name}:${p[j].line}: unresolved mutation`);
        let stop = j + 1;
        while (stop < p.length && !['INSERT', 'UPDATE', 'DELETE', 'MERGE', 'TRUNCATE', 'EXEC', 'EXECUTE'].includes(upper(p[stop]))) stop++;
        const aliases = references.filter(r => r.index > j && r.index < stop && r.alias === target.name);
        const resolved = aliases[0]?.name ?? target.name;
        if (ctes.has(resolved)) throw new Error('CTE mutation needs manual resolution');
        const columns = [];
        if (op === 'UPDATE') {
          const from = p.findIndex((t, k) => k > j && upper(t) === 'FROM');
          for (let k = target.next; k < (from < 0 ? stop : from); k++) {
            if (p[k + 1]?.value === '=') columns.push(upper(p[k]));
          }
        }
        writes.push({ operation: op, object: display(resolved), line: p[j].line, ...(columns.length ? { columns } : {}) });
      }
      if (['EXEC', 'EXECUTE'].includes(op)) {
        const target = objectAt(p, j + 1);
        if (!target || /SP_EXECUTESQL$/.test(target.name)) { dynamicSql.push(p[j].line); continue; }
        let allocationTable = null;
        for (let k = target.next; k < p.length && p[k].line === p[j].line; k++) {
          if (upper(p[k]) === '@TABLE' && p[k + 1]?.value === '=' && p[k + 2]?.kind === 'string') allocationTable = p[k + 2].value.slice(1, -1);
        }
        calls.push({ object: display(target.name), line: p[j].line, allocationTable });
      }
      if ((op === 'SET' && ['XACT_ABORT', 'NOCOUNT'].includes(upper(p[j + 1]))) ||
          (op === 'BEGIN' && ['TRAN', 'TRANSACTION', 'TRY', 'CATCH'].includes(upper(p[j + 1]))) ||
          ['COMMIT', 'ROLLBACK'].includes(op)) {
        const suffix = ['COMMIT', 'ROLLBACK'].includes(op)
          ? (['TRAN', 'TRANSACTION'].includes(upper(p[j + 1])) ? upper(p[j + 1]) : null)
          : upper(p[j + 1]);
        controls.push({ operation: [op, suffix, op === 'SET' ? upper(p[j + 2]) : null].filter(Boolean).join(' '), line: p[j].line });
      }
    }
    procedures.push({ name, startLine: ts[i].line, endLine: ts[end]?.line ?? ts.at(-1).line,
      reads, writes, calls, dynamicSql, controls });
    i = end;
  }
  return { sourceSha256: createHash('sha256').update(sql, 'utf8').digest('hex'), procedures };
}
export function markdown(data) {
  const lines = ['# Procedure operation inventory', '',
    'Generated by `scripts/inventory-procedures.mjs`; see [review and decisions](procedure-dependency-map.md).', '',
    `Source UTF-8 SHA-256: \`${data.sourceSha256}\`. Line numbers refer to the original supplied export.`, '',
    'Role aliases remove host/database names: LOCAL = conversion DB; TEST = primary Expert test; LEGACY_TEST = alternate Expert test; PROD = linked Expert production; REMOTE_STAGE = linked conversion DB. These roles are distinct.', '',
    'READ means a FROM/JOIN reference, including duplicate guards and UPDATE joins. CTEs are excluded; their underlying tables remain. Calls may have additional internal effects absent from the export.', ''];
  for (const p of data.procedures) {
    lines.push(`## ${p.name}`, '', `Export lines ${p.startLine}–${p.endLine}.`, '', '| Kind | Object / action | Export lines |', '| --- | --- | --- |');
    const grouped = new Map();
    for (const r of p.reads) { if (!grouped.has(r.object)) grouped.set(r.object, []); grouped.get(r.object).push(r.line); }
    for (const [obj, refs] of [...grouped].sort()) lines.push(`| READ | \`${obj}\` | ${[...new Set(refs)].join(', ')} |`);
    for (const w of p.writes) lines.push(`| ${w.operation} | \`${w.object}\`${w.columns ? ': ' + w.columns.map(c => '\`' + c + '\`').join(', ') : ''} | ${w.line} |`);
    for (const c of p.calls) lines.push(`| EXEC | \`${c.object}\`; allocation table \`${c.allocationTable ?? 'unresolved'}\` | ${c.line} |`);
    for (const c of p.controls) lines.push(`| CONTROL | \`${c.operation}\` | ${c.line} |`);
    lines.push('', `Dynamic SQL in this procedure body: ${p.dynamicSql.length ? p.dynamicSql.join(', ') : 'none detected'}.`, '');
  }
  return lines.join('\n');
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [source, destination, report] = process.argv.slice(2);
  if (!source || !destination || !report) throw new Error('Usage: node scripts/inventory-procedures.mjs <private-export.sql> <inventory.json> <report.md>');
  const data = inventory(readFileSync(source, 'utf8'));
  writeFileSync(destination, JSON.stringify(data, null, 2) + '\n');
  writeFileSync(report, markdown(data));
  console.log(`Inventoried ${data.procedures.length} procedures; SQL was not executed.`);
}
