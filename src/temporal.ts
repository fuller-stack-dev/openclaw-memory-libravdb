import { estimateTokens } from "./tokens.js";
import type { SearchResult } from "./types.js";

const TEMPORAL_PATTERN_WEIGHTS: Array<{ label: string; weight: number; patterns: RegExp[] }> = [
  {
    label: "how many days",
    weight: 1.0,
    patterns: [/\bhow\s+many\s+days\b/i],
  },
  {
    label: "how long",
    weight: 0.9,
    patterns: [/\bhow\s+long\b/i],
  },
  {
    label: "before or after",
    weight: 0.8,
    patterns: [/\bbefore\b/i, /\bafter\b/i],
  },
  {
    label: "since or between",
    weight: 0.7,
    patterns: [/\bsince\b/i, /\bbetween\b/i],
  },
  {
    label: "first or earlier",
    weight: 0.8,
    patterns: [/\bfirst\b/i, /\bearlier\b/i, /\bwhich\s+came\s+first\b/i],
  },
  {
    label: "when did",
    weight: 0.7,
    patterns: [/\bwhen\s+did\b/i],
  },
];

const TEMPORAL_ANCHOR_PATTERNS: RegExp[] = [
  /\b\d{4}-\d{2}-\d{2}\b/g,
  /\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g,
  /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?\b/gi,
  /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
  /\b(?:today|yesterday|tomorrow|last\s+(?:week|month|year|night|saturday|sunday)|next\s+(?:week|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|mid-?[a-z]+)\b/gi,
  /\b\d{1,2}:\d{2}(?:\s?[ap]m)?\b/gi,
  /\b(?:19|20)\d{2}\b/g,
  /\b\d{10,13}\b/g,
];

const TEMPORAL_XI_NORM = 1.5;
const TEMPORAL_XI_THRESHOLD = 0.3;
const TEMPORAL_ANCHOR_NORM = 3;
const TEMPORAL_ANCHOR_CACHE_MAX = 4096;
const temporalAnchorCache = new Map<string, number>();

const TEMPORAL_SLOT_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "have",
  "from",
  "your",
  "what",
  "when",
  "where",
  "which",
  "would",
  "could",
  "should",
  "about",
  "into",
  "some",
  "them",
  "they",
  "been",
  "just",
  "want",
  "looking",
  "look",
  "help",
  "need",
  "recommend",
  "suggestions",
  "suggest",
  "advice",
  "think",
  "also",
  "did",
  "does",
  "do",
  "after",
  "before",
  "since",
  "between",
  "first",
  "earlier",
  "many",
  "days",
  "long",
  "how",
  "did",
  "take",
  "took",
  "it",
  "me",
  "my",
  "i",
]);

const COMPARISON_GENERIC_SLOT_PREFIXES = new Set([
  "trip",
  "event",
  "device",
  "thing",
  "item",
  "time",
  "place",
  "activity",
  "experience",
  "job",
  "role",
  "project",
  "task",
  "purchase",
  "plan",
  "change",
  "decision",
  "move",
  "visit",
  "meeting",
  "session",
]);

const COMPARISON_FIRST_PERSON_CLAUSE_PATTERNS: RegExp[] = [
  /\bi\b/gi,
  /\bi'm\b/gi,
  /\bi've\b/gi,
];

