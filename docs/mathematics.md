# Mathematical Reference

This document is the formal reference for the scoring and optimization math used
by the plugin. The gating scalar is documented separately in
[gating.md](./gating.md).

Every formula below points at the file that currently implements it. If the code
changes first, this document must change with it.

## 1. Hybrid Scoring

Each candidate returned by the vector store starts with a cosine similarity
score `cos(q,d)` in `[0,1]` from embedding retrieval. The host then applies a
hybrid ranker:

```text
base(d) = alpha * cos(q,d) + beta * R(d) + gamma * S(d)
score(d) = base(d) * Q(d)
```

where:

```text
R(d) = exp(-lambda(d) * delta_t_d)

S(d) =
  1.0 if d is from the active session
  0.6 if d is from durable user memory
  0.3 if d is from global memory

Q(d) =
  1 - delta * decay_rate(d) if d is a summary
  1 otherwise
```

Implemented in [`src/scoring.ts`](../src/scoring.ts).

The current implementation defaults are:

- `alpha = 0.7`
- `beta = 0.2`
- `gamma = 0.1`
- `delta = 0.5`

The design convention is that `alpha + beta + gamma = 1`. This keeps the base
score on a stable scale and makes tuning interpretable: increasing one weight
means explicitly decreasing another.

Boundary cases:

- `alpha = 1` collapses to semantic retrieval only.
- `beta = 1` collapses to pure recency preference.
- `gamma = 1` collapses to scope-only ranking and is almost always wrong
  because it ignores content.
- `delta = 0` ignores summary quality completely.
- `delta = 1` applies the maximum configured penalty to low-confidence
  summaries.

## 2. Recency Decay

Recency uses exponential decay:

```text
R(d) = exp(-lambda * delta_t_d)
```

where `delta_t_d` is the age of the record in seconds and `lambda` is the
scope-specific decay constant.

Implemented in [`src/scoring.ts`](../src/scoring.ts).

In the current implementation, `delta_t_d` is measured in seconds, not
milliseconds:

```text
delta_t_d = (Date.now() - ts_d) / 1000
```

and the `lambda` values are therefore per-second decay constants.

The current implementation uses different constants by scope:

- active session: `lambda = 0.0001`
- durable user memory: `lambda = 0.00001`
- global memory: `lambda = 0.000002`

The implied half-lives make the decay constants auditable at a glance:

| Scope | `lambda` | Half-life |
|---|---|---|
| Session | `0.0001` | about `1.9 hours` |
| User | `0.00001` | about `19 hours` |
| Global | `0.000002` | about `4 days` |

```text
t_half = ln(2) / lambda
```

If those half-lives feel wrong for a given deployment, adjust `lambda` via
config. Do not change the decay formula itself.

This makes session context fade fastest, user memory fade more slowly, and
global memory remain the most stable.

Why exponential instead of linear:

- exponential decay preserves ordering smoothly across many time scales
- it never goes negative
- it gives a natural "fast drop then long tail" shape for conversational
  relevance

Linear decay has a hard cutoff or requires arbitrary clipping. Exponential
decay lets old memories fade continuously without inventing a discontinuity.

## 3. Token Budget Fitting

After ranking, the system performs greedy prompt packing.

Implemented in [`src/tokens.ts`](../src/tokens.ts).

Let candidates be sorted by final hybrid score:

```text
score(d1) >= score(d2) >= ... >= score(dn)
```

and let `c_i` be the estimated token cost of candidate `d_i`. The current host
token estimator is:

```text
estimateTokens(t) = ceil(len(t) / chi(t))
```

where:

```text
chi(t) =
  1.6 for CJK scripts
  2.5 for Cyrillic, Arabic, or Hebrew scripts
  4.0 otherwise
```

Given prompt budget `B`, the system selects the longest ranked prefix whose
cumulative cost fits:

```text
S = [d1, d2, ..., dm]
```

such that:

```text
sum(i = 1..m) c_i <= B
```

and either `m = n` or:

```text
sum(i = 1..m+1) c_i > B
```

Greedy is optimal for this implementation because the ranking is already fixed.
The problem is not "find the best weighted subset under a knapsack objective";
it is "preserve rank order while honoring a hard prompt cap." Once rank order
is fixed, prefix acceptance is the correct policy.

Note on estimator divergence:

- the host estimator in [`src/tokens.ts`](../src/tokens.ts) is script-aware and
  is used for prompt-budget fitting
- the sidecar estimator in
  [`sidecar/compact/tokens.go`](../sidecar/compact/tokens.go) uses a fixed
  bytes-per-token rule:

```text
T_sidecar(t) = max(floor(len(t) / 4), 1)
```

The two estimators are intentionally different. The host estimator optimizes
prompt-budget accuracy. The sidecar estimator is used only as a stable
normalization denominator in the technical-specificity signal `P(t)` of the
gating scalar. They must not be substituted for each other.

## 4. Matryoshka Cascade

For Nomic embeddings, one full vector `v` in `R^768` produces three tiers:

```text
u_64  = normalize(v[1:64])
u_256 = normalize(v[1:256])
u_768 = normalize(v[1:768])
```

