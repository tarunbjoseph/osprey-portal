/**
 * One-shot rewrite of the ADG-derived control and surface descriptions.
 *
 * Why this exists
 * ---------------
 * The EC-Council ADG white paper carries no licence grant of any kind — no
 * Creative Commons licence, no "free to adopt" statement, nothing. Default
 * copyright therefore applies, and the first pass of this catalogue reproduced
 * its control purposes and evidence requirements close to verbatim.
 *
 * Framework identifiers (MC-1, "Runtime Monitoring", the nine surface names)
 * are retained: a crosswalk cannot function without them, they are short
 * factual references, and naming a framework's elements in order to map to
 * them is ordinary interoperability practice. What is rewritten here is the
 * expression — the descriptive prose — which is the part copyright protects.
 *
 * If EC-Council later publishes an open licence, or grants permission, this
 * can be revisited. Until then the site describes what ADG requires in its own
 * words and cites the source.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { load as parseYaml } from 'js-yaml';

const DATA = new URL('../src/data/', import.meta.url).pathname;
const jstr = (v) => JSON.stringify(String(v));

const setField = (text, key, value) => {
  const re = new RegExp(`^${key}: .*$`, 'm');
  if (!re.test(text)) throw new Error(`field ${key} not found`);
  return text.replace(re, () => `${key}: ${jstr(value)}`);
};

const setList = (text, key, items) => {
  const re = new RegExp(`^${key}:\\n(?:  - .*\\n)*`, 'm');
  const block = `${key}:\n` + items.map((i) => `  - ${jstr(i)}`).join('\n') + '\n';
  if (!re.test(text)) throw new Error(`list ${key} not found`);
  return text.replace(re, () => block);
};

/* ---------------------------------------------------------------------
   ADG minimum controls — purpose and evidence, restated
   --------------------------------------------------------------------- */
const MC = {
  'mc-1': {
    purpose: 'Every AI system the organisation runs is listed somewhere findable, and each entry names the person accountable for it, how risky it has been judged to be, and how much autonomy it operates with.',
    evidence: ['A published register, refreshed on a regular cycle, with a named accountable owner against every system'],
  },
  'mc-2': {
    purpose: 'Each system is graded on the dimensions that decide how much governance it needs: how sensitive its data is, how autonomously it acts, who can reach it, what it could damage, and how far the business depends on it.',
    evidence: ['A recorded classification for each system, produced against a consistent scheme rather than decided case by case'],
  },
  'mc-3': {
    purpose: 'The people who ship a system, the people who test its security, and the people who authorise its release are not the same people.',
    evidence: ['A responsibility map per system showing that no single function holds delivery, validation and approval together'],
  },
  'mc-4': {
    purpose: 'Nothing reaches production before it has been tested for quality, safety, security, fairness, and how it behaves when it fails.',
    evidence: ['A signed evaluation report covering every harm class, dated before the system went live'],
  },
  'mc-5': {
    purpose: 'Changes to prompts, tools, models and retrieval sources pass through an approval process rather than going straight to production.',
    evidence: ['A change log with approvals attached, and no production changes that bypassed it'],
  },
  'mc-6': {
    purpose: 'Every input the model can read has a stated origin, a retention period, an access rule, and a defined position in a trust order.',
    evidence: ['A published context policy for each system, revisited on a set cycle'],
  },
  'mc-7': {
    purpose: 'Every tool and MCP capability an agent can call is registered, graded for how far it can be trusted, and governed by a rule about when it may be invoked.',
    evidence: ['A published register carrying a risk assessment and an approval decision for each tool'],
  },
  'mc-8': {
    purpose: 'Production systems are watched for the failures that only appear after launch: misuse, behavioural drift, data leaking out, unsafe actions, bias emerging, and configuration changing underneath.',
    evidence: ['Monitoring that is actually running, with thresholds that trigger something and a stated time to respond'],
  },
  'mc-9': {
    purpose: 'There is a procedure for AI incidents specifically, and it captures enough evidence to reconstruct afterwards what the system actually did.',
    evidence: ['A written playbook that has been exercised at least once a year rather than only written'],
  },
  'mc-10': {
    purpose: 'Governance is reviewed on a schedule, exceptions are dispositioned explicitly rather than left to accumulate, and high-risk systems are reported upward.',
    evidence: ['Review records showing what was found, what was decided, and what happened to each open exception'],
  },
  'mc-11': {
    purpose: 'Systems are tested for discriminatory outcomes against representative data, using fairness measures that already exist rather than ones invented for the occasion.',
    evidence: ['A fairness evaluation report, repeated whenever the model or its data changes'],
  },
  'mc-12': {
    purpose: 'Where AI arrives from a vendor, it is written down who is accountable for what, what the contract obliges them to do, and what assurance is expected in return.',
    evidence: ['A signed responsibility matrix and the vendor due-diligence records behind it'],
  },
};