const COMPARISON_PROSPECTIVE_PERSONAL_PATTERNS: RegExp[] = [
  /\b(?:i\s+am\s+|i'm\s+)?considering\b/gi,
  /\b(?:i\s+am\s+|i'm\s+)?planning\b/gi,
  /\bi\s+am\s+thinking\s+about\b/gi,
  /\bi'?m\s+thinking\s+about\b/gi,
  /\bi\s+have\s+been\s+looking\b/gi,
  /\bi'?ve\s+been\s+looking\b/gi,
  /\bi\s+am\s+looking\s+(?:at|into)\b/gi,
  /\bi'?m\s+looking\s+(?:at|into)\b/gi,
  /\bi\s+want\s+to\b/gi,
  /\bi\s+would\s+like\s+to\b/gi,
  /\bi\s+am\s+hoping\s+to\b/gi,
  /\bi'?m\s+hoping\s+to\b/gi,
  /\bi\s+am\s+going\s+to\s+(?:visit|go|try|do)\b/gi,
  /\bi'?m\s+going\s+to\s+(?:visit|go|try|do)\b/gi,
  /\bi\s+am\s+trying\s+to\s+decide\b/gi,
  /\bi'?m\s+trying\s+to\s+decide\b/gi,
  /\bi\s+am\s+trying\s+to\s+(?:plan|figure)\b/gi,
  /\bi'?m\s+trying\s+to\s+(?:plan|figure)\b/gi,
];

export interface TemporalQuerySignal {
  indicator: number;
  active: boolean;
  matchedPatterns: string[];
}

export interface TemporalSelectorGuardDecision {
  shouldApply: boolean;
  slots: string[];
  reason: string;
}

export interface TemporalRecoveryDebugCandidate {
  id: string;
  text: string;
  selected: boolean;
  temporalAnchorDensity: number;
  semanticScore: number;
  recencyScore: number;
  slotCoverage: number;
  slotMatches: string[];
  finalScore: number;
  rationale: string;
  comparisonSide?: 0 | 1 | null;
  comparisonSlot?: string;
  comparisonSlotRecall?: number;
  comparisonSlotPrecision?: number;
  comparisonSlotSpecificity?: number;
  comparisonSlotPositionWeightedRecall?: number;
  comparisonSlotPositionWeightedPrecision?: number;
  comparisonSlotPositionWeightedSpecificity?: number;
  comparisonFirstPersonClauseCount?: number;
  comparisonProspectivePersonalVerbCount?: number;
  comparisonPlanningDensity?: number;
  comparisonPastness?: number;
  comparisonSideWitnessScore?: number;
}

export interface TemporalRecoveryRankingResult {
  ranked: SearchResult[];
  debug: TemporalRecoveryDebugCandidate[];
  temporalQuery: TemporalQuerySignal;
  slots: string[];
  comparisonCoverageApplied?: boolean;
  comparisonCoverageSlots?: string[];
  comparisonCoverageMinTokens?: number;
}

export function detectTemporalQuerySignal(queryText: string): TemporalQuerySignal {
  const matchedPatterns: string[] = [];
  let weightedMatches = 0;

  for (const entry of TEMPORAL_PATTERN_WEIGHTS) {
    if (entry.patterns.some((pattern) => pattern.test(queryText))) {
      matchedPatterns.push(entry.label);
      weightedMatches += entry.weight;
    }
  }

  const indicator = clamp01(weightedMatches / TEMPORAL_XI_NORM);
  return {
    indicator,
    active: indicator >= TEMPORAL_XI_THRESHOLD,
    matchedPatterns,
  };
}

export function getTemporalAnchorDensity(docKey: string, text: string): number {
  const cacheKey = `${docKey}\n${text}`;
  const cached = temporalAnchorCache.get(cacheKey);
  if (typeof cached === "number") {
    touchTemporalAnchorCache(cacheKey, cached);
    return cached;
  }

  const uniqueMatches = new Set<string>();
  for (const pattern of TEMPORAL_ANCHOR_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const value = match[0]?.trim().toLowerCase();
      if (value) {
        uniqueMatches.add(value);
      }
    }
  }

  const density = clamp01(uniqueMatches.size / TEMPORAL_ANCHOR_NORM);
  touchTemporalAnchorCache(cacheKey, density);
  return density;
}

export function rankTemporalRecoveryCandidates(
  items: SearchResult[],
  opts: {
    queryText: string;
    maxSelected?: number;
    nowMs?: number;
    recencyLambda?: number;
    selectionTokenBudget?: number;
  },
): TemporalRecoveryRankingResult {
  const temporalQuery = detectTemporalQuerySignal(opts.queryText);
  const slots = extractTemporalSlots(opts.queryText);
  const isComparisonQuery = temporalQuery.matchedPatterns.includes("first or earlier");
  const effectiveSlots = isComparisonQuery ? filterComparisonSlots(slots) : slots;
  const comparisonSlots = isComparisonQuery ? deriveComparisonSideSlots(effectiveSlots) : [];
  const recencyLambda = Math.max(0, opts.recencyLambda ?? 0.00001);
  const now = opts.nowMs ?? Date.now();
  const maxSelected = Math.max(1, Math.floor(opts.maxSelected ?? 3));
  const selectionTokenBudget = Math.max(0, Math.floor(opts.selectionTokenBudget ?? Number.MAX_SAFE_INTEGER));

  const decorated = items.map((item) => {
    const semanticScore = clamp01(typeof item.finalScore === "number" ? item.finalScore : item.score ?? 0);
    const recencyScore = computeRecencyScore(item, now, recencyLambda);
    const temporalAnchorDensity = getTemporalAnchorDensity(
      `${typeof item.metadata.collection === "string" ? item.metadata.collection : "unknown"}::${item.id}`,
      item.text,
    );
    const { coverage, matches } = computeSlotCoverage(effectiveSlots, item.text);
    const tokenEstimate = estimateTokens(item.text);
    const comparisonSide = comparisonSlots.length === 2
      ? computeComparisonSideAffiliation(comparisonSlots, item.text)
      : null;
    const comparisonMetrics = comparisonSide !== null
      ? computeComparisonSlotSpecificityMetrics(comparisonSlots[comparisonSide]!, item.text)
      : null;
    const comparisonSideWitnessScore = comparisonMetrics
      ? comparisonMetrics.sideWitnessScore
      : undefined;
    const finalScore = clamp01(isComparisonQuery
      ? (0.15 * semanticScore) +
        (0.15 * recencyScore) +
        (0.15 * coverage) +
        (0.55 * (comparisonSideWitnessScore ?? 0))
      : (0.40 * semanticScore) +
        (0.25 * recencyScore) +
        (0.20 * temporalAnchorDensity) +
        (0.15 * coverage) +
        (temporalQuery.active ? 0.05 : 0));
    return {
      item,
      semanticScore,
      recencyScore,
      temporalAnchorDensity,
      slotCoverage: coverage,
      slotMatches: matches,
      tokenEstimate,
      comparisonSide,
      comparisonMetrics,
      comparisonSideWitnessScore,
      finalScore,
    };
  });

  const selectedIDs = new Set<string>();
  const coveredSlots = new Set<string>();
  const selected: SearchResult[] = [];
  let comparisonCoverageApplied = false;
  let comparisonCoverageMinTokens: number | undefined;

  if (comparisonSlots.length === 2) {
    const sideCandidates = comparisonSlots.map((_, sideIndex) =>
      decorated
        .filter((candidate) => candidate.comparisonSide === sideIndex)
        .sort((left, right) => {
          const leftWitnessScore = left.comparisonSideWitnessScore ?? Number.NEGATIVE_INFINITY;
          const rightWitnessScore = right.comparisonSideWitnessScore ?? Number.NEGATIVE_INFINITY;
          if (rightWitnessScore !== leftWitnessScore) {
            return rightWitnessScore - leftWitnessScore;
          }
          if (right.finalScore !== left.finalScore) {
            return right.finalScore - left.finalScore;
          }
          return left.tokenEstimate - right.tokenEstimate;
        }),
    );
    const cheapestSideTokenSum = sideCandidates.reduce((sum, candidates) => (
      candidates.length > 0 ? sum + candidates.reduce((best, candidate) => Math.min(best, candidate.tokenEstimate), Number.POSITIVE_INFINITY) : sum
    ), 0);
    if (sideCandidates.every((candidates) => candidates.length > 0) && Number.isFinite(cheapestSideTokenSum)) {
      comparisonCoverageMinTokens = cheapestSideTokenSum;
      const bestPair = findBestComparisonCoveragePair(sideCandidates[0], sideCandidates[1], selectionTokenBudget);
      if (bestPair) {
        for (const candidate of bestPair) {
          selectedIDs.add(candidate.item.id);
          for (const slot of candidate.slotMatches) {
            coveredSlots.add(slot);
          }
          selected.push({
            ...candidate.item,
            finalScore: candidate.finalScore,
          });
        }
        comparisonCoverageApplied = true;
      }
    }
  }

  for (let pass = selected.length; pass < maxSelected; pass += 1) {
    let best: (typeof decorated)[number] | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of decorated) {
      if (selectedIDs.has(candidate.item.id)) {
        continue;
      }
      const marginalCoverage =
        candidate.slotMatches.filter((slot) => !coveredSlots.has(slot)).length / Math.max(1, effectiveSlots.length);
      const combined = candidate.finalScore + (0.25 * marginalCoverage);
      if (combined > bestScore) {
        best = candidate;
        bestScore = combined;
      }
    }

    if (!best || bestScore < 0.12) {
      break;
    }

    selectedIDs.add(best.item.id);
    for (const slot of best.slotMatches) {
      coveredSlots.add(slot);
    }
    selected.push({
      ...best.item,
      finalScore: best.finalScore,
    });
  }

  const remaining = decorated
    .filter((candidate) => !selectedIDs.has(candidate.item.id))
    .sort((left, right) => right.finalScore - left.finalScore)
    .map((candidate) => ({
      ...candidate.item,
      finalScore: candidate.finalScore,
    }));

  const ranked = [...selected, ...remaining];
  const debug = decorated
    .sort((left, right) => right.finalScore - left.finalScore)
    .map((candidate) => ({
      id: candidate.item.id,
      text: candidate.item.text,
      selected: selectedIDs.has(candidate.item.id),
      temporalAnchorDensity: candidate.temporalAnchorDensity,
      semanticScore: candidate.semanticScore,
      recencyScore: candidate.recencyScore,
      slotCoverage: candidate.slotCoverage,
      slotMatches: candidate.slotMatches,
      finalScore: candidate.finalScore,
      rationale: buildTemporalRecoveryRationale(candidate.slotCoverage, candidate.temporalAnchorDensity, candidate.semanticScore),
      comparisonSide: candidate.comparisonSide,
      comparisonSlot: candidate.comparisonSide !== null ? comparisonSlots[candidate.comparisonSide] : undefined,
      comparisonSlotRecall: candidate.comparisonMetrics?.recall,
      comparisonSlotPrecision: candidate.comparisonMetrics?.precision,
      comparisonSlotSpecificity: candidate.comparisonMetrics?.specificity,
      comparisonSlotPositionWeightedRecall: candidate.comparisonMetrics?.positionWeightedRecall,
      comparisonSlotPositionWeightedPrecision: candidate.comparisonMetrics?.positionWeightedPrecision,
      comparisonSlotPositionWeightedSpecificity: candidate.comparisonMetrics?.positionWeightedSpecificity,
      comparisonFirstPersonClauseCount: candidate.comparisonMetrics?.firstPersonClauseCount,
      comparisonProspectivePersonalVerbCount: candidate.comparisonMetrics?.prospectivePersonalVerbCount,
      comparisonPlanningDensity: candidate.comparisonMetrics?.planningDensity,
      comparisonPastness: candidate.comparisonMetrics?.pastness,
      comparisonSideWitnessScore: candidate.comparisonSideWitnessScore,
    }));

  return {
    ranked,
    debug,
    temporalQuery,
    slots: effectiveSlots,
    comparisonCoverageApplied,
    comparisonCoverageSlots: comparisonSlots.length === 2 ? comparisonSlots : undefined,
    comparisonCoverageMinTokens,
  };
}

