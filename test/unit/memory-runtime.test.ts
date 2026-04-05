import test from "node:test";
import assert from "node:assert/strict";

import { buildMemoryRuntimeBridge } from "../../src/memory-runtime.js";
import type { PluginConfig, SearchResult } from "../../src/types.js";

class FakeRpc {
  public calls: Array<{ method: string; params: Record<string, unknown> }> = [];

  async call<T>(method: string, params: Record<string, unknown>): Promise<T> {
    this.calls.push({ method, params });

    switch (method) {
      case "search_text_collections":
        return {
          results: [
            {
              id: "m1",
              score: 0.91,
              text: "remembered item",
              metadata: { collection: "user:u1" },
            },
          ],
        } as T;
      case "status":
        return {
          ok: true,
          message: "ok",
          turnCount: 12,
          memoryCount: 4,
          gatingThreshold: 0.35,
          abstractiveReady: false,
          embeddingProfile: "nomic-embed-text-v1.5",
        } as T;
      default:
        throw new Error(`unexpected rpc method: ${method}`);
    }
  }
}

test("memory runtime bridge registers a manager that searches session and durable collections", async () => {
  const rpc = new FakeRpc();
  const cfg: PluginConfig = { topK: 6, useSessionRecallProjection: true };
  const runtime = buildMemoryRuntimeBridge(async () => rpc as never, cfg);
  const { manager } = await runtime.getMemorySearchManager({ agentId: "u1" });

  const result = await manager.search({
    query: "find prior context",
    sessionId: "s1",
  });

  assert.equal(rpc.calls[0]?.method, "search_text_collections");
  assert.deepEqual(rpc.calls[0]?.params.collections, ["session_recall:s1", "user:u1", "global"]);
  assert.equal(rpc.calls[0]?.params.k, 6);
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0]?.content, "remembered item");
});

test("memory runtime bridge exposes sidecar status and keeps ingest delegated", async () => {
  const rpc = new FakeRpc();
  const cfg: PluginConfig = {};
  const runtime = buildMemoryRuntimeBridge(async () => rpc as never, cfg);
  const { manager } = await runtime.getMemorySearchManager({ purpose: "status" });

  const status = await manager.status();
  const ingest = await manager.ingest();
  const sync = await manager.sync();

  assert.equal(status.ok, true);
  assert.equal(status.turnCount, 12);
  assert.equal(status.embeddingProfile, "nomic-embed-text-v1.5");
  assert.deepEqual(ingest, { ingested: false, delegatedToContextEngine: true });
  assert.deepEqual(sync, { synced: true, delegatedToContextEngine: true });
});
