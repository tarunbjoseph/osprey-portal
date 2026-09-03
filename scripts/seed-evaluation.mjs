/**
 * One-shot seeder for the evaluation layer: benchmarks and model candidates.
 *
 * Most entries here are deliberately marked planned or in-progress. The schema
 * and the shape of the answer are settled now so results can drop in later
 * without a redesign; pretending the results already exist would be worse than
 * an honest empty state.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/data/', import.meta.url).pathname;
const str = (v) => (typeof v === 'boolean' || typeof v === 'number' ? String(v) : JSON.stringify(String(v)));
const yaml = (o, ind = 0) => {
  const pad = ' '.repeat(ind);
  return Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => {
    if (Array.isArray(v)) {
      if (v.length === 0) return `${pad}${k}: []`;
      return `${pad}${k}:\n` + v.map((i) =>
        typeof i === 'object' ? `${pad}  -\n${yaml(i, ind + 4)}` : `${pad}  - ${str(i)}`).join('\n');
    }
    if (typeof v === 'object') return `${pad}${k}:\n${yaml(v, ind + 2)}`;
    return `${pad}${k}: ${str(v)}`;
  }).join('\n');
};
const write = (dir, slug, o) => {
  mkdirSync(join(ROOT, dir), { recursive: true });
  writeFileSync(join(ROOT, dir, `${slug}.yaml`), yaml(o) + '\n', 'utf8');
};

/* ======================================================================
   BENCHMARKS
   ====================================================================== */
