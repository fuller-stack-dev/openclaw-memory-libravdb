import type { PluginConfig, RecallCache, SearchResult } from "./types.js";
import type { RpcGetter } from "./plugin-runtime.js";
import { scoreCandidates } from "./scoring.js";
import { fitPromptBudget } from "./tokens.js";
import { buildMemoryHeader } from "./recall-utils.js";

const MEMORY_PROMPT_BUDGET = 800;

export function buildMemoryPromptSection(
  getRpc: RpcGetter,
  cfg: PluginConfig,
  recallCache: RecallCache<SearchResult>,
): (params: {
  availableTools: Set<string>;
  citationsMode?: string;
  messages?: Array<{ role: string; content: string }>;
  userId?: string;
}) => Promise<string[]> {
  return async function memoryPromptSection(params: {
    availableTools: Set<string>;
    citationsMode?: string;
    messages?: Array<{ role: string; content: string }>;
    userId?: string;
  }): Promise<string[]> {
    const queryText = params.messages?.at(-1)?.content ?? "";
    const userId = params.userId ?? "default";

    if (!queryText) {
      return [
        "## Memory",
        "LibraVDB persistent memory is active. Recalled memories will appear",
        "in context via the context-engine assembler when relevant.",
        "",
      ];
    }

    const rpc = await getRpc();

    const [userHitsResult, globalHitsResult] = await Promise.all([
      rpc.call<{ results: SearchResult[] }>("search_text", {
        collection: `user:${userId}`,
        text: queryText,
        k: Math.ceil((cfg.topK ?? 8) / 2),
      }),
      rpc.call<{ results: SearchResult[] }>("search_text", {
        collection: "global",
        text: queryText,
        k: Math.ceil((cfg.topK ?? 8) / 4),
      }),
    ]);

    const userHits = userHitsResult.results;
    const globalHits = globalHitsResult.results;

    recallCache.put({
      userId,
      queryText,
      durableVariantHits: [],
      userHits,
      globalHits,
    });

    const ranked = scoreCandidates([...userHits, ...globalHits], {
      alpha: cfg.alpha,
      beta: cfg.beta,
      gamma: cfg.gamma,
      sessionId: "",
      userId,
    });

    const selected = fitPromptBudget(ranked, MEMORY_PROMPT_BUDGET);
    const recallHeader = buildMemoryHeader(selected);

    const lines: string[] = [
      "## Memory",
      "LibraVDB persistent memory is active. Recalled memories will appear",
      "in context via the context-engine assembler when relevant.",
    ];

    if (recallHeader) {
      lines.push(...recallHeader.split("\n"));
    }

    lines.push("");
    return lines;
  };
}