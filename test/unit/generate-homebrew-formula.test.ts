import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function loadModule() {
  return await import(pathToFileURL(path.join(process.cwd(), "scripts", "generate-homebrew-formula.js")).href);
}

test("collectChecksums reads required daemon checksum files", async () => {
  const { collectChecksums } = await loadModule();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "libravdbd-formula-"));
  fs.writeFileSync(path.join(dir, "libravdbd-darwin-arm64.sha256"), "a".repeat(64));
  fs.writeFileSync(path.join(dir, "libravdbd-darwin-amd64.sha256"), "b".repeat(64));
  fs.writeFileSync(path.join(dir, "libravdbd-linux-arm64.sha256"), "c".repeat(64));
  fs.writeFileSync(path.join(dir, "libravdbd-linux-amd64.sha256"), "d".repeat(64));

  assert.deepEqual(collectChecksums(dir), {
    "__SHA256_DARWIN_ARM64__": "a".repeat(64),
    "__SHA256_DARWIN_AMD64__": "b".repeat(64),
    "__SHA256_LINUX_ARM64__": "c".repeat(64),
    "__SHA256_LINUX_AMD64__": "d".repeat(64),
  });
});

test("buildFormula fills version and checksum placeholders", async () => {
  const { buildFormula } = await loadModule();
  assert.equal(
    buildFormula({
      version: "1.3.7",
      template: "version \"__VERSION__\"\nsha256 \"__SHA256_DARWIN_ARM64__\"\n",
      checksums: {
        "__SHA256_DARWIN_ARM64__": "e".repeat(64),
      },
    }),
    `version "1.3.7"\nsha256 "${"e".repeat(64)}"\n`,
  );
});