const benchmarks = {
  'classifier-gate': {
    name: 'Threat Classifier Accuracy Gate',
    shortName: 'Classifier gate',
    kind: 'classification',
    gate: 'Gate 1',
    status: 'in-progress',
    statusNote: 'Metric definitions settled. The labelled evaluation set is being assembled, and the first run is scheduled once the classifier has a trained checkpoint.',
    purpose:
      'Measure whether the small language model can actually name the threats it is responsible for — and only those. This gate exists to keep a headline accuracy number honest, because most categories in the register are not model decisions at all.',
    measures: [
      'Precision and recall over the labels a model owns, not over the whole register',
      'Missed-threat rate on the same evaluation set',
      'Per-label breakdown, so one strong label cannot carry a weak one',
    ],
    metrics: [
      { name: 'F1', definition: 'Harmonic mean of precision and recall across the labelled evaluation set, computed per label and macro-averaged.', target: '≥ 0.80', appliesTo: 'Model-owned labels only' },
      { name: 'False negative rate', definition: 'Share of genuine threats the classifier failed to flag, on the same evaluation set.', target: '< 10%', appliesTo: 'Model-owned labels only' },
      { name: 'Per-label F1', definition: 'The same measure reported for each label individually, so a strong label cannot mask a weak one.', appliesTo: 'Each model-owned label' },
    ],
    threats: ['osp-02', 'osp-03', 'osp-07', 'osp-08', 'osp-15'],
    openQuestions: [
      'Is there an existing labelled corpus, or does the evaluation set need generating from scratch?',
      'What label balance does the evaluation set need? Real-world class imbalance would make a naive accuracy figure meaningless.',
      'Who adjudicates disagreements when two annotators label the same trace differently?',
      'How is a synthetic evaluation set kept honest — held-out generators, or a separate source entirely?',
    ],
    order: 10,
  },

  'containment-eval': {
    name: 'Adversarial Containment Evaluation',
    shortName: 'Containment',
    kind: 'containment',
    gate: 'Gate 2',
    status: 'planned',
    statusNote: 'Scoped, not yet built. This is the measurement that covers the majority of the register, and it is deliberately separate from classifier accuracy.',
    purpose:
      'Measure whether the platform stopped the attack — not whether a model correctly named it. Most threat categories are deterministic checks, statistics or derived signals, and none of them can be scored with an F1. Reporting them through classifier metrics would inflate the number while telling you nothing.',
    measures: [
      'Whether a scripted attack reached its objective or was contained',
      'How far up the action ladder the platform escalated, and whether that was proportionate',
      'Time from the anomalous event to detection, and from detection to containment',
      'False containment: legitimate agent work that was blocked or quarantined',
    ],
    metrics: [
      { name: 'Containment rate', definition: 'Share of scripted attack scenarios where the platform prevented the objective from being reached.', target: 'To be set after a baseline run' },
      { name: 'Mean time to detect', definition: 'Elapsed time from the anomalous event occurring to an alert being generated, measured in a sandbox.', target: '< 5 minutes' },
      { name: 'Mean time to contain', definition: 'Elapsed time from detection to automated or human-confirmed isolation.', target: '< 10 minutes' },
      { name: 'False containment rate', definition: 'Share of legitimate agent sessions incorrectly blocked or quarantined. The metric that decides whether anyone will leave the platform switched on.', target: 'To be set after a baseline run' },
    ],
    threats: ['osp-05', 'osp-09', 'osp-10', 'osp-12', 'osp-13', 'osp-14'],
    openQuestions: [
      'What scenario library is available, and does it cover the agentic categories or only classical ML attacks?',
      'Can the sandbox reproduce a sandbox escape safely enough to measure the response to one?',
      'What counts as containment for a workflow-level threat, where isolating a single agent is insufficient?',
      'How is false containment measured without a corpus of known-good agent sessions?',
    ],
    order: 20,
  },

  cybergym: {
    name: 'CyberGym',
    shortName: 'CyberGym',
    kind: 'capability',
    status: 'planned',
    statusNote: 'Under evaluation as an external capability benchmark. Applicability to this specific detection problem still needs establishing before it is adopted.',
    purpose:
      'An external benchmark for cyber-security capability in language models. Used here as a capability reference for candidate models rather than as a measure of the platform: it says something about what a model can do, not about whether this detection pipeline works.',
    measures: [
      'Model capability on security-relevant reasoning tasks',
      'Comparative signal across candidate models before fine-tuning',
    ],
    metrics: [
      { name: 'Task success rate', definition: 'Share of benchmark tasks completed successfully, as defined by the benchmark itself.', appliesTo: 'Candidate models' },
    ],
    threats: [],
    openQuestions: [
      'Which tasks in the suite are relevant to agent-behaviour detection, as opposed to offensive capability?',
      'Is a strong score here predictive of classification performance after fine-tuning, or unrelated?',
      'What compute does a full run need, and does it fit the available budget?',
    ],
    order: 30,
  },

  exploitgym: {
    name: 'ExploitGym',
    shortName: 'ExploitGym',
    kind: 'robustness',
    status: 'planned',
    statusNote: 'Scoped as a stretch item for adversarial containment measurement, deliberately isolated from anything used for training.',
    purpose:
      'Adversarial containment measurement in an isolated environment. The intent is to test whether the platform holds under attack rather than whether a model scores well, which makes it the right instrument for the deterministic half of the register.',
    measures: [
      'Whether the platform contains an active exploitation attempt',
      'Robustness of detections under adversarial pressure rather than on clean examples',
    ],
    metrics: [
      { name: 'Containment under adversarial pressure', definition: 'Containment rate when the attacker adapts to observed defences, rather than replaying a fixed script.' },
    ],
    threats: ['osp-04', 'osp-07', 'osp-13'],
    openQuestions: [
      'Strict separation from the training lane — how is leakage between evaluation and training data prevented?',
      'Does the environment model agentic tool use, or only classical exploitation?',
    ],
    order: 40,
  },

  'redteam-scenarios': {
    name: 'Red-Team Scenario Corpus',
    shortName: 'Red-team corpus',
    kind: 'classification',
    status: 'in-progress',
    statusNote: 'Generation approach being defined. Weighting is deliberately skewed toward the labels where model performance is the binding constraint.',
    purpose:
      'The labelled corpus behind the classifier gate. Its composition decides what the accuracy numbers actually mean, so the weighting is a design decision rather than a byproduct of whatever was easy to generate.',
    measures: [
      'Coverage across model-owned labels',
      'Difficulty distribution, including obfuscated and novel payloads rather than only textbook cases',
      'Class balance, and how far it departs from what production would look like',
    ],
    metrics: [
      { name: 'Scenario count per label', definition: 'Number of labelled scenarios available for each model-owned label.', appliesTo: 'Model-owned labels' },
      { name: 'Held-out share', definition: 'Proportion reserved for evaluation and never seen during fine-tuning.' },
    ],
    threats: ['osp-02', 'osp-03', 'osp-07', 'osp-15'],
    openQuestions: [
      'Generation should be weighted toward the labels where the model is the binding constraint. Volume for deterministic labels is wasted effort — is that agreed?',
      'How is synthetic-data overfitting avoided, given the same model family may generate and be evaluated on this corpus?',
      'Does any real (non-synthetic) trace data exist to validate that synthetic scenarios resemble production?',
    ],
    order: 50,
  },
};

