#!/usr/bin/env node
/**
 * Anchor validator.
 *
 * Run: npm run validate:anchors  [-- --framework owasp-llm]
 *
 * Reports every framework anchor in the threat register, grouped by framework,
 * with its verification state and the date it was last checked. This is the
 * work list when a framework ships a new release: bump the framework file, run
 * this, and you have exactly the set of identifiers that need re-confirming.
 *
 * Exits non-zero on structural problems — an anchor pointing at a framework
 * that does not exist, a control code with no catalogue entry — so it can run
 * in CI. Anchors merely marked `pending` are reported but never fail the build:
 * pending is an honest state, not an error.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';
import { join } from 'node:path';

const DATA = new URL('../src/data/', import.meta.url).pathname;
const arg = (flag) => {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const only = arg('--framework');

const load = (dir) => {
  const p = join(DATA, dir);
  if (!existsSync(p)) return [];
  return readdirSync(p)
    .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
    .map((f) => ({ file: `${dir}/${f}`, data: parseYaml(readFileSync(join(p, f), 'utf8')) ?? {} }));
};

const frameworks = load('frameworks');
const controls = load('controls');
const threats = load('threats');

const fwIds = new Set(frameworks.map((f) => f.file.split('/')[1].replace(/\.ya?ml$/, '')));
const fwMeta = Object.fromEntries(
  frameworks.map((f) => [f.file.split('/')[1].replace(/\.ya?ml$/, ''), f.data]),
);
const controlCodes = new Set(controls.map((c) => `${c.data.framework}:${c.data.code}`));

const errors = [];
const rows = [];

for (const t of threats) {
  const anchors = Array.isArray(t.data.anchors) ? t.data.anchors : [];
  if (anchors.length === 0) {
    errors.push(`${t.file}: no framework anchors — every threat must anchor to at least one control`);
  }
  for (const a of anchors) {
    if (!a || typeof a !== 'object') continue;
    if (!fwIds.has(a.framework)) {
      errors.push(`${t.file}: anchor references unknown framework "${a.framework}"`);
      continue;
    }
    // Control-bearing frameworks should resolve to a catalogue entry, so a
    // renamed control surfaces here instead of as a dead link on the site.
    if ((a.framework === 'agsc' || a.framework === 'adg') && a.verification !== 'gap') {
      if (!controlCodes.has(`${a.framework}:${a.id}`)) {
        errors.push(`${t.file}: ${a.framework} control "${a.id}" has no catalogue entry in src/data/controls/`);
      }
    }
    rows.push({
      framework: a.framework,
      id: a.id,
      label: a.label ?? '',
      verification: a.verification ?? 'pending',
      checked: a.checked ?? '',
      threat: t.data.code,
    });
  }
}

const filtered = only ? rows.filter((r) => r.framework === only) : rows;
const byFramework = new Map();
for (const r of filtered) {
  if (!byFramework.has(r.framework)) byFramework.set(r.framework, []);
  byFramework.get(r.framework).push(r);
}

const C = { dim: '\x1b[2m', b: '\x1b[1m', g: '\x1b[32m', y: '\x1b[33m', m: '\x1b[35m', r: '\x1b[31m', x: '\x1b[0m' };
const mark = { verified: `${C.g}ok${C.x}`, pending: `${C.y}check${C.x}`, gap: `${C.m}gap${C.x}`, superseded: `${C.r}stale${C.x}` };

console.log(`\n${C.b}OSPREY anchor validation${C.x}`);
console.log(`${C.dim}${threats.length} threats · ${rows.length} anchors · ${frameworks.length} frameworks${C.x}\n`);

for (const [fid, list] of [...byFramework.entries()].sort(
  (a, b) => (fwMeta[a[0]]?.order ?? 99) - (fwMeta[b[0]]?.order ?? 99),
)) {
  const meta = fwMeta[fid] ?? {};
  const counts = list.reduce((acc, r) => ((acc[r.verification] = (acc[r.verification] ?? 0) + 1), acc), {});
  const summary = Object.entries(counts).map(([k, n]) => `${n} ${k}`).join(', ');

  console.log(`${C.b}${meta.shortName ?? fid}${C.x} ${C.dim}${meta.version ?? ''} · validated ${meta.validated ?? 'never'}${C.x}`);
  console.log(`  ${C.dim}${list.length} anchors — ${summary}${C.x}`);
  if (meta.supersededBy) {
    console.log(`  ${C.r}! superseded by ${meta.supersededBy} — every anchor below needs re-checking${C.x}`);
  }

  const needsWork = list.filter((r) => r.verification !== 'verified');
  for (const r of needsWork) {
    console.log(`    ${mark[r.verification] ?? r.verification}  ${r.id.padEnd(22)} ${C.dim}${r.threat}${C.x} ${r.label}`);
  }
  console.log('');
}

if (errors.length) {
  console.error(`${C.r}${C.b}${errors.length} structural problem${errors.length === 1 ? '' : 's'}${C.x}`);
  for (const e of errors) console.error(`  ${C.r}✗${C.x} ${e}`);
  console.error('');
  process.exit(1);
}

const pending = filtered.filter((r) => r.verification === 'pending').length;
const gaps = filtered.filter((r) => r.verification === 'gap').length;
console.log(`${C.g}✓${C.x} All anchors resolve to a known framework and control.`);
if (pending) console.log(`${C.y}·${C.x} ${pending} identifier${pending === 1 ? '' : 's'} pending re-check before external citation.`);
if (gaps) console.log(`${C.m}·${C.x} ${gaps} recorded gap${gaps === 1 ? '' : 's'} where no published technique models the behaviour.`);
console.log('');
