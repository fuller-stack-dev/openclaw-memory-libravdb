import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function read(filePath: string): string {
  return fs.readFileSync(path.join(process.cwd(), filePath), "utf8");
}

test("daemon packaging scripts keep runtime and model asset layout in sync", () => {
  const buildDaemon = read("scripts/build-daemon.sh");
  const postinstall = read("scripts/postinstall.js");
  const setup = read("scripts/setup.ts");

  for (const source of [buildDaemon, postinstall, setup]) {
    assert.match(source, /onnxruntime/);
    assert.match(source, /nomic-embed-text-v1\.5/);
    assert.match(source, /t5-small/);
  }
});
