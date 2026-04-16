import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

async function loadReleaseModule() {
  return await import(pathToFileURL(path.join(process.cwd(), "scripts", "daemon-release.js")).href);
}

test("detectDaemonReleaseTarget matches the spec platform table", async () => {
  const {
    DAEMON_RELEASE_TARGETS,
    detectDaemonReleaseTarget,
  } = await loadReleaseModule();

  assert.equal(detectDaemonReleaseTarget("darwin", "arm64"), "libravdbd-darwin-arm64");
  assert.equal(detectDaemonReleaseTarget("darwin", "x64"), "libravdbd-darwin-amd64");
  assert.equal(detectDaemonReleaseTarget("linux", "x64"), "libravdbd-linux-amd64");
  assert.equal(detectDaemonReleaseTarget("linux", "arm64"), "libravdbd-linux-arm64");
  assert.equal(detectDaemonReleaseTarget("win32", "x64"), "libravdbd-windows-amd64.exe");
  assert.equal(detectDaemonReleaseTarget("freebsd", "x64"), null);
  assert.equal(Object.keys(DAEMON_RELEASE_TARGETS).length, 5);
});

test("buildDaemonReleaseAssetURL uses tagged release assets", async () => {
  const { buildDaemonReleaseAssetURL } = await loadReleaseModule();

  assert.equal(
    buildDaemonReleaseAssetURL("1.3.0", "libravdbd-linux-amd64"),
    "https://github.com/xDarkicex/homebrew-openclaw-libravdb-memory/releases/download/v1.3.0/libravdbd-linux-amd64",
  );
});
