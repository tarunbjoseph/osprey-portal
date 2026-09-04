/**
 * Merge the full per-control detail from the AGSC v1.0 playbook into the
 * control catalogue.
 *
 * AGSC is published as an open standard — its cover states "free to adopt and
 * adapt" and its closing section confirms organisations may adopt, adapt and
 * operationalise the controls — so its text is reproduced here with the
 * attribution the publisher asks for. See NOTICE.md.
 *
 * Adds four fields the first pass left out: what each control applies to, its
 * key requirements, its review cadence, and its own per-control mappings into
 * the public frameworks. That last one matters: it lets a reader see where
 * OSPREY's mapping agrees with AGSC's and where it deliberately differs.
 *
 * Input is the JSON produced by the extraction pass; the YAML it writes is the
 * source of truth from then on.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { load as parseYaml, dump as toYaml } from 'js-yaml';

const DATA = new URL('../src/data/controls/', import.meta.url).pathname;
const src = JSON.parse(readFileSync(process.argv[2] ?? '/tmp/agsc.json', 'utf8'));

/**
 * Corrections found while validating AGSC's own external references against
 * the live frameworks. Recorded rather than silently applied: the published
 * mapping is what the reader sees, with the discrepancy noted beside it.
 */
const CORRECTIONS = {
  atlas: [
    {
      match: /AML\.TA0015 Command and Control/,
      note: 'In the current MITRE ATLAS distribution, Command and Control is AML.TA0014; AML.TA0015 is Lateral Movement. Reported upstream.',
    },
    {
      match: /AML\.T0053 Compromise LLM Plugins/,
      note: 'The identifier is current, but ATLAS now names AML.T0053 "AI Agent Tool Invocation".',
    },
  ],
};

const findCorrection = (key, value) =>
  (CORRECTIONS[key] ?? []).find((c) => c.match.test(value))?.note;

let enriched = 0;
for (const [code, rec] of Object.entries(src)) {
  const slug = `agsc-${code.toLowerCase()}`;
  const path = `${DATA}${slug}.yaml`;

  let doc;
  try {
    doc = parseYaml(readFileSync(path, 'utf8'));
  } catch {
    console.warn(`skip ${code}: no catalogue entry`);
    continue;
  }

  doc.appliesTo = rec.appliesTo;
  doc.requirements = rec.requirements;
  doc.evidence = rec.evidenceFull.length ? rec.evidenceFull : doc.evidence;
  doc.reviewCadence = rec.reviewCadence;
  doc.example = rec.example;
  doc.origin = rec.origin;
  doc.applicability = rec.applicability;

  // Per-control framework mappings, each with an optional correction note.
  doc.mappings = Object.entries(rec.mappings)
    .filter(([, v]) => v && !/^N\/A$/i.test(v))
    .map(([framework, value]) => {
      const note = findCorrection(framework, value);
      return note ? { framework, value, note } : { framework, value };
    });

  writeFileSync(
    path,
    toYaml(doc, { lineWidth: 100, noRefs: true, quotingType: '"', forceQuotes: false }),
    'utf8',
  );
  enriched += 1;
}

console.log(`enriched ${enriched} AGSC controls`);
