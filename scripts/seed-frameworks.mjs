/**
 * One-shot seeder for the framework registry, ADG governance surfaces and the
 * AGSC + ADG control catalogues.
 *
 * The YAML it writes is the source of truth from then on — edit those files,
 * not this script. Kept in the repo as a record of how the initial catalogue
 * was assembled and as a template if a whole new framework is ever imported.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/data/', import.meta.url).pathname;

const yaml = (o, indent = 0) => {
  const pad = ' '.repeat(indent);
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (Array.isArray(v)) {
        if (v.length === 0) return `${pad}${k}: []`;
        return `${pad}${k}:\n` + v.map((item) =>
          typeof item === 'object'
            ? `${pad}  -\n` + yaml(item, indent + 4)
            : `${pad}  - ${str(item)}`,
        ).join('\n');
      }
      if (typeof v === 'object') return `${pad}${k}:\n` + yaml(v, indent + 2);
      return `${pad}${k}: ${str(v)}`;
    })
    .join('\n');
};

const str = (v) => {
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  const s = String(v);
  if (s.includes('\n')) return `>-\n${s.split('\n').map((l) => '  ' + l).join('\n')}`;
  return JSON.stringify(s);
};

const write = (dir, slug, obj) => {
  mkdirSync(join(ROOT, dir), { recursive: true });
  writeFileSync(join(ROOT, dir, `${slug}.yaml`), yaml(obj) + '\n', 'utf8');
};

/* ========================================================================
   FRAMEWORKS — the version registry
   ======================================================================== */
const VALIDATED = '2026-09-03';

