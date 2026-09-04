# Attribution and third-party terms

This project maps onto external governance and security frameworks. Their licensing terms are not
uniform, and one of them does not permit reuse at all. This file records what is used, from where,
and under what permission.

**None of this is legal advice.** Anyone publishing this content commercially, or extracting parts
of it into another product, should have it reviewed.

---

## Summary

| Source | Terms | What this project does with it |
| --- | --- | --- |
| [AGSC v1.0][agsc] | Open standard, explicitly "free to adopt and adapt" | Full control detail reproduced with attribution: scope, requirements, evidence, review cadence, worked examples and the publisher's own framework mappings |
| [MITRE ATLAS][atlas] | Apache License 2.0 | Tactic and technique identifiers and names referenced |
| [OWASP LLM Top 10][owasp] · [OWASP ASI Top 10][asi] | **CC BY-SA 4.0** | Entry identifiers, names, and some derived relevance descriptions |
| [EC-Council ADG v1.0][adg] | **No licence granted** | Identifiers and element names only; all descriptive prose independently written |
| [NIST AI RMF][nist] | US Government work, public domain (17 U.S.C. § 105) | Function names cited |
| [EU AI Act][euact] | EU legal text; Commission material reusable under Decision 2011/833/EU | Article numbers cited |
| [ISO/IEC 42001:2023][iso] | **Copyrighted, sold by ISO. Not reproducible.** | Clause identifiers cited only; no standard text reproduced |

---

## The two that need care

### EC-Council ADG — no licence exists

The ADG white paper carries no copyright notice, no Creative Commons licence, no "free to adopt"
statement, and no terms of use. Default copyright therefore applies: all rights reserved.
EC-Council is a commercial certification body, and the document itself names certification
architecture as one of its intended uses, so this is unlikely to be an oversight.

**What that means in practice.** This project uses ADG's structure as a mapping target — the
twelve minimum control identifiers, the nine governance surface names, the three autonomy tiers
and the four harm classes. Naming a framework's elements in order to map onto them is ordinary
interoperability practice: the identifiers are short factual references, and a crosswalk cannot
function without them.

What copyright protects is the expression, and **every descriptive sentence attached to an ADG
element in this repository was written independently for this project.** An earlier revision
paraphrased the source too closely and was rewritten in full
(see `scripts/reword-adg.mjs`, which documents the change and the reasoning).

**If you extend this project:** do not paste ADG text into a data file. Read what the control
requires, then state it in your own words. If EC-Council later publishes an open licence or grants
permission, this constraint can be lifted — record it here when it happens.

### OWASP — CC BY-SA 4.0 carries a condition

Both OWASP lists are published under Creative Commons Attribution-ShareAlike 4.0. The ShareAlike
term is the consequential part: a work substantially derived from CC BY-SA material must itself be
licensed CC BY-SA.

Some anchor rationales in `src/data/threats/` are closely derived from the relevance descriptions
in the OWASP 2026 framework-mapping appendix. That is a permitted derivation, and licensing the
content of this repository under CC BY-SA 4.0 is what makes it permitted.

**The practical consequence:** the content in `src/data/` and `docs/` cannot later be made
proprietary. Publishing it, linking to it, and using it commercially are all fine — relicensing it
under closed terms is not. If a closed derivative is ever needed, the OWASP-derived expression
would have to be rewritten first, exactly as the ADG material was.

---

## The ones that are straightforwardly fine

**AGSC v1.0** states on its cover that it is an "Open standard | vendor-neutral | free to adopt and
adapt", and its closing section confirms that organisations may adopt, adapt and operationalise
the controls. This is the one framework whose content is reproduced in full here — scope,
requirements, evidence, review cadence and worked examples for all twenty-five controls — because
that is what the publisher intends and asks only that it be cited as:

> Joshi, H., & Gandhi, D. (2026). *Agentic Governance & Security Controls (AGSC): Field Guide for
> Enterprise Leaders* (Edition v1.0). COHUMAIN Labs & SafeAlign AI.

**MITRE ATLAS** data is distributed under the Apache License 2.0, with the release statement
"©2021–2026 The MITRE Corporation. ALL RIGHTS RESERVED. Approved for Public Release; Distribution
Unlimited." Only identifiers and element names are used here.

**NIST AI RMF** is a work of the United States government and not subject to domestic copyright.

**EU AI Act** article numbers are citations to legislation. Legislative text is not
copyright-restricted in any way that affects citing an article number.

**ISO/IEC 42001** is a different case from the rest: ISO standards are copyrighted works sold by
ISO, and their text may not be reproduced. This project cites clause identifiers (`A.6.2`, `A.9`)
and nothing else. **Do not add ISO clause text to this repository**, even in summary — a clause
identifier is a citation, a clause summary is a derivative work.

---

## Software and fonts

| Component | Licence |
| --- | --- |
| Astro, React, Zod, js-yaml, TypeScript | MIT |
| IBM Plex Sans, IBM Plex Mono | SIL Open Font License 1.1 |
| Archivo | SIL Open Font License 1.1 |

Fonts are loaded from Google Fonts rather than bundled, so no font files are redistributed here.

---

## Before publishing this anywhere official

Three things are worth a second look, and none of them are settled by this file:

1. **Confirm the ADG position with EC-Council** if the site will carry SafeAlign or COHUMAIN
   branding. Mapping to a framework is normal practice, but a commercial publisher's view of what
   counts as mapping versus reproduction is worth having in writing rather than inferring.
2. **Decide whether CC BY-SA suits the project's future.** It is a good fit for an open governance
   reference and a poor one for something that later needs to be closed.
3. **Have it reviewed** if this becomes a commercial deliverable rather than a project artifact.
   The analysis here is careful but it is not a legal opinion.

[agsc]: https://himjoe.github.io/Agentic-governance-and-security-controls-by-COHUMAIN-Labs-and-Safealign-AI/COHUMAIN-AGSC-repo/docs/
[atlas]: https://atlas.mitre.org/
[owasp]: https://genai.owasp.org/
[asi]: https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
[adg]: https://www.eccouncil.org/adgframework/
[nist]: https://airc.nist.gov/airmf-resources/airmf/
[euact]: https://eur-lex.europa.eu/eli/reg/2024/1689/oj
[iso]: https://www.iso.org/standard/42001