for (const [slug, { purpose, evidence }] of Object.entries(MC)) {
  const p = `${DATA}controls/adg-${slug}.yaml`;
  let s = readFileSync(p, 'utf8');
  s = setField(s, 'purpose', purpose);
  s = setList(s, 'evidence', evidence);
  writeFileSync(p, s, 'utf8');
}

/* ---------------------------------------------------------------------
   ADG governance surfaces — scope and objective, restated
   --------------------------------------------------------------------- */
const SURF = {
  model: {
    scope: 'The models themselves and everything that varies them: base models, fine-tunes, adapters, routers, pinned versions, and chains that combine several.',
    objective: 'Only approved models run, and each one’s origin, risk posture and change history is known.',
  },
  prompt: {
    scope: 'Everything that tells a model what it is and how to behave: system prompts, templates, agent instructions and prompt libraries, including validation of non-text inputs.',
    objective: 'Behaviour does not change without someone deciding it should, and unsafe instruction patterns never reach the model.',
  },
  context: {
    scope: 'Everything the model reads that is not the current message: retrieved documents, session state, persistent memory, hidden orchestration context, and anything carried between sessions.',
    objective: 'Nothing malicious enters through what the model reads, and nothing private escapes through it.',
  },
  tools: {
    scope: 'Everything the agent can act through: APIs, plugins, code execution, file access, transactional endpoints and MCP capabilities.',
    objective: 'Each tool runs with the least access it needs, validates what it is handed, executes where it can be contained, and leaves a record behind.',
  },
  orchestration: {
    scope: 'The machinery that decides what happens next: planners, workflow graphs, retry logic, model routing, and how agents hand work to one another.',
    objective: 'Agent behaviour stays inside stated limits, one failure does not become many, and control of the sequence remains predictable.',
  },
  identity: {
    scope: 'Who an agent is and what it may act as: credentials, service accounts, delegated authority, secrets, and the trust relationships between them.',
    objective: 'Privilege is not misused, accountability survives the handoff, and every agent action traces back to a human who authorised it.',
  },
  'safety-layer': {
    scope: 'The controls sitting between an agent and its consequences: guardrails, policy engines, semantic filters, classifiers, circuit breakers and harm detectors.',
    objective: 'Unsafe content, unfair outputs and unauthorised actions are stopped before they land rather than reported after.',
  },
  telemetry: {
    scope: 'Logs, traces, evaluation results, replay data, alerts, and the evidence a governance review depends on.',
    objective: 'Behaviour can be observed as it happens, reviewed afterwards, proven to a third party, and measured over time.',
  },
  'learning-loop': {
    scope: 'Everything that changes the model over time: pre-training sources, post-training alignment, feedback loops, retraining, and the preference data behind it.',
    objective: 'Data origin is known, drift is tracked, alignment holds, and behaviour never changes without a record of why.',
  },
};

for (const [slug, { scope, objective }] of Object.entries(SURF)) {
  const p = `${DATA}surfaces/${slug}.yaml`;
  let s = readFileSync(p, 'utf8');
  s = setField(s, 'scope', scope);
  s = setField(s, 'objective', objective);
  writeFileSync(p, s, 'utf8');
}

/* Sanity check: every file still parses. */
for (const slug of Object.keys(MC)) parseYaml(readFileSync(`${DATA}controls/adg-${slug}.yaml`, 'utf8'));
for (const slug of Object.keys(SURF)) parseYaml(readFileSync(`${DATA}surfaces/${slug}.yaml`, 'utf8'));

console.log(`reworded ${Object.keys(MC).length} ADG controls and ${Object.keys(SURF).length} surfaces`);
