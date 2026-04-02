import type { SearchResult } from "./types.js";

interface HybridOptions {
  alpha?: number;
  beta?: number;
  gamma?: number;
  delta?: number;
  recencyLambdaSession?: number;
  recencyLambdaUser?: number;
  recencyLambdaGlobal?: number;
  sessionId: string;
  userId: string;
}

export function scoreCandidates(items: SearchResult[], opts: HybridOptions): SearchResult[] {
  const now = Date.now();
  const { alpha, beta, gamma } = normalizeWeights(
    opts.alpha ?? 0.7,
    opts.beta ?? 0.2,
    opts.gamma ?? 0.1,
  );
  const delta = clamp01(opts.delta ?? 0.5);
  // Lambda units are per-second decay constants.
  const recencyLambdaSession = Math.max(0, opts.recencyLambdaSession ?? 0.0001);
  const recencyLambdaUser = Math.max(0, opts.recencyLambdaUser ?? 0.00001);
  const recencyLambdaGlobal = Math.max(0, opts.recencyLambdaGlobal ?? 0.000002);

  return items
    .map((item) => {
      const ts = typeof item.metadata.ts === "number" ? item.metadata.ts : now;
      const lambda =
        item.metadata.sessionId === opts.sessionId ? recencyLambdaSession
          : item.metadata.userId === opts.userId ? recencyLambdaUser
            : recencyLambdaGlobal;
      const ageSeconds = Math.max(0, now - ts) / 1000;
      const recency = Math.exp(-lambda * ageSeconds);
      const scopeBoost =
        item.metadata.sessionId === opts.sessionId ? 1.0
          : item.metadata.userId === opts.userId ? 0.6
            : 0.3;
      const similarity = clamp01(item.score);
      const baseScore =
        alpha * similarity +
        beta * recency +
        gamma * scopeBoost;
      const rawDecayRate =
        typeof item.metadata.decay_rate === "number" ? item.metadata.decay_rate : 0.0;
      const decayRate = Math.min(1, Math.max(0, rawDecayRate));
      const quality =
        item.metadata.type === "summary"
          ? 1.0 - delta * decayRate
          : 1.0;
      const finalScore = clamp01(baseScore * quality);

      return {
        ...item,
        finalScore,
      };
    })
    .sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function normalizeWeights(alpha: number, beta: number, gamma: number): { alpha: number; beta: number; gamma: number } {
  alpha = clamp01(alpha);
  beta = clamp01(beta);
  gamma = clamp01(gamma);

  const sum = alpha + beta + gamma;
  if (sum <= 0) {
    return { alpha: 0.7, beta: 0.2, gamma: 0.1 };
  }

  return {
    alpha: alpha / sum,
    beta: beta / sum,
    gamma: gamma / sum,
  };
}