Re-normalization is required after truncation because a prefix of a unit vector
is not itself a unit vector in general.

Implemented in [`sidecar/embed/matryoshka.go`](../sidecar/embed/matryoshka.go)
and [`sidecar/store/libravdb.go`](../sidecar/store/libravdb.go).

Cascade search uses:

- L1: `64d`
- L2: `256d`
- L3: `768d`

The search exits early when a tier's best score exceeds the configured
threshold. Otherwise it falls through to the next tier. Empty lower-tier
collections degrade gracefully because:

```text
max(empty_set) = 0
```

and `0` is below both early-exit thresholds by design.

Backfill condition:

- L3 is the source of truth
- L1 and L2 are derived caches
- if an L1 or L2 insert fails, a dirty-tier marker is recorded
- startup backfill reconstructs the missing tier vector from L3

## 5. Compaction Clustering

Compaction groups raw session turns into deterministic chronological clusters
and replaces each cluster with one summary record. The intent is to turn many
highly local turns into fewer retrieval-worthy summaries.

Implemented in [`sidecar/compact/summarize.go`](../sidecar/compact/summarize.go).

The current algorithm is not semantic k-means. It is deterministic
chronological partitioning:

1. collect eligible non-summary turns
2. sort them by `(ts, id)`
3. choose target cluster size `k`
4. derive cluster count:

```text
c = ceil(n / k)
```

where `n` is the number of eligible turns

5. assign turn `i` to cluster:

```text
clusterIndex(i) = floor((i * c) / n)
```

This yields contiguous chronological buckets of roughly equal size while
avoiding nondeterministic clustering behavior.

The summarizer input for cluster `C_j` is the ordered turn sequence:

```text
C_j = [t1, t2, ..., tm]
```

with each element carrying turn id and text.

The output is a summary record `s(C_j)` with:

- summary text
- source ids
- confidence
- method
- `decay_rate = 1 - confidence`

Implemented across [`sidecar/compact/summarize.go`](../sidecar/compact/summarize.go),
[`sidecar/summarize/engine.go`](../sidecar/summarize/engine.go), and
[`sidecar/summarize/onnx_local.go`](../sidecar/summarize/onnx_local.go).

The confidence term is implemented as a bounded quality signal:

```text
confidence(s) in [0,1]
```

with backend-specific definitions:

```text
confidence_extractive(s) =
  mean cosine similarity of selected turns to the cluster centroid

confidence_onnx(s) =
  exp(sum(log p(t_i | t_<i, C_j)) / n)
```

where `t_i` are generated summary tokens and `C_j` is the source cluster.

The retrieval decay metadata is then:

```text
decay_rate(s) = 1 - confidence(s)
```

and the retrieval quality multiplier from Section 1 becomes:

```text
Q(s) = 1 - delta * decay_rate(s)
```

At the shipped default `delta = 0.5`, this constrains summary quality weights
to:

```text
Q(s) in [0.5, 1.0]
```

This makes compaction load-bearing in retrieval rather than archival only.

## 6. Why These Pieces Compose

The full quality loop is:

```text
high-value turns
-> better clusters
-> higher summary confidence
-> lower decay rate
-> higher retrieval score
```

That is the system-level reason the math is distributed across ingestion,
compaction, and retrieval instead of existing only in one scoring function.

## 7. Planned Two-Pass Discovery Scoring

This section documents the planned scoring and assembly model for a future
two-pass retrieval system. It is a design target for optimization work after
the OpenClaw `2026.3.28+` memory prompt contract change. It is not the current
implementation in [`src/scoring.ts`](../src/scoring.ts) or
[`src/context-engine.ts`](../src/context-engine.ts).

The design goal is to separate:

1. invariant documents that must always be present
2. cheap discovery over variant documents
3. selective second-pass expansion under a hard prompt budget

### 7.1 Foundational Definitions

Let the retrievable document corpus be:

```text
D = {d1, d2, ..., dn}
```

and let the query space be:

```text
Q
```

Let the embedding function:

```text
phi : D union Q -> R^m
```

map documents and queries to unit vectors:

```text
||phi(x)|| = 1 for all x in D union Q
```

The planned gating function is:

```text
G : Q x D -> {0,1}
```

and determines whether a document is injected for a query.

### 7.2 Corpus Decomposition

The corpus is partitioned into invariant and variant sets:

```text
D = I union V
I intersect V = empty_set
```

The invariant membership predicate is:

```text
iota : D -> {0,1}
```

with:

```text
I = { d in D | iota(d) = 1 }
V = D \ I
```

For OpenClaw, the intended implementation is that invariant documents are
registered as authored constants at load time rather than discovered at query
time. In practice, this means documents such as `AGENTS.md` and `souls.md`
should be compiled into the invariant set when they are explicitly marked as
always-inject rules.

The required invariant is:

```text
iota(d) = 1 implies G(q,d) = 1 for all q in Q
```

This is a compile-time guarantee, not a runtime heuristic.

### 7.3 Document Authority Weight

Each variant document carries a precomputed authority weight:

```text
omega(d) = alpha_r * r(d) + alpha_f * f(d) + alpha_a * a(d)
```

