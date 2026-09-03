# OSPREY Governance Portal

A living reference for **Project OSPREY**: the agent behaviours the platform detects, the
governance and security controls each detection provides evidence for, and the benchmarks used to
show whether any of it works.

**A supplement to the [Agentic Governance & Security Controls (AGSC)][agsc] standard, not a
replacement for it.** AGSC answers what to control and why. This portal adds three things on top:
a runtime threat layer, a second governance anchor in the EC-Council ADG framework, and an
evaluation layer that reports whether the detections work rather than asserting that they do.

[agsc]: https://himjoe.github.io/Agentic-governance-and-security-controls-by-COHUMAIN-Labs-and-Safealign-AI/COHUMAIN-AGSC-repo/docs/

---

## Quick start

```bash
npm ci
npm run dev              # http://localhost:4321
npm run build            # static output in dist/
npm run validate:anchors # check every framework reference resolves
npm run check            # type-check components and content schemas
```

Requires Node 22 or newer.

---

## What is in here

| Section | What it holds |
| --- | --- |
| **Threat register** | Agent behaviours the platform detects, each with signals, severity, policy response and autonomy consequence |
| **Frameworks** | The version registry, plus the AGSC and ADG control catalogues |
| **Coverage** | Which governance surfaces and controls the detections actually reach, and which framework anchors still need checking |
| **Benchmarks** | How detections get proven — classifier accuracy for the labels a model owns, containment for everything else |
| **Models** | Candidates for the detection pipeline, with evaluation results as they arrive |
| **Notes** | The reasoning behind positions the rest of the site states as fact |

---

## The idea that makes it maintainable

Content is **data, not markup**. Every threat, control, framework, benchmark and model is a YAML
file validated against a Zod schema at build time. A malformed framework anchor fails the build
instead of quietly rotting in a document nobody re-reads.

Frameworks are **pinned to a version in one place**. A threat's anchors reference the framework
registry rather than restating a version inline, so an upgrade is a one-file change with a visible
blast radius:

```bash
# 1. bump the version in src/data/frameworks/<id>.yaml
# 2. get the exact work list
npm run validate:anchors -- --framework owasp-llm
# 3. re-check each identifier, update its verification state and checked date
```

Anchor **verification state is a first-class field** — `verified`, `pending`, `gap`, `superseded` —
so the site can say which identifiers are safe to quote externally and which are carried on trust.
`gap` is not a defect: it marks a behaviour no published external framework models, which is
exactly where the internal control catalogue is earning its keep.

---

## Adding content

No component needs touching to add data. Full detail in
[`docs/DATA-MODEL.md`](docs/DATA-MODEL.md); the short version:

**A threat category** — copy an existing file in `src/data/threats/`, keep the `OSP-nn` code
unique, and anchor it to at least one AGSC or ADG control. Its page, its place in the register and
its appearance in coverage views are all generated.

**An evaluation result** — append to the `evaluations` list in that model's file under
`src/data/models/`. The benchmark reference is validated at build time, so a typo fails the build
rather than rendering a dead link.

**A new framework** — add `src/data/frameworks/<id>.yaml` with its version, publisher, citation and
role. Anchors can reference it immediately.

**A note** — add a Markdown file to `src/data/notes/` with frontmatter. It appears in the index
automatically.

---

## Deployment

Pushing to `main` builds and deploys to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Pull requests are validated and
type-checked but never published.

**First push**, from inside this directory (it already has git history and two commits):

```bash
gh repo create osprey-portal --public --source=. --remote=origin --push
# or, without the gh CLI: create the empty repo on github.com first, then
git remote add origin https://github.com/<you>/osprey-portal.git
git branch -M main
git push -u origin main
```

Then in the repository settings, under **Pages**, set the source to **GitHub Actions**. The next
push deploys. The workflow resolves the site URL and base path itself, so nothing needs
configuring for a project site, a user site, or a custom domain.

If the repository name is not `osprey-portal`, nothing needs changing — the workflow reads the
base path from GitHub. The fallback in `astro.config.mjs` only affects local builds run without
those environment variables.

To deploy elsewhere (Cloudflare Pages, Netlify), set `SITE` and `BASE` environment variables and
publish the `dist/` directory.

---

## Project layout

```
src/
  content.config.ts   Zod schemas — the contract every data file is checked against
  site.config.ts      Site identity, navigation, and enum labels
  data/               The content. YAML for structured records, Markdown for notes
    frameworks/         Version registry: one file per external framework
    controls/           AGSC (25) and ADG (12) control catalogues
    surfaces/           ADG's nine governance surfaces
    threats/            The threat register
    benchmarks/         Evaluation definitions
    models/             Model candidates and their results
    notes/              Long-form Markdown
  lib/data.ts         Shared joins, so a schema change breaks one file not ten
  components/         Astro components; Register.tsx is the one React island
  pages/              Routes
  layouts/            Shell, navigation, theme handling
scripts/
  validate-anchors.mjs  Anchor integrity check; runs in CI
  seed-*.mjs            One-shot seeders that produced the initial catalogues
docs/                 Architecture, data model, contributing, roadmap
```

The `seed-*.mjs` scripts are kept as a record of how the initial catalogues were assembled and as
a template if a whole framework is ever imported at once. **The YAML files are the source of
truth** — edit those, not the seeders.

---

## Built with

Astro with React islands, static output, no runtime dependencies in the published site. Type
system: TypeScript with Zod schemas via Astro content collections.

---

## Status

Work in progress by design, and expected to keep growing past the initial project term. Sections
marked *planned* have their data model defined and their content still to come — an honest empty
state rather than an oversight. The [changelog](src/pages/changelog.astro) records what moved and
why.