export function decideTemporalSelectorGuard(
  queryText: string,
  temporalQuery: TemporalQuerySignal = detectTemporalQuerySignal(queryText),
): TemporalSelectorGuardDecision {
  const slots = extractTemporalSlots(queryText);
  if (!temporalQuery.active) {
    return {
      shouldApply: false,
      slots,
      reason: "temporal query gate inactive",
    };
  }

  const strongCompositionalPattern = temporalQuery.matchedPatterns.some((pattern) =>
    pattern === "how many days" ||
    pattern === "how long" ||
    pattern === "before or after" ||
    pattern === "since or between"
  );
  const strongComparisonPattern = temporalQuery.matchedPatterns.some((pattern) =>
    pattern === "first or earlier"
  );
  if (!strongCompositionalPattern && !strongComparisonPattern) {
    return {
      shouldApply: false,
      slots,
      reason: "query lacks strong compositional temporal pattern",
    };
  }

  if (strongComparisonPattern && !strongCompositionalPattern) {
    if (slots.length < 1 || slots.length > 4) {
      return {
        shouldApply: false,
        slots,
        reason: "comparison query did not resolve to a sensible number of slots",
      };
    }
    return {
      shouldApply: true,
      slots,
      reason: "comparison query with temporal entity extraction",
    };
  }

  if (slots.length !== 2) {
    return {
      shouldApply: false,
      slots,
      reason: "query did not resolve to exactly two temporal slots",
    };
  }

  return {
    shouldApply: true,
    slots,
    reason: "strong temporal query with two-slot decomposition",
  };
}

