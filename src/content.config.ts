import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

/* ==========================================================================
   OSPREY Governance Portal — content schemas
   --------------------------------------------------------------------------
   These schemas are the upgrade mechanism for the whole site.

   Every external framework OSPREY anchors to is versioned in `frameworks/`.
   Every anchor a threat or control makes is a *reference* to one of those
   frameworks plus an element id, carrying its own verification status. When a
   framework ships a new release you bump one file, and the site can then tell
   you exactly which anchors were validated against the old version and need
   re-checking — instead of that knowledge living in someone's head.

   Adding data never requires touching a component. Adding a *kind* of data
   means adding a collection here. See docs/DATA-MODEL.md.
   ========================================================================== */

/** How much confidence we have that an external identifier is real and current. */
export const VERIFICATION = ['verified', 'pending', 'gap', 'superseded'] as const;

/** Escalating platform response. Each rung assumes the ones below it. */
export const ACTIONS = ['monitor', 'review', 'block', 'quarantine', 'kill'] as const;

/** EC-Council ADG autonomy tiers, used as a consequence of detection. */
export const TIERS = ['HOOTL', 'HOTL', 'HITL'] as const;

/** EC-Council ADG four-class harm taxonomy. */
export const HARM = ['operational', 'technical', 'societal', 'systemic'] as const;

export const SEVERITY = ['critical', 'high', 'medium-high', 'medium', 'low'] as const;

/** Whether a label is an MVP detection target or a later-phase concern. */
export const SCOPE = ['core', 'secondary', 'out-of-scope'] as const;

/** What instrument owns the first-pass detection. */
export const INSTRUMENT = [
  'slm-classifier',
  'embedding-scorer',
  'sequence-model',
  'statistical',
  'deterministic',
  'derived',
  'hybrid',
] as const;

/** Maturity of anything on this site that is still being built. */
export const STATUS = ['stable', 'draft', 'planned', 'in-progress'] as const;

/**
 * An ISO date that tolerates both `2026-09-03` and `"2026-09-03"` in YAML.
 * Unquoted dates are parsed by the YAML loader into a Date, which is a
 * papercut every contributor hits exactly once. Accept both and normalise.
 */
const isoDate = z
  .union([z.string(), z.date()])
  .transform((v) => (typeof v === 'string' ? v : v.toISOString().slice(0, 10)));

/* -------------------------------------------------------------------------
   An anchor: "this thing maps to element X of framework Y".
   ------------------------------------------------------------------------- */
const anchor = z.object({
  /** Slug of an entry in the `frameworks` collection. */
  framework: reference('frameworks'),
  /** The element id inside that framework, e.g. "LLM01", "SEC-03", "MC-8". */
  id: z.string(),
  /** Human-readable element name, so a page reads without a lookup. */
  label: z.string().optional(),
  /** Whether this element is the centre of gravity or a supporting mapping. */
  weight: z.enum(['primary', 'supporting']).default('primary'),
  /** Why this mapping applies. One sentence, plain language. */
  rationale: z.string().optional(),
  /** Confidence in the identifier itself, not in the mapping. */
  verification: z.enum(VERIFICATION).default('pending'),
  /** ISO date the identifier was last checked against the live framework. */
  checked: isoDate.optional(),
});

/* -------------------------------------------------------------------------
   Frameworks — the version registry. Bump here, and every anchor inherits it.
   ------------------------------------------------------------------------- */
const frameworks = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/frameworks' }),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    /** The version string as the publisher writes it. */
    version: z.string(),
    /** Publication or release date of that version, ISO. */
    released: isoDate.optional(),
    /** ISO date this portal last validated anchors against it. */
    validated: isoDate.optional(),
    publisher: z.string(),
    url: z.string().url(),
    /** How to cite it in prose. */
    citation: z.string(),
    /** Where it sits in OSPREY's anchoring order. */
    role: z.enum(['internal-anchor', 'external-validation', 'regulatory']),
    /** One paragraph: what this framework is for and why OSPREY uses it. */
    summary: z.string(),
    /** Element id prefix, used to render and validate ids, e.g. "AML.T". */
    idPattern: z.string().optional(),
    /** Set when a newer release exists that anchors have not moved to yet. */
    supersededBy: z.string().optional(),
    order: z.number().default(50),
  }),
});

/* -------------------------------------------------------------------------
   Controls — AGSC controls and ADG minimum controls, in one shape.
   ------------------------------------------------------------------------- */
const controls = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/controls' }),
  schema: z.object({
    /** Control identifier as published, e.g. "SEC-03", "MC-8". */
    code: z.string(),
    name: z.string(),
    framework: reference('frameworks'),
    /** AGSC pillar (safety/alignment/governance/security) or ADG pillar. */
    pillar: z.string(),
    /** AGSC adoption tier T1/T2/T3, or ADG applicability. */
    tier: z.string().optional(),
    /** What the control asks for, in plain language. */
    purpose: z.string(),
    /** What an auditor should be able to see. This is what OSPREY produces. */
    evidence: z.array(z.string()).default([]),
    /** ADG governance surfaces this control operates on. */
    surfaces: z.array(z.string()).default([]),
    /** How much of this control OSPREY's runtime detections contribute to. */
    ospreyCoverage: z.enum(['direct', 'partial', 'indirect', 'none']).default('none'),
    coverageNote: z.string().optional(),
    order: z.number().default(50),
  }),
});

/* -------------------------------------------------------------------------
   Governance surfaces — ADG's nine, used as the coverage axis.
   ------------------------------------------------------------------------- */
