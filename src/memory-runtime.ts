import type { RpcGetter } from "./plugin-runtime.js";
import type { PluginConfig, SearchResult } from "./types.js";

type MemorySearchParams = {
  query?: string;
  text?: string;
  input?: string;
  q?: string;
  k?: number;
  limit?: number;
  topK?: number;
  userId?: string;
  agentId?: string;
  sessionId?: string;
  context?: {
    userId?: string;
    agentId?: string;
    sessionId?: string;
  };
};

type MemoryRuntimeStatus = {
  ok?: boolean;
  message?: string;
  turnCount?: number;
  memoryCount?: number;
  gatingThreshold?: number;
  abstractiveReady?: boolean;
  embeddingProfile?: string;
};

export function buildMemoryRuntimeBridge(getRpc: RpcGetter, cfg: PluginConfig) {
  return {
    async getMemorySearchManager(params: { agentId?: string; purpose?: string } = {}) {
      return {
        manager: createMemorySearchManager(getRpc, cfg, params),
      };
    },
    resolveMemoryBackendConfig() {
      // We keep retrieval inside the plugin-side sidecar rather than delegating to
      // OpenClaw's external QMD path.
      return { backend: "builtin" };
    },
    async closeAllMemorySearchManagers() {
      // Context-engine lifecycle cleanup still happens through gateway_stop.
    },
  };
}

function createMemorySearchManager(
  getRpc: RpcGetter,
  cfg: PluginConfig,
  defaults: { agentId?: string; purpose?: string },
) {
  return {
    async search(params: MemorySearchParams = {}) {
      const queryText = firstString(params.query, params.text, params.input, params.q);
      if (!queryText) {
        return { results: [], error: "Missing query text for LibraVDB memory search" };
      }

      const userId = firstString(
        params.userId,
        params.context?.userId,
        params.agentId,
        params.context?.agentId,
        defaults.agentId,
        "default",
      )!;
      const sessionId = firstString(params.sessionId, params.context?.sessionId);
      const k = normalizePositiveInteger(params.k, params.limit, params.topK, cfg.topK, 8);
      const collections = resolveSearchCollections(cfg, userId, sessionId);
      const rpc = await getRpc();

      const result = collections.length === 1
        ? await rpc.call<{ results: SearchResult[] }>("search_text", {
            collection: collections[0],
            text: queryText,
            k,
          })
        : await rpc.call<{ results: SearchResult[] }>("search_text_collections", {
            collections,
            text: queryText,
            k,
            excludeByCollection: {},
          });

      return {
        results: result.results.map((item) => ({
          ...item,
          content: item.text,
        })),
      };
    },
    async ingest() {
      // The plugin already owns per-turn ingest through the context engine.
      return { ingested: false, delegatedToContextEngine: true };
    },
    async sync() {
      // Projections and compaction sync are already handled inside the existing
      // context-engine lifecycle.
      return { synced: true, delegatedToContextEngine: true };
    },
    async status() {
      const rpc = await getRpc();
      const status = await rpc.call<MemoryRuntimeStatus>("status", {});
      return {
        ok: status.ok ?? false,
        message: status.message ?? "ok",
        turnCount: status.turnCount ?? 0,
        memoryCount: status.memoryCount ?? 0,
        gatingThreshold: status.gatingThreshold,
        abstractiveReady: status.abstractiveReady ?? false,
        embeddingProfile: status.embeddingProfile ?? "unknown",
        purpose: defaults.purpose,
      };
    },
  };
}

function resolveSearchCollections(cfg: PluginConfig, userId: string, sessionId?: string): string[] {
  const collections = [`user:${userId}`, "global"];
  if (!sessionId) {
    return collections;
  }

  if (cfg.useSessionSummarySearchExperiment) {
    collections.unshift(`session_summary:${sessionId}`);
    return collections;
  }
  if (cfg.useSessionRecallProjection) {
    collections.unshift(`session_recall:${sessionId}`);
    return collections;
  }
  collections.unshift(`session:${sessionId}`);
  return collections;
}

function firstString(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === "string" && value.length > 0);
}

function normalizePositiveInteger(...values: Array<number | undefined>): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.max(1, Math.floor(value));
    }
  }
  return 8;
}
