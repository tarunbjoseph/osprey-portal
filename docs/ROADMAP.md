# Roadmap

Checkpoints, so work can stop and resume without reconstructing context. Each one is
independently shippable — the site is never in a half-built state waiting for the next.

---

## Shipped

### CP1 — Scaffold and design system
Astro with React islands, static output, GitHub Pages workflow. Design tokens with a three-state
theme (explicit light, explicit dark, and the un-stamped system default), a type pairing, and a
semantic severity ramp kept separate from the accent so a critical row never reads as branding.

### CP2 — Data model
Zod schemas for frameworks, controls, surfaces, threats, benchmarks, models and notes. The anchor
type with its own verification state. This is the checkpoint everything else depends on: adding
content never requires touching a component.

### CP3 — Framework layer
Version registry for eight frameworks. AGSC's 25 controls across four pillars with adoption tiers;
ADG's 12 minimum controls with evidence requirements; ADG's nine governance surfaces.

### CP4 — Threat register
Sixteen categories with 148 resolved anchors. Filterable register, and a page per threat that
resolves every anchor to its framework entry.

### CP5 — Coverage and cross-linking
Surface coverage derived from anchors rather than asserted. Control coverage per catalogue.
Anchor verification register separating confirmed identifiers from carried ones. Bidirectional
links: a control page lists the threats producing evidence for it.

### CP6 — Evaluation layer
Benchmark and model schemas with the classifier/containment split built in. Five benchmarks and
six model entries defined, results pending.

### CP7 — Contributor documentation
README, data model reference, contributing guide, this roadmap. The anchor validator wired into
CI so a broken reference cannot reach the published site.

### CP8 — Full AGSC control detail
Every AGSC control carries its scope, key requirements, complete evidence list, review cadence,
worked example and the publisher's own framework mappings — and has its own deep-linkable page.
Discrepancies found while validating those mappings are flagged in place rather than corrected
silently.

### CP9 — Licensing and attribution
Dual licence (MIT code, CC BY-SA 4.0 content), a required `licence` field on every framework entry,
`NOTICE.md`, and an attribution page. The ADG-derived descriptions were rewritten because that
framework grants no reuse.

---

## Next

### CP10 — Telemetry requirements
The register already records what each detection `dependsOn`. Turn that into a first-class section:
every telemetry field, which threats need it, whether it exists today, and who owns getting it.
This is the highest-value next section because it is the binding constraint on most of the
register — several categories are undetectable without fields that may not exist yet.

*Depends on:* answers to the open questions carried on the threat pages.

### CP11 — First evaluation results
Populate `evaluations` on model entries as runs complete. Add a comparison view once more than one
model has been measured against the same benchmark.

*Depends on:* a trained checkpoint and a labelled evaluation set.

### CP12 — Dashboard requirements
The human-facing layer: what the operator view has to show, which fields come from which
detection, and how review routing works. Several threats already imply requirements — one is
explicitly a dashboard requirement rather than a runtime block.

---

## Later

### CP13 — Regulatory overlays
Regulatory references are currently text, cited rather than resolved. Promote the mappings that
matter to a structured overlay so a specific regime can be selected and the controls it demands
filtered — the same mechanism the framework registry uses, applied to obligations.

### CP14 — Architecture and pipeline documentation
How detection, classification, escalation and containment fit together, and where each threat
category is caught. Currently implicit in the register; worth being explicit for a stakeholder who
has not read it end to end.

### CP15 — Search
The register has search within itself. A site-wide index across threats, controls, frameworks and
notes becomes worth the weight once there is meaningfully more content.

### CP16 — Public presentation mode
A stripped view for demos and stakeholder walkthroughs: fewer controls, larger type, one idea per
screen. The content is already structured for it; this is a layout, not a rewrite.

---

## Deliberately not planned

**A CMS.** The data files are the interface. Adding an editing layer would add an operational
dependency and a second source of truth to a project whose main property is having one.

**Runtime data fetching.** The site is static on purpose: no backend to keep alive after the
project term, and no way for it to break while nobody is watching.

**Mirroring frameworks that do not permit it.** AGSC is reproduced in full because it is published
as an open standard and asks to be adopted. Everything else is referenced rather than mirrored —
partly because the publishers do that work better and it goes stale the moment they ship a release,
and partly because not all of them grant permission. `NOTICE.md` records which is which.