export function resetTemporalCachesForTest(): void {
  temporalAnchorCache.clear();
}

function extractTemporalSlots(text: string): string[] {
  const clauses = splitTemporalClauses(text);
  const slots = new Set<string>();

  for (const clause of clauses) {
    const terms = normalizeTerms(clause)
      .filter((term) => term.length >= 3 && !TEMPORAL_SLOT_STOPWORDS.has(term));
    if (terms.length === 0) {
      continue;
    }
    if (terms.length <= 3) {
      slots.add(terms.join(" "));
      continue;
    }
    slots.add(terms.slice(0, 4).join(" "));
    slots.add(terms.slice(-4).join(" "));
  }

  if (slots.size === 0) {
    const fallback = normalizeTerms(text).filter((term) => term.length >= 3 && !TEMPORAL_SLOT_STOPWORDS.has(term));
    if (fallback.length > 0) {
      slots.add(fallback.slice(0, 4).join(" "));
    }
  }

  return [...slots].slice(0, 4);
}

function computeSlotCoverage(slots: string[], candidateText: string): { coverage: number; matches: string[] } {
  if (slots.length === 0) {
    return { coverage: 0, matches: [] };
  }

  const candidateTerms = new Set(normalizeTerms(candidateText));
  const matches: string[] = [];
  let covered = 0;

  for (const slot of slots) {
    const slotTerms = normalizeTerms(slot).filter((term) => term.length >= 3);
    if (slotTerms.length === 0) {
      continue;
    }
    const overlap = slotTerms.filter((term) => candidateTerms.has(term)).length / slotTerms.length;
    if (overlap >= 0.5) {
      covered += 1;
      matches.push(slot);
    }
  }

  return {
    coverage: covered / Math.max(1, slots.length),
    matches,
  };
}

