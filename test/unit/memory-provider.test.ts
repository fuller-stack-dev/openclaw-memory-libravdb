import test from "node:test";
import assert from "node:assert/strict";

import { buildMemoryPromptSection } from "../../src/memory-provider.js";
import { createRecallCache } from "../../src/recall-cache.js";
import type { PluginConfig, SearchResult } from "../../src/types.js";

class FakeRpc {
  public calls = new Map<string, number>();

  async call<T>(method: string, params: Record<string, unknown>): Promise<T> {
    this.calls.set(method, (this.calls.get(method) ?? 0) + 1);
    switch (method) {
      case "search_text": {
        const collection = String(params.collection);
        const results: SearchResult[] =
          collection.startsWith("user:")
            ? [{ id: "u1", score: 0.9, text: "user recall", metadata: { userId: "u1", ts: Date.now(), collection } }]
            : collection === "global"
              ? [{ id: "g1", score: 0.7, text: "global recall", metadata: { ts: Date.now(), collection: "global" } }]
              : [];
        return { results } as T;
      }
      default:
        throw new Error(`unexpected rpc method: ${method}`);
    }
  }
}

test("memory prompt section returns string array with static header when no messages", async () => {
  const rpc = new FakeRpc();
  const recallCache = createRecallCache<SearchResult>();
  const cfg: PluginConfig = { topK: 8 };
  const getRpc = async () => rpc as never;

  const memorySection = buildMemoryPromptSection(getRpc, cfg, recallCache);
  const result = await memorySection({
    availableTools: new Set(["read", "exec"]),
  });

  assert.ok(Array.isArray(result), "result should be an array");
  assert.ok(result.length > 0, "result should not be empty");
  for (const line of result) {
    assert.equal(typeof line, "string", "each element should be a string");
  }
  assert.ok(result.some((line) => line.toLowerCase().includes("memory")));
});

test("memory prompt section performs user and global search and populates cache", async () => {
  const rpc = new FakeRpc();
  const recallCache = createRecallCache<SearchResult>();
  const cfg: PluginConfig = { topK: 8 };
  const getRpc = async () => rpc as never;

  const memorySection = buildMemoryPromptSection(getRpc, cfg, recallCache);
  const result = await memorySection({
    availableTools: new Set(["memory_search"]),
    messages: [{ role: "user", content: "what is the capital of france?" }],
    userId: "u1",
  });

  assert.ok(Array.isArray(result), "result should be an array");
  assert.ok(result.length > 0, "result should not be empty");

  // Verify user and global searches were performed
  assert.equal(rpc.calls.get("search_text") ?? 0, 2, "should perform 2 search_text calls (user + global)");

  // Verify cache was populated
  const cached = recallCache.get({ userId: "u1", queryText: "what is the capital of france?" });
  assert.ok(cached, "cache should be populated");
  assert.ok(Array.isArray(cached?.userHits), "userHits should be an array");
  assert.ok(Array.isArray(cached?.globalHits), "globalHits should be an array");
  assert.equal(cached?.userHits?.length, 1, "should have 1 user hit");
  assert.equal(cached?.globalHits?.length, 1, "should have 1 global hit");
});

test("memory prompt section renders actual recall content when hits exist", async () => {
  const rpc = new FakeRpc();
  const recallCache = createRecallCache<SearchResult>();
  const cfg: PluginConfig = { topK: 8, alpha: 0.7, beta: 0.2, gamma: 0.1 };
  const getRpc = async () => rpc as never;

  const memorySection = buildMemoryPromptSection(getRpc, cfg, recallCache);
  const result = await memorySection({
    availableTools: new Set(["memory_search"]),
    messages: [{ role: "user", content: "test query" }],
    userId: "u1",
  });

  const resultText = result.join("\n");
  assert.ok(resultText.includes("LibraVDB persistent memory is active"), "should include memory header");
  // Should include the recall section with the recalled memories
  assert.ok(resultText.includes("recalled_memories"), "should include recalled_memories section");
  // Should include the actual recalled item text
  assert.ok(resultText.includes("user recall") || resultText.includes("global recall"), "should include recall item text");

  // Verify user and global searches were performed
  assert.equal(rpc.calls.get("search_text") ?? 0, 2, "should perform 2 search_text calls (user + global)");

  // Verify cache was populated
  const cached = recallCache.get({ userId: "u1", queryText: "test query" });
  assert.ok(cached, "cache should be populated");
  assert.ok(Array.isArray(cached?.userHits), "userHits should be an array");
  assert.ok(Array.isArray(cached?.globalHits), "globalHits should be an array");
});

test("memory prompt section works with citationsMode", async () => {
  const rpc = new FakeRpc();
  const recallCache = createRecallCache<SearchResult>();
  const cfg: PluginConfig = { topK: 8 };
  const getRpc = async () => rpc as never;

  const memorySection = buildMemoryPromptSection(getRpc, cfg, recallCache);
  const result = await memorySection({
    availableTools: new Set(),
    citationsMode: "inline",
    messages: [{ role: "user", content: "test" }],
    userId: "u1",
  });

  assert.ok(Array.isArray(result));
  assert.ok(result.some((line) => line.toLowerCase().includes("memory")));
});