const surfaces = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/surfaces' }),
  schema: z.object({
    name: z.string(),
    framework: reference('frameworks'),
    pillars: z.array(z.string()).default([]),
    scope: z.string(),
    objective: z.string(),
    coverage: z.enum(['direct', 'partial', 'indirect', 'foundational', 'out-of-scope']),
    coverageNote: z.string(),
    order: z.number().default(50),
  }),
});

/* -------------------------------------------------------------------------
   Threats — the register. The centre of the site.
   ------------------------------------------------------------------------- */
const threats = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/threats' }),
  schema: z.object({
    /** OSPREY threat id, e.g. "OSP-01". Carries no tier meaning. */
    code: z.string(),
    name: z.string(),
    /** One or two sentences a non-specialist stakeholder can follow. */
    behaviour: z.string(),
    /** What a detector could actually look at. Feeds telemetry requirements. */
    signals: z.array(z.string()).min(1),
    severity: z.enum(SEVERITY),
    severityNote: z.string().optional(),
    harmClasses: z.array(z.enum(HARM)).min(1),
    harmNote: z.string().optional(),
    scope: z.enum(SCOPE),
    scopeNote: z.string().optional(),

    /** Policy response. */
    action: z.object({
      /** Highest rung this threat is allowed to reach on a confident detection. */
      peak: z.enum(ACTIONS),
      /** What the platform does, in plain language. */
      summary: z.string(),
      /** Autonomy tier the agent holds after detection. */
      tier: z.enum(TIERS),
      humanReview: z.enum(['always', 'conditional', 'no']),
      reviewNote: z.string(),
    }),

    /** How the label is detected, and whether a model is the right instrument. */
    detection: z.object({
      instrument: z.enum(INSTRUMENT),
      method: z.string(),
      /** Estimated difficulty for a fine-tuned SLM. Omit or null when the label
       *  should not be a model output at all — which is a deliberate design
       *  statement, not a gap. */
      slmDifficulty: z.enum(['easy', 'easy-medium', 'medium', 'hard']).nullable().optional().default(null),
      rationale: z.string(),
      /** Whether Gate 1 F1/FNR should be measured over this label. */
      inGate1: z.boolean().default(false),
      /** Telemetry fields without which this label cannot be scored. */
      dependsOn: z.array(z.string()).default([]),
    }),

    /** Evidence this detection produces, for which control. */
    evidence: z.array(z.string()).default([]),

    anchors: z.array(anchor).default([]),

    /** Regulatory references, kept as text since they are cited not resolved. */
    regulatory: z.array(z.string()).default([]),

    /** Set when the category was added after the first published taxonomy. */
    addedIn: z.string().optional(),
    status: z.enum(STATUS).default('stable'),
    order: z.number().default(50),
  }),
});

/* -------------------------------------------------------------------------
   Benchmarks — how OSPREY proves any of this works.
   ------------------------------------------------------------------------- */
const benchmarks = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/benchmarks' }),
  schema: z.object({
    name: z.string(),
    shortName: z.string().optional(),
    /** What kind of question this benchmark answers. */
    kind: z.enum(['classification', 'containment', 'capability', 'robustness', 'cost']),
    purpose: z.string(),
    /** What it measures, stated so a stakeholder knows what a score means. */
    measures: z.array(z.string()).min(1),
    /** Metrics it produces. */
    metrics: z.array(z.object({
      name: z.string(),
      definition: z.string(),
      target: z.string().optional(),
      appliesTo: z.string().optional(),
    })).default([]),
    /** Which threat labels this benchmark exercises. */
    threats: z.array(reference('threats')).default([]),
    /** Project gate this benchmark backs, if any. */
    gate: z.string().optional(),
    status: z.enum(STATUS),
    statusNote: z.string().optional(),
    /** What is still unknown or unavailable. Honesty is the point here. */
    openQuestions: z.array(z.string()).default([]),
    source: z.object({ label: z.string(), url: z.string().url().optional() }).optional(),
    order: z.number().default(50),
  }),
});

/* -------------------------------------------------------------------------
   Models — the SLM candidates and the escalation layer.
   ------------------------------------------------------------------------- */
const models = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/data/models' }),
  schema: z.object({
    name: z.string(),
    vendor: z.string(),
    /** Parameter count as published, e.g. "3.8B". Text, since formats vary. */
    params: z.string().optional(),
    license: z.string().optional(),
    /** Where this model sits in the Detect/Classify/Escalate pipeline. */
    role: z.enum(['classifier', 'embedding', 'escalation', 'baseline', 'candidate']),
    rationale: z.string(),
    /** Deployment target, e.g. "NVIDIA DGX Spark". */
    hosting: z.string().optional(),
    status: z.enum(STATUS),
    /** Eval runs land here as they are produced. */
    evaluations: z.array(z.object({
      benchmark: reference('benchmarks'),
      date: isoDate.optional(),
      metric: z.string(),
      value: z.string(),
      note: z.string().optional(),
    })).default([]),
    source: z.object({ label: z.string(), url: z.string().url().optional() }).optional(),
    order: z.number().default(50),
  }),
});

/* -------------------------------------------------------------------------
   Notes — long-form markdown that does not fit a table.
   ------------------------------------------------------------------------- */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/data/notes' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    section: z.enum(['method', 'governance', 'evaluation', 'platform']),
    updated: isoDate,
    status: z.enum(STATUS).default('stable'),
    order: z.number().default(50),
  }),
});

export const collections = { frameworks, controls, surfaces, threats, benchmarks, models, notes };