function filterComparisonSlots(slots: string[]): string[] {
  const filtered = slots.filter((slot) => {
    const terms = normalizeTerms(slot).filter(
      (term) => term.length >= 3 && !TEMPORAL_SLOT_STOPWORDS.has(term),
    );
    if (terms.length === 0) {
      return false;
    }
    if (terms.length === 1 && COMPARISON_GENERIC_SLOT_PREFIXES.has(terms[0]!)) {
      return false;
    }
    return true;
  });

  return filtered.length >= 1 ? filtered : slots;
}

function deriveComparisonSideSlots(slots: string[]): string[] {
  const specificSlots = slots.filter((slot) => {
    const terms = normalizeTerms(slot).filter(
      (term) => term.length >= 3 && !TEMPORAL_SLOT_STOPWORDS.has(term),
    );
    if (terms.length === 0) {
      return false;
    }
    return !(terms.length <= 2 && COMPARISON_GENERIC_SLOT_PREFIXES.has(terms[0]!));
  });
  const usableSlots = specificSlots.length >= 2 ? specificSlots : slots;
  return usableSlots.slice(0, 2);
}

function computeComparisonSideScore(slots: string[], candidateText: string): number {
  if (slots.length < 2) {
    return 0;
  }

  const overlaps = slots
    .map((slot) => computeSlotCoverage([slot], candidateText).coverage)
    .sort((left, right) => right - left);
  const strongest = overlaps[0] ?? 0;
  const second = overlaps[1] ?? 0;
  const asymmetry = Math.abs(strongest - second);

  return clamp01((0.6 * asymmetry) + (0.4 * strongest));
}

