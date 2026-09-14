---
title: "Four-Dataset Crosswalk & Taxonomy Reconciliation"
summary: "How the four 10K dataset vocabularies were collapsed into the 16 canonical OSPREY threats, resolving generator shortcuts, sequence blindspots, and vocabulary conflicts."
section: "method"
updated: "2026-09-14"
status: "stable"
order: 25
---

The foundation of Project OSPREY's detection and classification loop is a single canonical taxonomy. Across the initial 10,000-record synthetic extract (`OSPREY_Dataset_10K (1).xlsx`), four separate vocabularies were shipped:

- **Dataset A (Agentic Pipeline Telemetry):** 9 anomaly classes + `none` (2,510 rows)
- **Dataset B (SLM Inference Logs):** 6 threat types + `none` (2,510 rows)
- **Dataset C (Threat & Compliance Reference Corpus):** 17 threat categories (2,510 rows)
- **Dataset D (Synthetic Red-Team Scenarios):** 10 attack vectors (2,510 rows)

Without a verified crosswalk, these datasets could not be cross-validated or joined. This note records how the crosswalk was derived, the data defects identified, and the architectural principles enforced.

---

## Two findings that govern every metric

### 1. The Synthetic Latency Shortcut (Defect D-01)
In Dataset A, normal events exhibit execution latency between 80 and 320 ms, while anomalous events run between 300 and 750 ms. The single heuristic:

$$\text{latency\_ms} > 320 \implies \text{Precision} = 1.000,\; \text{Recall} = 0.958,\; F_1 = 0.979$$

Similarly, $\text{confidence\_score} < 0.90$ scores Precision 1.000, Recall 0.743, and $F_1 = 0.853$. Both Gate 1 targets ($F_1 \ge 0.82$ in Phase 3; $F_1 \ge 0.88$ in the two-gate cycle) are trivial artifacts of the synthetic data generator.

**Consequences:**
- Sprint 2 builds the **pipeline, not the proof**. The synthetic workbook is fit for plumbing, ingest, feature engineering, and eval harness construction — not for declaring the classifier works.
- Every evaluation run reports a **mandatory rule-baseline** alongside the model score. A model that merely matches the baseline has learned nothing.
- Gate 1 cannot be declared passed on synthetic data.

### 2. The Sequence-Property Blindspot (Defect D-07 / Q4)
Three of Dataset A's nine anomaly classes — `tool_chain_deviation`, `inter_agent_hijack`, and `session_hijack` — are **sequence properties**, not point properties. Together they represent **299 of the 865 anomalous events (34.6%)**.

Evaluated against single-tool event rows with no trace or session identifiers, they are structurally unlearnable. A model can only catch them by memorizing the latency shortcut. The engineering solution is constructing a sequence feature layer grouped on `(pipeline_id, agent_role, stage)` ordered by derived event timestamps.

---

## Vocabulary Reconciliation & Gaps

### Naming Collapses
Conflicting labels across datasets were collapsed by meaning rather than string matching:
- **Supply Chain:** `A: supply_chain_poison (78)` ≡ `D: supply_chain_attack (274)` ≡ `C: Supply Chain Poisoning via Dependency (160)` $\rightarrow$ **OSP-12: Supply Chain & Tool Integrity**.
- **Tool-Chain:** `A: tool_chain_deviation (99)` ≡ `D: tool_chain_exploit (240)` ≡ `C: Tool-Chain Deviation (124)` $\rightarrow$ **OSP-04: Tool-Chain Exploitation**.
- **Poisoning:** `D: model_poisoning (265)` and `D: context_poisoning (263)` both fold into **OSP-03: Indirect / Context Poisoning** (input context vs model weights).

### Dataset B Coverage Asymmetry
Dataset B (SLM Inference Logs) carries only 6 threat types plus `none`. It completely lacks `model_inversion` (0), `inter_agent_hijack` (0), and `supply_chain_poison` (0). Consequently, Dataset B cannot validate a 9-class classifier trained on Dataset A; it is retained strictly for model latency and output confidence benchmarking.

### The A ↔ D Join Dimension
Conflating the agent role with the deployment instance made cross-dataset joins appear impossible. Stripping the instance suffix from `A.agent_id` (e.g., `credit-decisioning-agent-07` $\rightarrow$ `credit-decisioning-agent`) matches `D.agent_target` for **19 of 20 agent roles** (only `personalization-agent` is unlinked).

---

## Open Taxonomy Questions to Settle

Four judgment calls were documented during Sprint 2 closeout for final platform alignment:

1. **G-1 · Data & Model Poisoning:** `model_poisoning` (Dataset D, 265 rows) and `Fine-Tune Dataset Poisoning` (Dataset C, 146 rows) are training-time attacks currently folded into `OSP-03` (a runtime context attack). Recommends provisionally adding `OSP-17 Data & Model Poisoning` or scoping model poisoning out of the runtime loop.
2. **G-2 · Inference Endpoint Exploit:** Dataset C's `Inference Endpoint Exploit` (160 rows) is provisionally mapped to `OSP-13 (Sandbox / Host Escape)`. Confirm whether it is container escape or model denial-of-service.
3. **G-3 · Model Inversion Placement:** `model_inversion` (A: 103, D: 278, C: 156) is mapped to `OSP-15 (Hidden Context & Instruction Exposure)`, but also touches `OSP-08 (Sensitive Data Exposure)`.
4. **G-4 · Canonical Naming Convention:** Where portal names and Dataset A labels differ, the canonical governance name governs while the literal A value is retained as the operational anchor.