const frameworks = {
  agsc: {
    name: 'Agentic Governance & Security Controls',
    shortName: 'AGSC',
    version: 'v1.0',
    released: '2026',
    validated: VALIDATED,
    publisher: 'COHUMAIN Labs & SafeAlign AI',
    url: 'https://himjoe.github.io/Agentic-governance-and-security-controls-by-COHUMAIN-Labs-and-Safealign-AI/COHUMAIN-AGSC-repo/docs/',
    citation: 'Agentic Governance & Security Controls (AGSC) v1.0, COHUMAIN Labs & SafeAlign AI, 2026.',
    role: 'internal-anchor',
    idPattern: 'SAF- / ALN- / GOV- / SEC-',
    order: 10,
    summary:
      'Twenty-five controls across four pillars — Safety, Alignment, Governance, Security — each risk-justified, testable, and mapped to public frameworks. AGSC is the primary anchor for this portal: every OSPREY threat category names the control it provides evidence for before it names any external framework. Controls carry an adoption tier (T1 foundational, T2 managed, T3 assured) that sequences implementation rather than replacing internal risk classification.',
  },
  adg: {
    name: 'AI Security and Governance Framework (Adopt. Defend. Govern.)',
    shortName: 'ADG',
    version: 'v1.0',
    released: '2026',
    validated: VALIDATED,
    publisher: 'EC-Council Global Services',
    url: 'https://www.eccouncil.org/adgframework/',
    citation: 'EC-Council Global Services, AI Security and Governance Framework (ADG) v1.0, 2026.',
    role: 'internal-anchor',
    idPattern: 'MC-',
    order: 20,
    summary:
      'An operating model that sits beneath existing standards and makes them executable. Three pillars — Adopt, Defend, Govern — scale from board to engineer. Beneath them sit nine governance surfaces where engineers instrument and attackers act, twelve minimum controls each with a named evidence artifact, three autonomy tiers, and a four-class harm taxonomy. OSPREY uses the surfaces as its coverage axis, the minimum controls as its evidence targets, and the autonomy tiers as the consequence of a detection.',
  },
  'owasp-llm': {
    name: 'OWASP Top 10 for Large Language Model Applications',
    shortName: 'OWASP LLM',
    version: '2026 v1.0',
    released: '2026',
    validated: VALIDATED,
    publisher: 'OWASP GenAI Security Project',
    url: 'https://genai.owasp.org/',
    citation: 'OWASP Top 10 for LLM Applications 2026 v1.0, OWASP GenAI Security Project.',
    role: 'external-validation',
    idPattern: 'LLM',
    order: 30,
    summary:
      'The 2026 release is the first built on incident evidence as well as practitioner vote — 7,714 real incidents scored against the community ranking. Ordering moved materially: Excessive Agency climbed to third because agentic deployments are where damage lands, Unbounded Consumption rose four places, and System Prompt Leakage was re-scoped into the broader Hidden Context Exposure. The list owns risk where the model is a component inside an application; once the model becomes an actor with tools and memory, risk moves to the Agentic Top 10.',
  },
  'owasp-asi': {
    name: 'OWASP Top 10 for Agentic Applications',
    shortName: 'OWASP ASI',
    version: '2026',
    released: '2025-12-09',
    validated: VALIDATED,
    publisher: 'OWASP GenAI Security Project',
    url: 'https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/',
    citation: 'OWASP Top 10 for Agentic Applications (ASI) 2026, OWASP GenAI Security Project, announced 9 December 2025.',
    role: 'external-validation',
    idPattern: 'ASI',
    order: 40,
    summary:
      'The agentic counterpart to the LLM Top 10, covering the risks that appear once a model can call tools, carry memory between sessions, and set consequences in motion downstream. This is the closest external list to what OSPREY actually monitors, which is why most OSPREY categories carry an ASI anchor even where the LLM anchor is indirect.',
  },
  'mitre-atlas': {
    name: 'MITRE ATLAS',
    shortName: 'MITRE ATLAS',
    version: '5.6.0',
    validated: VALIDATED,
    publisher: 'MITRE',
    url: 'https://atlas.mitre.org/',
    citation: 'MITRE ATLAS (Adversarial Threat Landscape for AI Systems), distribution reporting version 5.6.0.',
    role: 'external-validation',
    idPattern: 'AML.T / AML.TA',
    order: 50,
    summary:
      'The adversarial-ML counterpart to ATT&CK: sixteen tactics and a growing technique catalogue, with recent releases adding heavily to agent, tool and supply-chain coverage. Note that ATLAS ships under two version schemes — the primary distribution reports 5.6.0, while OWASP 2026 pins a dated content distribution (v2026.06, format-version 6.0.0). Both are real; this portal anchors tactics against the primary distribution and marks technique identifiers individually.',
  },
  'eu-ai-act': {
    name: 'EU Artificial Intelligence Act',
    shortName: 'EU AI Act',
    version: 'Regulation (EU) 2024/1689',
    validated: VALIDATED,
    publisher: 'European Union',
    url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    citation: 'Regulation (EU) 2024/1689 (Artificial Intelligence Act).',
    role: 'regulatory',
    idPattern: 'Art.',
    order: 60,
    summary:
      'Binding obligations for high-risk AI, including human oversight (Art. 14), accuracy and robustness (Art. 15), logging (Art. 12), transparency (Art. 13 and 50), post-market monitoring (Art. 72) and serious-incident reporting (Art. 73). Article references on this portal follow the per-control mappings published in AGSC and ADG rather than an independent legal reading, and are cited as pointers rather than as compliance conclusions.',
  },
  'nist-ai-rmf': {
    name: 'NIST AI Risk Management Framework',
    shortName: 'NIST AI RMF',
    version: 'AI 100-1 v1.0',
    released: '2023',
    validated: VALIDATED,
    publisher: 'National Institute of Standards and Technology',
    url: 'https://airc.nist.gov/airmf-resources/airmf/',
    citation: 'NIST AI Risk Management Framework (AI 100-1) v1.0, 2023.',
    role: 'regulatory',
    idPattern: 'GOVERN / MAP / MEASURE / MANAGE',
    order: 70,
    summary:
      'Four functions — Govern, Map, Measure, Manage — that organize AI risk work without prescribing controls. Both AGSC and ADG publish a crosswalk into these functions, so OSPREY inherits the mapping rather than deriving its own.',
  },
  'iso-42001': {
    name: 'ISO/IEC 42001 — AI management systems',
    shortName: 'ISO/IEC 42001',
    version: '2023',
    released: '2023',
    validated: VALIDATED,
    publisher: 'ISO/IEC',
    url: 'https://www.iso.org/standard/81230.html',
    citation: 'ISO/IEC 42001:2023, Information technology — Artificial intelligence — Management system.',
    role: 'regulatory',
    idPattern: 'A.',
    order: 80,
    summary:
      'A certifiable management-system standard for AI, whose Annex A control groups both AGSC and ADG map into. Referenced here for traceability: a detection that produces evidence for an AGSC control also produces evidence toward the Annex A group that control maps to.',
  },
};

for (const [slug, f] of Object.entries(frameworks)) write('frameworks', slug, f);

