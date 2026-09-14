/**
 * Single place for everything that identifies the site.
 * Changing the project name, the nav, or the footer happens here — not in
 * a dozen templates.
 */

export const site = {
  name: 'OSPREY Governance Portal',
  short: 'OSPREY',
  tagline: 'Agentic threat detection, mapped to the controls that govern it.',
  description:
    'A living reference for Project OSPREY: the threat categories the platform detects, ' +
    'the governance and security controls each detection provides evidence for, and the ' +
    'benchmarks used to prove any of it works.',
  /** Shown in the footer. Kept deliberately free of internal review metadata. */
  maintainer: 'Project OSPREY · SafeAlign AI',
  repo: 'https://github.com/tarunbjoseph/osprey-portal',
} as const;

export const nav: readonly { href: string; label: string; exact?: boolean }[] = [
  { href: '/', label: 'Overview', exact: true },
  { href: '/threats', label: 'Threat register' },
  { href: '/crosswalk', label: 'Crosswalk' },
  { href: '/tracker', label: 'Sprint Tracker' },
  { href: '/frameworks', label: 'Frameworks' },
  { href: '/coverage', label: 'Coverage' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/models', label: 'Models' },
  { href: '/notes', label: 'Notes' },
  { href: '/changelog', label: 'Changelog' },
];

/** Labels for enum values, so components never hard-code prose. */
export const ACTION_LABELS: Record<string, string> = {
  monitor: 'Monitor',
  review: 'Review',
  block: 'Block',
  quarantine: 'Quarantine',
  kill: 'Kill',
};

export const ACTION_ORDER = ['monitor', 'review', 'block', 'quarantine', 'kill'] as const;

export const ACTION_DEFINITIONS: Record<string, string> = {
  monitor: 'Score the event and log it. No intervention.',
  review: 'Route to the human queue in the MOM Assistant. The agent keeps running.',
  block: 'Refuse the specific call, input or output. The session continues.',
  quarantine: 'Isolate the agent, the pipeline stage or the endpoint.',
  kill: 'Terminate the execution environment.',
};

export const TIER_LABELS: Record<string, string> = {
  HOOTL: 'Human out of the loop',
  HOTL: 'Human on the loop',
  HITL: 'Human in the loop',
};

export const TIER_DEFINITIONS: Record<string, string> = {
  HOOTL: 'Normal autonomous operation. The tier an untouched agent runs at.',
  HOTL: 'The agent continues inside its guardrails with a reviewer watching and able to intervene.',
  HITL: 'Every subsequent action needs explicit approval before it executes.',
};

export const SEVERITY_DEFINITIONS: Record<string, string> = {
  critical:
    'A confirmed instance means an agent acted, or could act, outside its authority with material consequence. Always blocks and always reaches a human.',
  high: 'A confirmed instance is a security event. Automatic containment is justified.',
  'medium-high': 'Depends on context. Contained where the action is destructive or irreversible.',
  medium: 'Logged and reviewed. No automatic containment in the current build.',
  low: 'Recorded for trend analysis only.',
};

export const HARM_LABELS: Record<string, string> = {
  operational: 'Operational',
  technical: 'Technical',
  societal: 'Societal',
  systemic: 'Systemic',
};

export const HARM_DEFINITIONS: Record<string, string> = {
  operational: 'Reliability, accuracy and business-impact failures. Easy to detect, individual in scope.',
  technical: 'Security, integrity and system-reliability failures. Easy to detect, systemic in scope.',
  societal: 'Bias, discrimination and human-rights impacts. Hard to detect, individual in scope.',
  systemic: 'Emergent risk from AI-to-AI interaction. Hard to detect, systemic in scope.',
};

export const INSTRUMENT_LABELS: Record<string, string> = {
  'slm-classifier': 'SLM classifier',
  'embedding-scorer': 'Embedding scorer',
  'sequence-model': 'Sequence model',
  statistical: 'Statistical / telemetry',
  deterministic: 'Deterministic check',
  derived: 'Derived signal',
  hybrid: 'Model + rules hybrid',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  'easy-medium': 'Easy–Medium',
  medium: 'Medium',
  hard: 'Hard',
};

export const VERIFICATION_LABELS: Record<string, string> = {
  verified: 'Verified',
  pending: 'Pending re-check',
  gap: 'No mapping exists',
  superseded: 'Superseded',
};

export const VERIFICATION_DEFINITIONS: Record<string, string> = {
  verified: 'The identifier was confirmed present, with this name, in the pinned framework version.',
  pending: 'Carried from an earlier revision and not re-confirmed against a reachable source. Safe internally; confirm before external citation.',
  gap: 'No published element in this framework models the behaviour. The internal control carries the row on its own.',
  superseded: 'The framework has shipped a newer version than the one this anchor was validated against.',
};
