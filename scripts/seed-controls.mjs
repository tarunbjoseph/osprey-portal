/**
 * One-shot seeder for the AGSC (25) and ADG (12) control catalogues.
 * The YAML it writes is the source of truth from then on.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/data/controls/', import.meta.url).pathname;
mkdirSync(ROOT, { recursive: true });

const str = (v) => (typeof v === 'boolean' || typeof v === 'number' ? String(v) : JSON.stringify(String(v)));
const yaml = (o, ind = 0) => {
  const pad = ' '.repeat(ind);
  return Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => {
    if (Array.isArray(v)) return v.length === 0 ? `${pad}${k}: []`
      : `${pad}${k}:\n` + v.map((i) => `${pad}  - ${str(i)}`).join('\n');
    if (typeof v === 'object') return `${pad}${k}:\n` + yaml(v, ind + 2);
    return `${pad}${k}: ${str(v)}`;
  }).join('\n');
};
const write = (slug, o) => writeFileSync(join(ROOT, `${slug}.yaml`), yaml(o) + '\n', 'utf8');

/* ---------------------------------------------------------------------
   AGSC — 25 controls, 4 pillars (SAGS), 3 adoption tiers
   --------------------------------------------------------------------- */
const AGSC = [
  // code, name, pillar, tier, purpose, evidence[], surfaces[], coverage, note
  ['SAF-01', 'Autonomous System Oversight', 'Safety', 'T1',
    'Ensure autonomous or agentic AI systems are monitored against expected behaviour, and that responsible teams can intervene when the system behaves unexpectedly, unsafely, or outside its approved scope.',
    ['Documented expected behaviour and limits', 'Defined criteria for abnormal or unsafe behaviour', 'Evidence of monitoring such as logs, dashboards or alerts', 'Documented human intervention and escalation process'],
    ['orchestration', 'telemetry'], 'direct',
    'OSP-01 and OSP-16 produce the expected-behaviour baseline and the abnormal-behaviour criteria this control asks for.'],
  ['SAF-02', 'Emergency Stop & Containment (Kill Switch)', 'Safety', 'T1',
    'Ensure there is a defined and tested emergency stop or containment process so responsible teams can halt, restrict, or isolate the AI system when required.',
    ['Documented emergency stop procedure and activation criteria', 'Defined roles for activation and notification', 'Logs showing activation can be tracked', 'Documented recovery process and evidence of testing'],
    ['tools', 'orchestration'], 'direct',
    'OSP-13, OSP-10 and OSP-14 all terminate in a containment action. Their quarantine and kill records are this control’s activation evidence.'],
  ['SAF-03', 'Content Safety & Misuse Prevention', 'Safety', 'T1',
    'Ensure the AI system has appropriate content safety protections, misuse prevention measures, and escalation paths before it is used in a real business setting.',
    ['Documented content safety rules or policy', 'Evidence of implemented safeguards', 'Results of misuse and safety testing', 'Defined process for handling unsafe outputs'],
    ['safety-layer'], 'partial',
    'Only partly covered. OSPREY governs actions rather than generated content, so content classification sits outside the current scope. This is the one Tier 1 control the build does not fully reach.'],
  ['SAF-04', 'Output Factual Accuracy & Anti-Hallucination', 'Safety', 'T2',
    'Ensure fact-bearing AI outputs are grounded, checked, and presented with appropriate source support or uncertainty indicators.',
    ['Documented accuracy expectations', 'Sample outputs demonstrating sourcing or uncertainty indicators', 'Records of identified inaccuracies and corrective actions'],
    ['safety-layer', 'telemetry'], 'partial',
    'OSP-16 covers the agentic slice: claims of completed work the trace does not support. General factual accuracy of generated prose is out of scope.'],
  ['SAF-05', 'AI Output Monitoring & Safeguards', 'Safety', 'T2',
    'Ensure AI outputs are monitored after deployment and that safeguards detect, review, escalate, correct, or block risky outputs before they create harm.',
    ['Documented monitoring approach and defined risk thresholds', 'Evidence of monitoring activities', 'Records of issue handling including review, escalation and remediation'],
    ['safety-layer', 'telemetry'], 'direct',
    'OSP-07, OSP-08 and OSP-11 produce the output-safeguard decisions and blocked-execution records this control asks for.'],

  ['ALN-01', 'Autonomy Boundary Control', 'Alignment', 'T1',
    'Ensure each agent operates within a clearly defined and technically enforced action space, with restricted actions blocked by design rather than by prompt instruction.',
    ['Documented action boundaries for each agent', 'Policy or configuration showing permitted, restricted and approval-required actions', 'Logs of blocked boundary violations and related alerts'],
    ['tools', 'orchestration'], 'direct',
    'OSP-04 and OSP-06 produce exactly the boundary-enforcement record this control needs: which chains were permitted, which were stopped.'],
  ['ALN-02', 'Human Oversight & Intervention', 'Alignment', 'T1',
    'Ensure human oversight is accessible, timely, and meaningful, occurring before high-impact or irreversible actions rather than only after the fact.',
    ['Oversight and escalation process', 'Defined reviewer roles and decision rights', 'Evidence of approval gates for sensitive actions'],
    ['orchestration', 'safety-layer'], 'direct',
    'The autonomy-tier downgrade rule is this control expressed as a runtime mechanism. Every threat row states the tier the agent holds after detection.'],
  ['ALN-03', 'Decision Interpretability', 'Alignment', 'T3',
    'Ensure AI-supported decisions are explainable in a way appropriate to the audience and decision context.',
    ['Documented interpretability approach', 'Sample explanations for users, operators or reviewers', 'Link to review, escalation, correction or appeal process'],
    ['safety-layer'], 'indirect',
    'Contributed indirectly: every OSPREY verdict carries the signal, control and confidence that produced it, which is the raw material an explanation is built from.'],
  ['ALN-04', 'Model Explainability', 'Alignment', 'T3',
    'Ensure the AI system has an explanation approach appropriate to its risk, use case and audience, including decision traces and tool-use records for agentic systems.',
    ['Documented explanation method', 'Decision traces, tool-use records or action history', 'Records of explanation-quality or audit reviews'],
    ['telemetry'], 'indirect',
    'The session trace OSPREY needs for detection is the same trace this control needs for explanation. Shared dependency, different consumer.'],
  ['ALN-05', 'Output Labeling & Action Attribution', 'Alignment', 'T2',
    'Ensure AI-generated content is labelled where human origin may be assumed, and that autonomous actions are attributed to the responsible AI system, workflow, or service account.',
    ['Documented labelling and attribution standard', 'Agent action records showing the responsible system or workflow', 'Audit logs linking outputs or actions to the AI system'],
    ['telemetry', 'identity'], 'direct',
    'OSP-11 and OSP-16 both turn on attribution: comparing what the agent said it did against what the trace shows it did.'],

  ['GOV-01', 'Data Provenance & Input Integrity', 'Governance', 'T2',
    'Ensure the origin, integrity and trust level of data entering the AI system is known and controlled.',
    ['Provenance records for training, retrieval and runtime inputs', 'Input validation evidence', 'Trust classification for data sources'],
    ['context', 'learning-loop'], 'direct',
    'The provenance field this control establishes is the same field OSP-03 and OSP-15 cannot be classified without. The dependency runs both ways.'],
  ['GOV-02', 'AI Change Governance', 'Governance', 'T2',
    'Ensure changes to models, prompts, data, tools and configurations pass through a governed change process.',
    ['Change log with approval records', 'Evidence that no uncontrolled production changes occurred'],
    ['model', 'prompt', 'tools'], 'indirect',
    'OSP-12 detects change-control failures at runtime — a component that changed without passing the gate.'],
  ['GOV-03', 'Third-Party & Supply-Chain Oversight', 'Governance', 'T3',
    'Ensure external models, vendors, APIs, datasets, platforms and tools are assessed and monitored.',
    ['Third-party component register', 'Vendor assessment records', 'Change approvals for external components'],
    ['tools', 'model'], 'direct',
    'OSP-12 produces the runtime half of this evidence: which components changed between runs, and whether the change was approved.'],
  ['GOV-04', 'Model Training Governance', 'Governance', 'T3',
    'Ensure models that are trained, fine-tuned or materially developed follow a governed process.',
    ['Training data documentation', 'Experiment and approval records'],
    ['learning-loop'], 'none',
    'Out of OSPREY scope. Training-time governance sits with the model workstream.'],
  ['GOV-05', 'Model Evaluation', 'Governance', 'T2',
    'Ensure models are validated for quality, bias, robustness and reliability before and during use.',
    ['Evaluation reports with pass/fail status', 'Regression test history'],
    ['model'], 'direct',
    'The benchmark layer of this portal is this control’s evidence: Gate 1 classifier metrics and containment results, reported separately.'],
  ['GOV-06', 'Model Continuous Improvement & Drift Management', 'Governance', 'T3',
    'Ensure production models are monitored for performance drift and improved through a governed cycle.',
    ['Drift monitoring records', 'Retraining and improvement decisions'],
    ['model', 'learning-loop'], 'indirect',
    'Detection-quality trends over time feed this control, but model drift itself is measured by the evaluation workstream.'],
  ['GOV-07', 'AI Lifecycle & Registry Management', 'Governance', 'T3',
    'Ensure models, prompts, tools, datasets, retrieval sources and memory are inventoried across their lifecycle.',
    ['AI system and component registry', 'Version and lifecycle records'],
    ['model', 'tools'], 'indirect',
    'OSP-12 compares observed components against the registry. Maintaining the registry is a governance task, not a runtime one.'],
  ['GOV-08', 'Environmental & Carbon Governance', 'Governance', 'T3',
    'Ensure material compute usage is measured and governed across training, hosting and inference.',
    ['Compute and energy usage records', 'Efficiency or reduction measures'],
    ['telemetry'], 'partial',
    'OSP-14 counts per-session compute and spend for security reasons; the same counters serve this control’s efficiency reporting.'],

  ['SEC-01', 'Multi-Agent Coordination Security', 'Security', 'T2',
    'Ensure multi-agent interactions are mapped, tested and governed so coordination stays predictable, secure and aligned with the intended business process.',
    ['Versioned agent interaction map', 'Inter-agent communication or coordination protocol', 'Records of topology, hierarchy or coordination changes'],
    ['orchestration', 'identity'], 'direct',
    'OSP-09 and OSP-10 produce the inter-agent authorization records and the workflow-level containment evidence.'],
  ['SEC-02', 'Agent Identity & Least-Privilege Authorization', 'Security', 'T1',
    'Ensure each agent has a unique identity and only the minimum access needed for the task, with stronger approval for sensitive actions.',
    ['Agent identity registry', 'Access and entitlement records', 'Approval records for high-impact actions'],
    ['identity'], 'direct',
    'OSP-05 is a direct check against this register, and OSP-13 extends it to the runtime boundary. Both are deterministic — a classifier would only add false negatives.'],
  ['SEC-03', 'Prompt Injection & Adversarial Input Defense', 'Security', 'T1',
    'Ensure adversarial inputs are detected, isolated, blocked and monitored across all major ingestion points, especially where untrusted content can influence AI behaviour.',
    ['Input/output protection inventory and configuration', 'Detection rules or monitoring alerts for injection attempts', 'Architecture evidence showing trust-context separation', 'Sample alerts and response records'],
    ['prompt', 'context', 'safety-layer'], 'direct',
    'OSP-02, OSP-03, OSP-07 and OSP-15. The densest coverage of any single control, and the anchor for most of the classifier work.'],
  ['SEC-04', 'Observability, Anomaly Detection & Incident Response', 'Security', 'T1',
    'Ensure AI systems generate usable telemetry, support anomaly detection, and connect to an AI-specific incident response process.',
    ['Trace or logging schema', 'Monitoring coverage report', 'Anomaly detection configuration and sample alerts', 'AI incident response runbook'],
    ['telemetry', 'orchestration'], 'direct',
    'This is the control OSPREY exists to satisfy. Every category in the register produces evidence against it.'],
  ['SEC-05', 'AI Threat Modeling', 'Security', 'T2',
    'Ensure AI-specific threats are identified before deployment, mapped to mitigations, and refreshed when the system materially changes.',
    ['Versioned AI threat model', 'Threat-to-control or mitigation matrix', 'Refresh history tied to change events'],
    ['orchestration', 'tools', 'context'], 'direct',
    'The threat register on this portal is the versioned threat model this control asks for, and the anchoring tables are the threat-to-control matrix.'],
  ['SEC-06', 'AI Security Testing & Red-Teaming', 'Security', 'T2',
    'Ensure AI systems are tested against misuse, adversarial inputs, jailbreaks, data leakage and unsafe behaviour before release, with clear pass/fail thresholds.',
    ['AI security test plan or red-team scope', 'Latest test results with pass/fail status', 'Regression test history'],
    ['safety-layer', 'model'], 'direct',
    'The containment benchmarks measure this control directly — whether the platform stopped the attack, not whether a model named it.'],
  ['SEC-07', 'Memory & Context Lifecycle Security', 'Security', 'T2',
    'Ensure memory and context are isolated, governed, auditable and expired appropriately so stored information does not create leakage, contamination or unintended influence.',
    ['Memory and context isolation design', 'Test results showing no cross-user or cross-session leakage', 'Retention, expiry and purge policy', 'Memory audit or inspection records'],
    ['context'], 'direct',
    'OSP-03, OSP-08 and OSP-15 produce the memory-write decisions and context-boundary records this control asks for.'],
];

