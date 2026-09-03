---
title: Autonomy tiers as a consequence, not a label
summary: Why a detection should downgrade how much autonomy an agent keeps, and what that requires from the platform.
section: governance
updated: 2026-09-03
status: stable
order: 20
---

Most threat taxonomies answer "does this need human review?" with a yes or a no, decided row by
row. That produces a column of judgement calls with no rule behind it, and no way to tell whether
two rows were decided consistently.

The EC-Council ADG framework offers something better. It defines three operational autonomy
tiers, each with its own minimum governance requirements:

- **HOOTL** — human out of the loop. The agent executes multi-step goals with limited or delayed
  human review. ADG only considers this defensible with strong telemetry, circuit breakers,
  forensic replay and periodic governance review behind it.
- **HOTL** — human on the loop. The agent acts within pre-approved limits and constrained tools,
  with a reviewer watching and able to intervene.
- **HITL** — human in the loop. The agent recommends or drafts; a person approves before anything
  executes.

## The rule

This portal uses those tiers as a *consequence* rather than a description. A detection does not
only raise an alert — it changes how much autonomy the agent keeps for the rest of the session:

| Detection reaches | Agent drops to |
| --- | --- |
| Review | HOTL for the remainder of the session |
| Block or Quarantine | HITL |
| Kill | Session terminated; any restart begins at HITL |

Individual categories override this where the reasoning is specific, and each threat page states
its own rule. But the default is the default for a reason: ADG's own position is that the
autonomous tier is only defensible while its supporting controls are demonstrably working. A live
detection is evidence that at least one of them is under strain. Continuing at full autonomy after
that is a governance claim the evidence no longer supports.

## What it demands of the platform

The rule assumes something the platform may not do yet: it has to be able to *change* an agent's
autonomy tier mid-session, not merely record that it should have.

If the tier is only a dashboard annotation, every human-review column on this site is aspirational
and should be read that way. That is a live question for the platform architecture rather than a
documentation detail, and it is one of the open questions carried on the register.

## Why it beats a yes/no column

Three things improve at once. The decision becomes reviewable, because a reader can check a row
against the rule instead of trusting the author. It becomes proportionate, since the response
scales with what was actually observed rather than with the category's worst case. And it maps
directly onto an external framework, so an auditor asking how human oversight is implemented gets
a mechanism rather than a policy statement.
