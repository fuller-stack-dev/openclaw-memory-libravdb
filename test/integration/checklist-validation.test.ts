import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

test("manifest and package metadata satisfy checklist structure", async () => {
  const manifest = JSON.parse(await readFile(path.join(repoRoot, "openclaw.plugin.json"), "utf8"));
  const pkg = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
  const hookMd = await readFile(path.join(repoRoot, "HOOK.md"), "utf8");

  assert.equal(manifest.kind, "context-engine");
  assert.equal(manifest.configSchema.additionalProperties, false);
  assert.deepEqual(
    Object.keys(manifest).sort(),
    ["configSchema", "description", "id", "kind", "name", "version"],
  );
  assert.equal(manifest.version, pkg.version);

  assert.equal(pkg.main, "./dist/index.js");
  assert.equal(pkg.types, "./dist/index.d.ts");
  assert.ok(Array.isArray(pkg.openclaw?.extensions));
  assert.ok(pkg.openclaw.extensions.includes("./dist/index.js"));
  assert.equal(pkg.exports["."].import, "./dist/index.js");
  assert.match(hookMd, /name:\s*libravdb-memory/);
});

test("source checklist invariants are present in host code", async () => {
  const indexTs = await readFile(path.join(repoRoot, "src/index.ts"), "utf8");
  const memoryProviderTs = await readFile(path.join(repoRoot, "src/memory-provider.ts"), "utf8");

  assert.match(indexTs, /openclaw\/plugin-sdk\/plugin-entry/);
  assert.match(indexTs, /api\.pluginConfig/);
  assert.match(indexTs, /kind:\s*"context-engine"/);
  assert.match(indexTs, /registerContextEngine\("libravdb-memory"/);
  assert.match(indexTs, /registerMemoryPromptSection/);
  assert.match(indexTs, /registerMemoryRuntime\?\.\(/);
  assert.match(indexTs, /api\.on\("before_reset"/);
  assert.match(indexTs, /api\.on\("session_end"/);
  assert.match(indexTs, /api\.on\("gateway_stop"/);
  assert.doesNotMatch(indexTs, /api\.on\("shutdown"/);
  assert.doesNotMatch(indexTs, /async register\s*\(/);
  assert.match(memoryProviderTs, /availableTools/);
  assert.match(memoryProviderTs, /context-engine assembler/);
  assert.doesNotMatch(indexTs, /api\.config/);
});
