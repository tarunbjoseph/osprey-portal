# Architecture

Why this is built the way it is. For *how* to add content, see
[DATA-MODEL.md](DATA-MODEL.md).

---

## The constraint that shaped everything

This site has to outlive the project term, be extended by people who did not build it, and stay
correct while external frameworks it references keep changing underneath it. Nobody will be paid
to maintain it full time.

That rules out a few otherwise reasonable choices and forces the rest.

**No backend.** A server is something that can break while nobody is watching, and something
someone has to keep paying for. The site builds to static files and is served from GitHub Pages.
If the team stops touching it for a year, it still works.

**No CMS.** An editing layer would mean an operational dependency and a second place the truth
could live. The data files *are* the interface, and Git is the audit trail.

**Content is data, not markup.** Prose in a template is invisible to tooling. The same content as
a validated record can be counted, cross-referenced, checked, and rendered several ways. Every
coverage figure on the site is computed, so none of them can be quietly wrong.

---

## Layers

```
data (YAML + Markdown)
  ↓  validated by Zod schemas at build time
content collections
  ↓  joined in src/lib/data.ts
pages (Astro) + one React island
  ↓  static build
dist/ → GitHub Pages
```

**Schemas** (`src/content.config.ts`) are the contract. A malformed anchor, an unknown enum value
or a reference to a framework that does not exist fails the build. This is the single most
important property of the codebase: content errors surface at build time, not as a wrong number on
a page a stakeholder is reading.

**Derivations** (`src/lib/data.ts`) hold every join. Which surfaces a threat touches, which threats
produce evidence for a control, the headline counts — all computed in one file. A schema change
breaks one file rather than ten pages, and no two pages can compute the same figure differently.

**Pages** mostly map data to markup. The interesting logic is upstream.

---

## Three decisions worth explaining

### Frameworks are references, not strings

An anchor could have been `owasp: "LLM01"`. Instead it is a reference into a `frameworks`
collection that holds the version, the citation and the validation date.

This is what makes an upgrade tractable. Bump one file and every anchor inherits the new version;
run the validator and you have the exact list of identifiers that need re-checking. Without it,
"which of our references were checked against the old OWASP list" is an unanswerable question, and
the honest answer six months later is "nobody knows".

### Verification is about the identifier, not the mapping

Whether `AML.T0053` still exists under that name is a different question from whether it is the
right technique for tool-chain exploitation. Conflating them means either over-claiming (marking a
mapping verified because the ID looks plausible) or under-claiming (treating a solid mapping as
doubtful because a version moved).

Keeping them separate lets the site say "safe to quote externally" and mean it. `pending` is a
first-class, non-blocking state — it appears in the UI, it never fails the build, and it is more
useful than a silent assumption.

### Coverage is derived, never asserted

A surface's coverage comes from the controls its threats anchor to. Nobody maintains a
threat-to-surface list by hand, so it cannot go stale.

This was tested the hard way during the build: the first version of the surface notes enumerated
threat codes in prose, and within a day the prose disagreed with the derivation. The prose was
wrong. Those notes now describe coverage *character* and let the generated chips enumerate.

---

## Why Astro, and where React appears

Astro renders to static HTML with zero client JavaScript by default, which is right for a
reference site that is overwhelmingly read rather than operated. Its content collections give the
Zod validation the whole design depends on.

Exactly one component is a React island: the threat register's filter interface. Four filter axes
with a live count and a search box is genuine client state. Everything else — including the
per-threat pages, coverage views and control catalogues — is static HTML.

The rule for adding interactivity: if it needs client state, it is an island; if it can be
computed at build time, it should be.

---

## Theming

Three states, not two. An explicit choice stamps `data-theme` on the root; the default "system"
setting stamps nothing and relies on `prefers-color-scheme`.

Every token is declared in the bare `:root` block *before* any conditional block redefines it. A
colour defined only inside a media query or `[data-theme]` block renders one theme's text on the
other theme's background in the un-stamped state — the classic way pages like this break. The
theme choice is stored in `localStorage` and applied before first paint by an inline script, so
there is no flash.

Semantic severity colours are deliberately separate from the accent, so a critical row never reads
as branding and the accent never reads as an alarm.

---

## CI

`.github/workflows/deploy.yml` runs three checks before anything publishes:

1. `validate:anchors` — structural integrity of the data layer
2. `astro check` — types and content schemas
3. `astro build` — the real test

Pull requests run all three and deploy nothing. Only `main` publishes.

The validator runs *first* deliberately. An anchor pointing at a framework that does not exist is
a content error, and content errors should be caught before the type checker starts.

---

## What would need rethinking at 10× the content

The current design comfortably handles a few hundred records. Beyond that:

- **Search** would need a real index (Pagefind builds one at build time and stays static).
- **The register island** loads all rows at once. Fine at 16, wrong at 500 — it would need
  pagination or virtualisation.
- **Derivations** recompute on every page. Astro caches within a build, but a large graph would
  want memoisation in `lib/data.ts`.

None of these are near, and building for them now would cost clarity today for a scale that may
never arrive.
