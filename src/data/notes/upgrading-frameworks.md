---
title: Upgrading when a framework ships a new version
summary: The procedure for absorbing a new OWASP, ATLAS, AGSC or ADG release without re-litigating the whole threat model.
section: method
updated: 2026-09-03
status: stable
order: 30
---

External frameworks move on their own schedule. OWASP re-ranked its list on incident evidence and
re-scoped an entry outright in its 2026 release; MITRE ATLAS added most of its agent-specific
techniques after the AGSC catalogue was published. A threat model anchored only to external
identifiers has to be reopened every time one of them ships.

This portal is built so that a new release is a bounded task with a visible blast radius.

## The mechanism

Frameworks live in their own collection with a pinned `version` and a `validated` date. Threats
never restate a version inline — they reference the framework entry. So the version a reader sees
next to an identifier always comes from one place.

Each anchor also carries its own `verification` state and the date it was last checked. That is
deliberately about the *identifier*, not the mapping: whether `AML.T0053` still exists under that
name is a different question from whether it is the right technique for tool-chain exploitation.

## The procedure

1. **Bump the framework file.** Update `version`, `released`, and set `supersededBy` if you are
   recording the new release before migrating to it. The banner on that framework's page appears
   automatically.

2. **Run the validator.** `npm run validate:anchors` reports every anchor pointing at the
   framework you changed, grouped by threat, with its current verification state. That report is
   the work list.

3. **Re-check the identifiers.** For each one, confirm it still exists in the new version under
   the name used here. Set `verification: verified` and update `checked`, or set `pending` and say
   why in `rationale`. If the element was removed or renamed, `superseded` records that honestly
   until someone decides what replaces it.

4. **Re-read the mappings that moved.** A re-ranking rarely changes whether a mapping is correct,
   but a re-scoping does. When OWASP folded System Prompt Leakage into a broader Hidden Context
   Exposure entry, the identifier changed *and* so did what it covered. Those are the ones worth
   real attention.

5. **Record it.** Add a changelog entry saying what moved and what it changed. A version bump with
   no note is indistinguishable from a typo six months later.

## What not to do

Do not update an anchor's `checked` date without actually checking it. The date is the only thing
separating a verified identifier from a plausible one, and its value is entirely in being true.

Do not delete a `gap` anchor because a new release *probably* covers it now. Confirm first — the
recorded gaps are where the internal control catalogue is doing work no external framework does,
and quietly dropping one loses that signal.
