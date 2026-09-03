---
title: How to read this portal
summary: What the sections are for, what the states mean, and how to tell a settled position from a working draft.
section: method
updated: 2026-09-03
status: stable
order: 10
---

This is a reference, not a report. It is meant to be opened when a question comes up — what
does this threat category actually mean, which control does it satisfy, is that framework
identifier safe to quote — rather than read front to back.

## The four layers

**The threat register** is the centre. Each category states a behaviour in plain language, the
signals a detector could look at, the platform's response, and the governance controls the
detection provides evidence for. If you only read one section, read this one.

**The framework layer** holds the control catalogues and the version registry. Every framework
is pinned to a version, and every reference on the site inherits that pin. This is what makes an
upgrade a bounded task instead of an archaeology exercise.

**Coverage** is the honest accounting: which governance surfaces the platform reaches, which
controls it produces evidence for, and which framework identifiers still need checking.

**Evaluation** is how any of it gets proven, and is deliberately split in two — classifier
accuracy over the labels a model owns, containment over everything else.

## States you will see

Nothing here is presented as more settled than it is.

- **Stable** — the position is settled and the team is building against it.
- **In progress** — the shape is agreed, the content is filling in.
- **Planned** — the schema exists so results can land without a redesign. The absence of content
  is the accurate state, not an oversight.

Framework anchors carry their own state, which is about the *identifier* rather than the mapping:

- **Verified** — the identifier was confirmed present, with the name used here, in the pinned
  version.
- **Pending re-check** — carried from an earlier revision and not re-confirmed against a
  reachable source. Fine for internal work; confirm before citing externally.
- **No mapping exists** — no published element in that framework models the behaviour. These
  are worth noticing: they are where the internal control catalogue is doing work no external
  list does.

## Severity and action are separate on purpose

Severity answers *how bad is this if it is real*. The action ladder answers *what should the
platform do about it*. Keeping them apart is what allows the single most important rule on the
site: **confidence, not category, decides how far up the ladder an event travels.** A critical
category detected with low confidence goes to Review, not to Kill.

A platform that escalates on category alone becomes the outage it was installed to prevent.

## What this is not

It is not a compliance attestation. Regulatory references are pointers inherited from the AGSC
and ADG per-control mappings, cited for traceability rather than derived from an independent
legal reading. Anyone making a compliance claim should verify against the source text with their
own risk and legal function.

It is also not a replacement for the AGSC standard. AGSC answers what to control and why; this
portal adds the runtime threat layer, the ADG mapping, and the evidence that shows whether the
controls are operating.