with:

```text
alpha_r + alpha_f + alpha_a = 1
```

where:

```text
r(d) = exp(-lambda_r * delta_t(d))

f(d) = log(1 + acc(d)) / log(1 + max(acc(d') for d' in V))

a(d) in [0,1]
```

This lets the planned discovery score incorporate recency, access frequency,
and authored authority without baking those concerns into the raw cosine term.

### 7.4 Pass 1: Coarse Semantic Filtering

Pass 1 computes cosine similarity:

```text
sim(q,d) = phi(q)^T phi(d)
```

and selects the coarse candidate set:

```text
C1(q) = top-k1 over d in V by sim(q,d)
```

with a hard similarity floor:

```text
C1(q) = { d in C1(q) | sim(q,d) >= theta_1 }
```

The purpose of this pass is breadth with cheap semantic recall. Documents below
`theta_1` are rejected even if they land in the top-`k1` set, because the
first pass must not admit semantically orthogonal noise into second-pass work.

### 7.5 Pass 2: Normalized Hybrid Scoring

Let the query keyword extractor return:

```text
K = KeyExt(q)
```

and define normalized keyword coverage:

```text
M_norm(K,d) = |K intersect terms(d)| / |K| in [0,1]
```

The proposed normalized second-pass score is:

```text
S_final(d) =
  omega(d) * max(sim(q,d), 0) * (1 + kappa * M_norm(K,d)) / (1 + kappa)
```

The normalized second-pass score form above was suggested during design review
by GitHub contributor [@JuanHuaXu](https://github.com/JuanHuaXu). The broader
two-pass architecture in this section remains project-authored.

This form is preferred over a hard clamp such as `min(term, 1)` because
clamping discards ranking information at the high end of the score
distribution. The denominator `1 + kappa` gives an analytic bound instead of
truncating the result.

The second-pass candidate set is:

```text
C2(q) = top-k2 over d in C1(q) by S_final(d)
```

with:

```text
k2 <= k1
```

### 7.6 Bounded Range and Interpretation of `kappa`

Let:

```text
s = max(sim(q,d), 0) in [0,1]
```

Then:

```text
S_final(d) = omega(d) * s * (1 + kappa * M_norm(K,d)) / (1 + kappa)
```

The numerator is maximized when `s = 1` and `M_norm(K,d) = 1`:

```text
max(numerator) = omega(d) * (1 + kappa)
```

Therefore:

```text
0 <= S_final(d) <= omega(d) <= 1
```

This yields a clean interpretation of `kappa`:

- `kappa = 0` gives pure semantic retrieval
- `kappa = 0.5` allows keyword coverage to provide up to a one-third relative
  boost before normalization
- `kappa = 1.0` makes full lexical support restore the pure semantic ceiling
  while penalizing semantic-only matches with no keyword support

A reasonable initial experiment value is:

```text
kappa = 0.3
```

### 7.7 Multi-Hop Expansion

Let the authored hop graph be:

```text
G = (D, E)
```

where edges are registered in document metadata at authorship time.

For a document `d`, define its hop neighborhood:

```text
H(d) = { d' in D | (d, d') in E }
```

The hop expansion set is:

```text
C_hop(q) = union over d in C2(q) of H(d), minus C2(q)
```

Each hop candidate inherits a decayed score from its best parent:

```text
S_hop(d') = lambda_hop * max(S_final(d) for d in C2(q) where d' in H(d))
```

with hop decay:

```text
lambda_hop in (0,1)
```

and filtered hop set:

```text
C_hop*(q) = { d' in C_hop(q) | S_hop(d') >= theta_hop }
```

### 7.8 Final Assembly Under a Token Budget

Variant projection is:

```text
Proj(V, q) = C2(q) union C_hop*(q)
```

Total injected soul context is:

```text
C_soul(q) = I union Proj(V, q)
```

Let the total prompt budget be `tau`. If the invariant set consumes:

```text
tau_I = sum(toks(d) for d in I)
```

then the variant budget is:

```text
tau_V = tau - tau_I
```

Documents in `Proj(V, q)` are injected in descending score order until:

```text
sum(toks(d) for d in injected) <= tau_V
```

The merged score sequence is:

```text
sigma(d) =
  S_final(d) if d in C2(q)
  S_hop(d)   if d in C_hop*(q)
```

### 7.9 Complete Gating Definition

```text
G(q,d) =
  1 if iota(d) = 1
  1 if iota(d) = 0 and d in (C2(q) union C_hop*(q))
  0 otherwise
```

### 7.10 Required Runtime Invariants

The implementation must preserve these properties:

1. Invariant completeness:

```text
for all d in I and for all q in Q, d is in C_soul(q)
```

2. Partition integrity:

```text
I intersect V = empty_set
```

3. Score boundedness:

```text
S_final(d) in [0,1]
```

4. Token budget respect:

```text
sum(toks(d) for d in C_soul(q)) <= tau
```

with the invariant set never truncated.

5. Hop termination:

The authored hop graph should be acyclic, or the runtime must cap hop depth at
one to guarantee termination.
