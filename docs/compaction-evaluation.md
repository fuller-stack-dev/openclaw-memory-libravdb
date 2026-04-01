# Compaction Evaluation

This document records the first local evaluation pass for the Nomic-first
compaction confidence design.

The goal of the experiment was to compare:

- raw ONNX T5 decoder confidence
- Nomic-space preservation metrics
- the planned hybrid confidence model with a hard preservation gate

The evaluation harness lives in:

- `sidecar/cmd/eval_compaction`

It runs real local models:

- Nomic `nomic-embed-text-v1.5` for embedding-space evaluation
- ONNX T5-small for optional abstractive summarization

## Why This Exists

The compaction system previously trusted T5 decoder confidence alone:

```text
conf_t5(s, C) = exp(mean log p(token_i | token_<i, C))
```

That quantity measures decoder self-consistency, not semantic preservation in
the retrieval geometry used by the vector store.

The new design evaluates every summary back in Nomic space:

```text
Q_align(s, C) = cos(E(s), mu_C)
Q_cover(s, C) = mean_i max(0, cos(E(s), E(t_i)))
conf_nomic(s, C) = clamp01((Q_align + Q_cover) / 2)
```

And then applies:

```text
if Q_align < tau_preserve:
  reject abstractive summary and fall back to extractive

confidence =
  conf_nomic                                  for extractive
  lambda * conf_nomic + (1 - lambda) * conf_t5 for T5 summaries
```

with the current implementation constants:

- `tau_preserve = 0.65`
- `lambda = 0.8`

## Baseline Corpus

The first real-model pass used 13 fixed synthetic clusters:

- 5 normal engineering-memory clusters
- 8 adversarial clusters designed to stress abstractive faithfulness

The adversarial set included:

- conflicting subsystem failures
- dense Go code and test logic
- four-way architectural decision bundles
- many-number and threshold-heavy cases
- continuity vs progress tension
- cross-domain product/math/infra mixtures
- token-budget contract distinctions

## Results

### Core Cases

| case | raw_conf | align | cover | final_conf | delta_conf |
|---|---:|---:|---:|---:|---:|
| auth_migration | 0.8501 | 0.9183 | 0.8342 | 0.8710 | +0.0209 |
| compaction_boundary | 0.6894 | 0.7983 | 0.7216 | 0.7458 | +0.0564 |
| gating_math | 0.7790 | 0.9167 | 0.8285 | 0.8539 | +0.0748 |
| release_pipeline | 0.8859 | 0.9697 | 0.8729 | 0.9142 | +0.0283 |
| adversarial_multi_fact | 0.8545 | 0.9052 | 0.7893 | 0.8487 | -0.0058 |

### Adversarial Cases

| case | raw_conf | align | cover | final_conf | delta_conf |
|---|---:|---:|---:|---:|---:|
| adversarial_conflicting_errors | 0.8540 | 0.8579 | 0.7440 | 0.8116 | -0.0424 |
| adversarial_dense_go_code | 0.8945 | 0.9167 | 0.8212 | 0.8741 | -0.0205 |
| adversarial_four_way_decision_bundle | 0.8451 | 0.8651 | 0.7598 | 0.8190 | -0.0261 |
| adversarial_many_numbers | 0.6815 | 0.8554 | 0.7629 | 0.7836 | +0.1021 |
| adversarial_boundary_vs_progress | 0.7824 | 0.8993 | 0.8109 | 0.8406 | +0.0581 |
| adversarial_cross_domain_mix | 0.5240 | 0.8099 | 0.7327 | 0.7218 | +0.1978 |
| adversarial_token_budget_rules | 0.7889 | 0.9095 | 0.8307 | 0.8539 | +0.0649 |

## What We Learned

### 1. T5 and Nomic are locally compatible

Every evaluated case produced:

```text
Q_align > 0.65
```

So the hard preservation gate did not trigger on the initial corpus. This is
useful evidence that the local T5 summaries are generally pointing in the same
semantic direction as the source cluster in Nomic space.

### 2. The new math improves confidence grounding

The hybrid model changed confidence more often than it changed summary text.

This is still a meaningful result:

- positive deltas mean Nomic-space preservation validated summaries that T5
  scored pessimistically
- negative deltas mean Nomic-space preservation penalized summaries that T5
  scored too generously

The largest rescue was:

- `adversarial_cross_domain_mix`: `0.5240 -> 0.7218` (`+0.1978`)

The largest penalty was:

- `adversarial_conflicting_errors`: `0.8540 -> 0.8116` (`-0.0424`)

So even without fallback, the confidence signal is more retrieval-aware than the
old T5-only design.

### 3. The current adversarial corpus is not yet harsh enough

The fact that no case tripped the gate means one of two things:

- the local T5 model is more semantically faithful than expected on short
  engineering clusters
- the benchmark set is still not pathological enough to force geometric drift

Future adversarial work should try:

- longer noisy code traces
- clusters with mutually incompatible fixes or resolutions
- topic-shifting mixed clusters designed to elicit generic summaries
- threshold sweeps with higher `tau_preserve` during evaluation only

## Current Interpretation

The preservation gate is not decorative, but its first practical value is
confidence correction rather than frequent fallback.

That is still a win:

- T5 remains the lightweight local decoder
- Nomic remains the canonical retrieval geometry
- compaction confidence is now judged in the same space retrieval uses

This is the mathematically coherent compromise for a stable shippable plugin.
