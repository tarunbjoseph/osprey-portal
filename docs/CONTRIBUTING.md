# Contributing

The point of this repository is that adding content does not require reading the code. If you find
yourself editing a component to add a threat, a control or a result, something has gone wrong —
say so rather than working around it.

---

## Before you start

```bash
npm ci
npm run dev
```

Then make your edit and watch it appear. The dev server reloads on data-file changes.

Before opening a pull request:

```bash
npm run validate:anchors   # every framework reference resolves
npm run check              # types and content schemas
npm run build              # the real test
```

CI runs all three. A pull request that fails validation is not published.

---

## Adding a threat category

1. Copy the closest existing file in `src/data/threats/`.
2. Give it a unique `OSP-nn` code. The number carries no meaning — it is an identifier, not a
   ranking or a tier.
3. Fill in `behaviour` for someone who has never seen the register. If a reader needs the rest of
   the page to understand the sentence, rewrite the sentence.
4. Write `signals` as things a detector could actually observe. "Suspicious activity" is not a
   signal; "tool-call sequences absent from the baseline" is.
5. Anchor it to **at least one AGSC or ADG control**. The validator enforces this. A threat with no
   control anchor is an observation, not a governed risk.
6. Set `detection.slmDifficulty: null` if the label should not be a model output. This is a design
   statement, not a gap — say why in `rationale`.
7. Set `inGate1: true` only if classifier accuracy should be measured over this label.

Its page, its place in the register, and its appearance in every coverage view are generated.

## Adding an evaluation result

Append to `evaluations` in that model's file under `src/data/models/`:

```yaml
evaluations:
  - benchmark: classifier-gate
    date: "2026-11-14"
    metric: Macro F1
    value: "0.83"
    note: Over five model-owned labels; per-label breakdown in the run log
```

Report the metric you actually computed. "Macro F1 over model-owned labels" and "F1" are different
claims, and the first one is the true one.

## Updating a framework version

Follow [Upgrading when a framework ships a new version](../src/data/notes/upgrading-frameworks.md).
Short form: bump the framework file, run `npm run validate:anchors -- --framework <id>` for the
work list, re-check each identifier, and add a changelog entry.

Do not update an anchor's `checked` date without checking it. That date is the only thing
separating a verified identifier from a plausible one.

## Adding a note

Markdown in `src/data/notes/` with frontmatter (`title`, `summary`, `section`, `updated`,
`status`, `order`). Notes are for reasoning that does not fit a table — why a decision went the way
it did, not what the decision was.

---

## Writing style

The site is read by people deciding whether to trust it: reviewers, technical leads, and
eventually stakeholders outside the team. A few conventions hold that together.

**State the limitation.** "Only partly covered — the platform governs actions rather than generated
content" is more useful than silence, and far more useful than a coverage claim that does not
survive a question.

**Prefer the concrete.** "Reads a secret with one tool and transmits it with another" beats
"performs unauthorized data operations".

**Avoid asserting confidence you do not have.** `status: planned` with no content is a better
answer than invented content. `verification: pending` is a better answer than an unchecked
`verified`.

**No internal review metadata in content.** Owner names, approval status, draft version numbers
and review deadlines belong in the project tracker, not on a page a stakeholder may open in six
months. Framework versions, validation dates and content status are different — those help a
reader judge the material, so keep them.

---

## Licensing rules that bind contributions

Contributions are accepted under the repository's terms: MIT for code, CC BY-SA 4.0 for content.
Two rules follow from what the referenced frameworks permit, and both matter more than they look.

**Never paste framework text into a data file.** The EC-Council ADG white paper carries no licence
grant, and ISO/IEC 42001 is a copyrighted standard sold by ISO. Read what the control requires,
then write what it requires in your own words. Identifiers and element names are fine — a
crosswalk cannot work without them — but the prose has to be yours.

**Check the terms before adding a framework.** The `licence` field on a framework entry is
required, so the schema will stop you, but the schema cannot tell you what the answer is. Find the
publisher's terms, record them, and set `reuse` honestly. If no licence exists, `identifiers-only`
is the correct answer and the descriptions have to be written from scratch.

When in doubt, [`NOTICE.md`](../NOTICE.md) has the reasoning for every source already in the
project.

---

## Code changes

Adding a *kind* of data means adding a collection to `src/content.config.ts` and a page to render
it. Adding a *view* over existing data usually means adding a derivation to `src/lib/data.ts`
rather than querying collections directly in a page — that keeps the joins in one place, so a
schema change breaks one file instead of ten.

Components are Astro by default. Reach for a React island only when the interaction genuinely needs
client state; the register is currently the only one that does.

Colours come from the tokens in `src/styles/tokens.css`. Every token is defined in the bare `:root`
block before any media query or `[data-theme]` block redefines it — a colour defined only inside a
conditional block renders one theme's text on the other theme's background, which is the classic
way these pages break.