for (const [code, name, pillar, tier, purpose, evidence, surfaces, ospreyCoverage, coverageNote] of AGSC) {
  write(`agsc-${code.toLowerCase()}`, {
    code, name, framework: 'agsc', pillar, tier, purpose, evidence, surfaces,
    ospreyCoverage, coverageNote,
    order: { Safety: 10, Alignment: 20, Governance: 30, Security: 40 }[pillar] + Number(code.split('-')[1]),
  });
}

/* ---------------------------------------------------------------------
   ADG — 12 minimum controls, each with a named evidence artifact
   --------------------------------------------------------------------- */
const ADG = [
  ['MC-1', 'AI System Inventory', 'Govern',
    'Maintain an inventory of all AI systems with an accountable owner, risk classification, and autonomy tier.',
    ['Published inventory, reviewed quarterly, with a named owner per system'], ['model', 'identity'], 'indirect',
    'Contributed, not owned. The agent identity register OSP-05 checks against is the same artifact this control requires.'],
  ['MC-2', 'Risk Classification', 'Govern',
    'Classify each AI system by data sensitivity, autonomy, external exposure, harm potential, and business criticality.',
    ['Documented classification per system using a standardized risk taxonomy'], ['model'], 'indirect',
    'The autonomy tier OSPREY downgrades on detection is the tier this control assigns at design time.'],
  ['MC-3', 'Separation of Duties', 'Govern',
    'Separate deployment ownership, security validation, and approval authority across Adopt, Defend and Govern.',
    ['RACI matrix per AI system; no single function holding all three roles'], ['identity', 'orchestration'], 'indirect',
    'OSP-09 enforces the runtime half: an agent should not be able to authorise its own delegation.'],
  ['MC-4', 'Pre-Production Evaluation', 'Adopt',
    'Complete quality, safety, security, fairness and failure-mode testing before any production deployment.',
    ['Signed evaluation report covering all four harm classes before go-live'], ['model', 'safety-layer'], 'partial',
    'Adversarial regression results from OSP-02 and OSP-07 feed the security portion of this report.'],
  ['MC-5', 'Change Control', 'Adopt',
    'Manage changes to prompts, tools, models and retrieval sources through a governed change process.',
    ['Change log with approval records; no uncontrolled production changes'], ['prompt', 'tools', 'model'], 'partial',
    'OSP-12 detections are change-control failures observed at runtime and belong in the same log.'],
  ['MC-6', 'Context Policy', 'Govern',
    'Define provenance, retention, access restrictions, and trust ordering for all context inputs.',
    ['Published context policy per system; annual review'], ['context'], 'direct',
    'OSP-03, OSP-08 and OSP-15 produce the provenance and memory-write records. The dependency also runs backwards: without this policy’s provenance field, those labels cannot be classified.'],
  ['MC-7', 'Tool and MCP Register', 'Defend',
    'Maintain a register of all tools and MCP capabilities with trust tiering and invocation controls.',
    ['Published register with per-tool risk assessment and approval status'], ['tools'], 'direct',
    'OSP-04, OSP-06 and OSP-12 produce the invocation decisions: which calls were permitted, which chains were stopped, which components changed.'],
  ['MC-8', 'Runtime Monitoring', 'Defend',
    'Monitor for abuse, drift, data leakage, unsafe actions, bias emergence and configuration drift in production.',
    ['Active monitoring with defined alert thresholds and response SLAs'], ['telemetry', 'safety-layer'], 'direct',
    'The bulk of OSPREY’s output. Every core-scope label produces an alert record with a threshold, a confidence and a verdict. This is the minimum control the platform most directly satisfies.'],
  ['MC-9', 'AI Incident Response', 'Defend',
    'Maintain AI-specific incident response procedures with replayable evidence capture.',
    ['Documented playbook; at least one tabletop exercise per year'], ['telemetry'], 'direct',
    'Quarantine and kill records from OSP-05, OSP-10 and OSP-13 with the session trace attached. The forensic-replay requirement is why trace completeness matters beyond classification.'],
  ['MC-10', 'Periodic Governance Review', 'Govern',
    'Conduct governance reviews with exception handling and board reporting for high-risk systems.',
    ['Review records with findings, decisions and exception dispositions'], ['telemetry'], 'none',
    'A governance-process control. OSPREY supplies inputs to the review but produces no evidence for it directly.'],
  ['MC-11', 'Fairness and Bias Evaluation', 'Govern',
    'Evaluate AI systems for discriminatory outcomes using representative test data and established fairness metrics.',
    ['Fairness evaluation report; re-evaluation after model or data changes'], ['model'], 'none',
    'Out of scope. OSPREY monitors agent actions, not distributional fairness of model outputs.'],
  ['MC-12', 'Shared Responsibility Documentation', 'Govern',
    'For vendor or SaaS AI, document accountability boundaries, contractual obligations and assurance requirements.',
    ['Signed responsibility matrix; vendor due diligence records'], ['tools', 'model'], 'partial',
    'OSP-12 surfaces when a third-party component changes, which is the trigger for revisiting the responsibility matrix.'],
];

for (const [code, name, pillar, purpose, evidence, surfaces, ospreyCoverage, coverageNote] of ADG) {
  write(`adg-${code.toLowerCase()}`, {
    code, name, framework: 'adg', pillar, purpose, evidence, surfaces,
    ospreyCoverage, coverageNote, order: Number(code.split('-')[1]),
  });
}

console.log(`seeded ${AGSC.length} AGSC + ${ADG.length} ADG controls`);
