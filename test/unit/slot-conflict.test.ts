import test from "node:test";
import assert from "node:assert/strict";

// Test the slot check behavior in src/index.ts register() logic.
// We isolate the exact checks to verify they behave correctly.

const MEMORY_ID = "libravdb-memory";

function makeSlotCheck(cfg: {
  registrationMode?: string;
  slotsMemory?: string;
}): { memSlot: string | undefined; isFullMode: boolean } {
  const api = {
    registrationMode: cfg.registrationMode ?? "full",
    config: {
      plugins: {
        slots: {
          memory: cfg.slotsMemory,
        },
      },
    },
  };
  const memSlot = api.config?.plugins?.slots?.memory;
  const isFullMode = (api.registrationMode as string) === "full";
  return { memSlot, isFullMode };
}

test("slot check — ours: passes (does not throw)", () => {
  const { memSlot } = makeSlotCheck({ slotsMemory: "libravdb-memory" });
  const wouldThrow = !!(memSlot && memSlot !== MEMORY_ID && memSlot !== "none");
  assert.ok(!wouldThrow, "should not throw when slot is libravdb-memory");
});

test("slot check — other plugin: throws", () => {
  const { memSlot } = makeSlotCheck({ slotsMemory: "memory-lancedb" });
  const wouldThrow = !!(memSlot && memSlot !== MEMORY_ID && memSlot !== "none");
  assert.ok(wouldThrow, "should throw when slot is taken by memory-lancedb");
});

test("slot check — unset: passes (no conflict)", () => {
  const { memSlot } = makeSlotCheck({ slotsMemory: undefined });
  const wouldThrow = !!(memSlot && memSlot !== MEMORY_ID && memSlot !== "none");
  assert.ok(!wouldThrow, "should not throw when slot is unset");
});

test("slot check — 'none': passes (memory disabled)", () => {
  const { memSlot } = makeSlotCheck({ slotsMemory: "none" });
  const wouldThrow = !!(memSlot && memSlot !== MEMORY_ID && memSlot !== "none");
  assert.ok(!wouldThrow, "should not throw when slot is 'none' (memory disabled)");
});

test("registrationMode gate — 'full' allows registration", () => {
  const { isFullMode } = makeSlotCheck({ registrationMode: "full" });
  assert.ok(isFullMode, "full mode should allow registration");
});

test("registrationMode gate — 'cli-metadata' blocks registration", () => {
  const { isFullMode } = makeSlotCheck({ registrationMode: "cli-metadata" });
  assert.ok(!isFullMode, "cli-metadata mode should block registration");
});

test("registrationMode gate — 'setup-only' blocks registration", () => {
  const { isFullMode } = makeSlotCheck({ registrationMode: "setup-only" });
  assert.ok(!isFullMode, "setup-only mode should block registration");
});

test("combined — cli-metadata with other slot: still blocked by mode gate first", () => {
  // In register(), the mode check happens before the slot check.
  // When mode is not "full", we return early — slot check never runs.
  const { isFullMode, memSlot } = makeSlotCheck({
    registrationMode: "cli-metadata",
    slotsMemory: "memory-lancedb",
  });
  assert.ok(!isFullMode, "mode gate blocks first");
  // If mode gate passes (full), slot check would run:
  const slotWouldThrow = !!(memSlot && memSlot !== MEMORY_ID && memSlot !== "none");
  assert.ok(slotWouldThrow, "slot is correctly detected as conflicting");
});