function computeComparisonSideAffiliation(slots: string[], candidateText: string): 0 | 1 | null {
  if (slots.length < 2) {
    return null;
  }

  const leftCoverage = computeSlotCoverage([slots[0]!], candidateText).coverage;
  const rightCoverage = computeSlotCoverage([slots[1]!], candidateText).coverage;
  if (leftCoverage >= 0.5 && leftCoverage > rightCoverage) {
    return 0;
  }
  if (rightCoverage >= 0.5 && rightCoverage > leftCoverage) {
    return 1;
  }
  return null;
}

function computeComparisonSlotSpecificityMetrics(
  slot: string,
  candidateText: string,
): {
  recall: number;
  precision: number;
  specificity: number;
  positionWeightedRecall: number;
  positionWeightedPrecision: number;
  positionWeightedSpecificity: number;
  firstPersonClauseCount: number;
  prospectivePersonalVerbCount: number;
  planningDensity: number;
  pastness: number;
  sideWitnessScore: number;
} {
  const slotTerms = normalizeContentTerms(slot);
  const candidateTerms = normalizeContentTerms(candidateText);
  const candidateTermSequence = normalizeContentTermSequence(candidateText);
  const firstPositions = buildFirstContentTermPositions(candidateTermSequence);
  const matchedTerms = [...slotTerms].filter((term) => candidateTerms.has(term));
  const matched = matchedTerms.length;
  const positionWeightedMatched = matchedTerms.reduce((sum, term) => {
    const position = firstPositions.get(term);
    if (typeof position !== "number") {
      return sum;
    }
    const earlyThreshold = candidateTermSequence.length * 0.3;
    return sum + (position < earlyThreshold ? 1 : 0.5);
  }, 0);
  const recall = slotTerms.size > 0 ? matched / slotTerms.size : 0;
  const precision = matched / Math.max(5, candidateTerms.size);
  const useSpecificity = slotTerms.size >= 2;
  const specificity = recall * precision;
  const positionWeightedRecall = slotTerms.size > 0 ? positionWeightedMatched / slotTerms.size : 0;
  const positionWeightedPrecision = positionWeightedMatched / Math.max(5, candidateTerms.size);
  const positionWeightedSpecificity = positionWeightedRecall * positionWeightedPrecision;
  const { firstPersonClauseCount, prospectivePersonalVerbCount, planningDensity, pastness } = computePastness(candidateText);
  return {
    recall,
    precision,
    specificity,
    positionWeightedRecall,
    positionWeightedPrecision,
    positionWeightedSpecificity,
    firstPersonClauseCount,
    prospectivePersonalVerbCount,
    planningDensity,
    pastness,
    sideWitnessScore: useSpecificity
      ? positionWeightedSpecificity * Math.max(0.6, pastness)
      : recall,
  };
}

function findBestComparisonCoveragePair(
  leftCandidates: Array<{
    item: SearchResult;
    finalScore: number;
    tokenEstimate: number;
    slotMatches: string[];
  }>,
  rightCandidates: Array<{
    item: SearchResult;
    finalScore: number;
    tokenEstimate: number;
    slotMatches: string[];
  }>,
  selectionTokenBudget: number,
): Array<{
  item: SearchResult;
  finalScore: number;
  tokenEstimate: number;
  slotMatches: string[];
}> | null {
  let bestPair: Array<{
    item: SearchResult;
    finalScore: number;
    tokenEstimate: number;
    slotMatches: string[];
  }> | null = null;
  let bestPairScore = Number.NEGATIVE_INFINITY;

  for (const left of leftCandidates) {
    for (const right of rightCandidates) {
      if (left.item.id === right.item.id) {
        continue;
      }
      const totalTokens = left.tokenEstimate + right.tokenEstimate;
      if (totalTokens > selectionTokenBudget) {
        continue;
      }
      const pairScore = left.finalScore + right.finalScore;
      const currentTokens = bestPair ? bestPair[0]!.tokenEstimate + bestPair[1]!.tokenEstimate : Number.POSITIVE_INFINITY;
      if (pairScore > bestPairScore || (pairScore === bestPairScore && totalTokens < currentTokens)) {
        bestPair = [left, right];
        bestPairScore = pairScore;
      }
    }
  }

  return bestPair;
}