/* ========================================================================
   ADG GOVERNANCE SURFACES — the coverage axis
   ======================================================================== */
const surfaces = [
  ['model', 'Model', ['Adopt', 'Govern'],
    'Foundation models, fine-tuned models, adapters, routers, versions, diffusion models, composite model chains.',
    'Use only approved models with known risk posture, provenance, and change traceability.',
    'indirect',
    'Reached only through OSP-12 when a model or adapter version changes unexpectedly at inference. OSPREY governs runtime behaviour, not model provenance — that sits with the governance workstream under ADG MC-1 and MC-5.', 10],
  ['prompt', 'Prompt', ['Adopt', 'Defend'],
    'System prompts, templates, policies, agent instructions, prompt libraries, multimodal input validation.',
    'Prevent unmanaged behaviour changes and unsafe instruction patterns.',
    'direct',
    'OSP-02 and OSP-15. The strongest coverage in the current build, and the labels most likely to reach their accuracy targets first.', 20],
  ['context', 'Context', ['Govern', 'Defend'],
    'Retrieval sources, session state, memory, hidden context, user metadata, cross-session data.',
    'Prevent poisoning, leakage, cross-session contamination, and privacy violations.',
    'direct',
    'OSP-03, OSP-08 and OSP-15. Coverage depends entirely on the provenance telemetry field — the same field ADG MC-6 exists to establish. Without it, classification degrades to guessing.', 30],
  ['tools', 'Tools', ['Defend'],
    'APIs, plugins, actions, code execution, file access, transactional endpoints, MCP capabilities.',
    'Enforce least privilege, strong validation, sandboxing, and full audit logging.',
    'direct',
    'OSP-04, OSP-06, OSP-12 and OSP-13. Requires a machine-readable declared-scope statement per agent — the artifact ADG calls an Agent Authority Statement.', 40],
  ['orchestration', 'Orchestration', ['Adopt', 'Defend'],
    'Planners, workflow graphs, retry logic, multi-agent flows, model routing, agent-to-agent communication.',
    'Bound agent behaviour, prevent cascading failures, ensure deterministic control.',
    'direct',
    'OSP-01, OSP-09, OSP-10, OSP-14 and OSP-16. Every one of these is a sequence or aggregate problem, so all of them need full trajectory telemetry rather than isolated call records.', 50],
  ['identity', 'Identity', ['Govern', 'Defend'],
    'Credentials, service accounts, delegated authority, secrets, trust relationships, agent identity.',
    'Prevent privilege misuse, preserve accountability, trace agent actions to human authority.',
    'direct',
    'OSP-05 and OSP-13. Both are deterministic checks, which makes this the highest-value quick win once an agent identity register exists.', 60],
  ['safety-layer', 'Safety Layer', ['Defend'],
    'Guardrails, policy engines, semantic filters, classifiers, circuit breakers, harm detectors.',
    'Block unsafe content, unfair outputs, and unauthorized actions before impact.',
    'partial',
    'OSP-07 and OSP-11. OSPREY governs actions rather than generated content, so content-safety controls such as AGSC SAF-03 are only partly covered. Whether partial coverage is acceptable is an open scoping question.', 70],
  ['telemetry', 'Telemetry', ['Defend', 'Govern'],
    'Logs, traces, evaluations, replay data, alerts, governance evidence, fairness metrics.',
    'Make behaviour observable, reviewable, provable, and measurable.',
    'foundational',
    'Not a threat category. It is the substrate every category depends on, and the single largest determinant of whether the rest of the register is detectable at all.', 80],
  ['learning-loop', 'Learning Loop', ['Govern', 'Adopt'],
    'Pre-training sources, post-training alignment, feedback loops, retraining updates, RLHF data.',
    'Control data provenance, drift, alignment stability, and undocumented behaviour change.',
    'out-of-scope',
    'OSP-03 touches it where poisoned memory writes persist across sessions. Training-time poisoning is governed by AGSC GOV-04 and the ADG pre/post-training overlay, and is not an OSPREY runtime concern.', 90],
];

for (const [slug, name, pillars, scope, objective, coverage, coverageNote, order] of surfaces) {
  write('surfaces', slug, { name, framework: 'adg', pillars, scope, objective, coverage, coverageNote, order });
}

console.log(`seeded ${Object.keys(frameworks).length} frameworks, ${surfaces.length} surfaces`);