for (const [slug, b] of Object.entries(benchmarks)) write('benchmarks', slug, b);

/* ======================================================================
   MODELS
   ====================================================================== */
const models = {
  'phi-3': {
    name: 'Phi-3', vendor: 'Microsoft', params: '3.8B (mini)', license: 'MIT',
    role: 'candidate', status: 'planned',
    rationale:
      'A small, permissively licensed model that fits comfortably on local hardware, which matters when the detector has to run inline without adding meaningful latency to every agent action. Strong reasoning for its size makes it a credible fine-tuning base for the classification labels.',
    hosting: 'Local accelerator',
    evaluations: [],
    order: 10,
  },
  mistral: {
    name: 'Mistral', vendor: 'Mistral AI', params: '7B class', license: 'Apache 2.0',
    role: 'candidate', status: 'planned',
    rationale:
      'A well-supported open-weights family with a mature fine-tuning ecosystem. The larger parameter count buys headroom on the harder labels at the cost of inference budget — the trade-off the evaluation is meant to settle.',
    hosting: 'Local accelerator',
    evaluations: [],
    order: 20,
  },
  'command-a': {
    name: 'Command A', vendor: 'Cohere', license: 'Open weights, non-commercial',
    role: 'candidate', status: 'planned',
    rationale:
      'Included as an enterprise-oriented comparison point with a Canadian vendor, which is relevant given the regulatory pilot. Licence terms need confirming before any deployment beyond evaluation.',
    hosting: 'Local accelerator',
    evaluations: [],
    order: 30,
  },
  'embedding-model': {
    name: 'Trajectory embedding model', vendor: 'To be selected',
    role: 'embedding', status: 'planned',
    rationale:
      'Two categories — goal drift and tool-chain exploitation — are distance and sequence problems rather than classification, and need an embedding over the session trajectory instead of a classifier over a span. Selection depends on what trajectory telemetry ends up looking like, so it is deliberately unresolved.',
    evaluations: [],
    order: 40,
  },
  'escalation-layer': {
    name: 'Frontier escalation layer', vendor: 'To be selected',
    role: 'escalation', status: 'planned',
    rationale:
      'A larger model handles the cases the small classifier flags but cannot resolve confidently, and the second-pass judgement calls — whether a statistical outlier was contextually justified, whether a gap between an agent’s summary and its actions was material. Deliberately not in the hot path: it is the expensive instrument, reserved for ambiguity.',
    evaluations: [],
    order: 50,
  },
  baseline: {
    name: 'Rules and statistics baseline', vendor: 'In-house',
    role: 'baseline', status: 'in-progress',
    rationale:
      'Not a model, and listed here on purpose. Six categories should never route through a classifier at all, and several more are better served by a threshold than by inference. Any model has to beat this baseline on its own labels to justify its cost — and on the deterministic labels, it cannot, which is the point.',
    evaluations: [],
    order: 60,
  },
};

for (const [slug, m] of Object.entries(models)) write('models', slug, m);

console.log(`seeded ${Object.keys(benchmarks).length} benchmarks, ${Object.keys(models).length} models`);