function buildTemporalRecoveryRationale(slotCoverage: number, anchorDensity: number, semanticScore: number): string {
  if (slotCoverage >= 0.5 && anchorDensity >= 0.5) {
    return "slot coverage and temporal anchors both supported this candidate";
  }
  if (slotCoverage >= 0.5) {
    return "slot coverage lifted this candidate toward the query's subevents";
  }
  if (anchorDensity >= 0.5) {
    return "temporal anchors lifted this candidate toward the query's date logic";
  }
  if (semanticScore >= 0.6) {
    return "semantic similarity kept this candidate in the temporal pool";
  }
  return "candidate remained in the bounded temporal recovery pool";
}

function computeRecencyScore(item: SearchResult, now: number, recencyLambda: number): number {
  const ts = typeof item.metadata.ts === "number" ? item.metadata.ts : now;
  const ageSeconds = Math.max(0, now - ts) / 1000;
  return Math.exp(-recencyLambda * ageSeconds);
}

function splitTemporalClauses(text: string): string[] {
  return text
    .split(/(?:\bafter\b|\bbefore\b|\bbetween\b|\bor\b|\band\b|\bthen\b|[?.!,;\n]+)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function normalizeTerms(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/i)
    .filter((term) => term.length > 0);
}

function normalizeContentTerms(text: string): Set<string> {
  return new Set(
    normalizeContentTermSequence(text),
  );
}

function normalizeContentTermSequence(text: string): string[] {
  return normalizeTerms(text).filter((term) => term.length >= 3 && !TEMPORAL_SLOT_STOPWORDS.has(term));
}

function buildFirstContentTermPositions(terms: string[]): Map<string, number> {
  const positions = new Map<string, number>();
  for (let index = 0; index < terms.length; index += 1) {
    const term = terms[index]!;
    if (!positions.has(term)) {
      positions.set(term, index);
    }
  }
  return positions;
}

function computePastness(text: string): {
  firstPersonClauseCount: number;
  prospectivePersonalVerbCount: number;
  planningDensity: number;
  pastness: number;
} {
  const lower = text.toLowerCase();
  const firstPersonClauseCount = Math.max(1, countPatternMatches(lower, COMPARISON_FIRST_PERSON_CLAUSE_PATTERNS));
  const prospectivePersonalVerbCount = countPatternMatches(lower, COMPARISON_PROSPECTIVE_PERSONAL_PATTERNS);
  const planningDensity = prospectivePersonalVerbCount / firstPersonClauseCount;
  return {
    firstPersonClauseCount,
    prospectivePersonalVerbCount,
    planningDensity,
    pastness: clamp01(1 - planningDensity),
  };
}

function countPatternMatches(text: string, patterns: RegExp[]): number {
  let count = 0;
  for (const pattern of patterns) {
    for (const _match of text.matchAll(pattern)) {
      count += 1;
    }
  }
  return count;
}

function touchTemporalAnchorCache(cacheKey: string, value: number): void {
  if (temporalAnchorCache.has(cacheKey)) {
    temporalAnchorCache.delete(cacheKey);
  }
  temporalAnchorCache.set(cacheKey, value);
  if (temporalAnchorCache.size > TEMPORAL_ANCHOR_CACHE_MAX) {
    const oldestKey = temporalAnchorCache.keys().next().value;
    if (typeof oldestKey === "string") {
      temporalAnchorCache.delete(oldestKey);
    }
  }
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
