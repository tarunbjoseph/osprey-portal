---
title: Which detections a model should own
summary: Why most categories in the register are not classification problems, and what that means for how accuracy is reported.
section: evaluation
updated: 2026-09-03
status: stable
order: 40
---

The instinct on a project built around a fine-tuned classifier is to route everything through it.
Reading the register against the controls it anchors to says otherwise, and the split is worth
stating plainly because it changes how results should be read.

## The split

Of the sixteen categories, ten involve a model at some point. Only five are genuine first-pass
classification problems. Six should never produce a model output at all.

That is not a limitation to engineer around — it is what the governance controls already imply.
AGSC SEC-02 asks whether an agent acted inside its declared authorization; that is a lookup
against a register, and a classifier asked to infer it would only add false negatives to something
that can be exact. AGSC SAF-02 asks whether containment can be activated and tracked; that is a
runtime fact. ADG MC-7 asks for a tool register with per-tool approval status; comparing an
observed call against it is arithmetic.

## The instruments

**Classification** — where a span of text carries the signal and labelled examples can be
generated. Direct prompt injection is the clean case: one input, a clear positive class, plentiful
synthetic data.

**Embedding and sequence models** — where the malicious unit is a trajectory rather than a span.
Goal drift is a distance over a session; tool-chain exploitation is a sequence. Both need
trajectory telemetry and a per-task baseline far more than they need a better model.

**Statistical checks** — where the answer is a count or an outlier. Token spend, fan-out ratio and
retry counts are arithmetic, and arithmetic beats inference on speed, cost and accuracy.

**Deterministic checks** — where the answer is a fact. Scope violations, protocol authentication,
signature diffs, sandbox boundary events. Inference here is strictly worse than reading.

**Derived signals** — computed by correlating other detectors. Cascading failure has no single
input to classify; it is a correlation across a workflow.

**Second-pass judgement** — where a mechanical comparison produces the candidate and a model
judges materiality. Whether a statistical outlier was contextually justified, or whether the gap
between an agent's summary and its actions matters. Labelled data barely exists for these, so they
start as rules plus a dashboard column.

## What it means for reporting

Accuracy metrics should be computed **only over the labels a model owns**. Including deterministic
labels inflates the number without saying anything about the classifier — and a stakeholder
reading a single blended figure will reasonably assume it describes the model.

Two numbers, both labelled, is the honest presentation: classifier accuracy over the model-owned
labels, and containment rate over the deterministic and derived ones. Deterministic labels still
need testing, just not through an F1 — they belong in the containment measurement, which asks
whether the platform stopped the attack rather than whether a model named it.

One further caution. The label most likely to reach target first is the easiest one, and an early
strong number is not representative of the rest. Report per-label results alongside any average,
so a strong label cannot carry a weak one.
