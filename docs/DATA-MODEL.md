# Data model

Everything on this site is generated from validated data files. Understanding the shapes below is
enough to contribute content without touching a component.

The authoritative definition is [`src/content.config.ts`](../src/content.config.ts). This document
explains the reasoning; the schema file is what actually runs.

---

## The core idea: anchors

An **anchor** says "this thing maps to element X of framework Y". Anchors are what tie the threat
register to the governance layer, and they are deliberately more than a string.

```yaml
anchors:
  - framework: agsc          # reference into the frameworks collection
    id: SEC-03               # element id within that framework
    label: Prompt Injection & Adversarial Input Defense
    weight: primary          # primary | supporting
    rationale: The control this label exists to provide evidence for.
    verification: verified   # verified | pending | gap | superseded
    checked: "2026-09-03"
```

Three fields carry most of the value.

**`framework` is a reference, not a string.** It resolves against the `frameworks` collection at
build time, so a typo fails the build. It also means the version shown next to an identifier always
comes from one place — bump the framework file and every anchor inherits it.

**`verification` is about the identifier, not the mapping.** Whether `AML.T0053` still exists under
that name is a different question from whether it is the right technique for this threat. Keeping
them separate is what lets the site say "safe to quote externally" honestly.

**`rationale` is required in practice.** A mapping with no stated reason cannot be reviewed, and an
unreviewable mapping is decoration.

### Verification states

| State | Meaning |
| --- | --- |
| `verified` | Confirmed present, with this name, in the pinned framework version |
| `pending` | Carried from an earlier revision, not re-confirmed against a reachable source. Fine internally; confirm before external citation |
| `gap` | No published element in this framework models the behaviour. Set `id: "—"` and explain in `rationale` |
| `superseded` | The framework shipped a newer version than the anchor was validated against |

`gap` is a finding, not a defect. It marks where the internal control catalogue is doing work no
external list does. Do not delete a gap because a new release *probably* covers it — confirm first.

---

## Collections

### `frameworks/` — the version registry

One file per external framework. This is the upgrade mechanism: everything else references it.

| Field | Notes |
| --- | --- |
| `name`, `shortName` | Full name and the label used in chips and tables |
| `version` | As the publisher writes it. Free text, because publishers disagree about format |
| `released`, `validated` | ISO dates. Unquoted YAML dates are accepted and normalised |
| `publisher`, `url`, `citation` | Attribution, and how to cite it in prose |
| `role` | `internal-anchor` · `external-validation` · `regulatory` — decides grouping and anchoring order |
| `summary` | One paragraph: what it is and why this project uses it |
| `supersededBy` | Set when a newer release exists but anchors have not migrated. Renders a banner |
| `order` | Sort weight. Internal anchors sort first everywhere |

### `controls/` — AGSC and ADG catalogues

Both catalogues share one shape, which is what lets coverage views treat them uniformly.

| Field | Notes |
| --- | --- |
| `code` | As published: `SEC-03`, `MC-8` |
| `framework` | Reference. Anchors resolve `framework:code` against this |
| `pillar` | AGSC pillar or ADG pillar |
| `tier` | AGSC adoption tier (`T1`/`T2`/`T3`). Omit for ADG |
| `purpose` | What the control asks for, in plain language |
| `evidence` | What an auditor should be able to see. This is what detections produce |
| `surfaces` | ADG governance surfaces the control operates on. **Threat surface coverage is derived from this** rather than restated per threat |
| `ospreyCoverage` | `direct` · `partial` · `indirect` · `none` |
| `coverageNote` | Honest prose about what is and is not covered |

### `surfaces/` — ADG's nine governance surfaces

The coverage axis. Coverage of a surface is computed from the controls threats anchor to, so the
two can never drift apart.

### `threats/` — the register

The largest shape. Grouped into behaviour, response, and detection.

```yaml
code: OSP-14
name: Resource Exhaustion & Denial of Wallet
scope: core                    # core | secondary | out-of-scope
addedIn: v1.0                  # optional; renders a "new" tag

behaviour: >-                  # plain language, for a non-specialist stakeholder
  The agent consumes compute, tokens or spend far beyond what the task warrants…
signals:                       # what a detector could actually look at
  - Thinking or output token spend far above baseline for the task type

severity: medium-high          # critical | high | medium-high | medium | low
severityNote: High where spend is uncapped…
harmClasses: [operational, technical]   # ADG four-class taxonomy

action:
  peak: block                  # highest rung on a confident detection
  summary: Monitor against a hard budget ceiling…
  tier: HOTL                   # autonomy the agent holds after detection
  humanReview: conditional     # always | conditional | no
  reviewNote: The circuit-break is automatic…

detection:
  instrument: statistical      # what owns the first pass
  method: Budget counters and fan-out thresholds per session
  slmDifficulty: null          # null = should not be a model output at all
  rationale: Token spend and retry counts are counters…
  inGate1: false               # is classifier accuracy measured over this label
  dependsOn:                   # telemetry without which it cannot be scored
    - Per-session token and cost telemetry

evidence: [...]                # what this detection produces, for which control
anchors: [...]
regulatory: [...]              # text, cited rather than resolved
```

Two fields deserve emphasis.

**`slmDifficulty: null` is a design statement.** It means the label should not be a model output,
not that it is unimportant — several `null` labels are `critical` severity. Comparing a call
against a declared scope is a lookup; routing it through a classifier adds false negatives to
something that can be exact.

**`inGate1` decides what a reported accuracy number means.** Only labels with `inGate1: true` should
appear in a classifier metric. Everything else is measured by containment.

### `benchmarks/` and `models/`

Evaluation results attach to a **model**, not to a benchmark, and reference the benchmark:

```yaml
evaluations:
  - benchmark: classifier-gate   # validated reference
    date: "2026-11-14"
    metric: Macro F1
    value: "0.83"
    note: Over five model-owned labels; per-label breakdown in the run log
```

The benchmark reference is checked at build time. Adding a result means editing one model file —
no page needs changing.

`openQuestions` on a benchmark is deliberately part of the schema. What is still unknown about a
measurement is as informative as the measurement, and burying it in a comment loses it.

### `notes/`

Markdown with frontmatter: `title`, `summary`, `section`, `updated`, `status`, `order`. For
reasoning that does not fit a table.

---

## Conventions

**Dates** are ISO. Both `2026-09-03` and `"2026-09-03"` work — the schema normalises the Date
object the YAML loader produces from an unquoted date.

**`order`** controls sort position everywhere. Lower sorts first. Leave gaps (10, 20, 30) so
inserting later does not mean renumbering.

**Prose fields are written for a reader, not a parser.** `behaviour` should make sense to someone
who has never seen the register. `rationale` should survive being read aloud in a review.

**Nothing is asserted as more settled than it is.** `status: planned` with no content is a better
answer than invented content, and the site renders it as a deliberate state.
