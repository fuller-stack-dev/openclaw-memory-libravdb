export const DAEMON_RELEASE_REPO = "https://github.com/xDarkicex/homebrew-openclaw-libravdb-memory/releases/download";

export const DAEMON_RELEASE_TARGETS = {
  "darwin-arm64": "libravdbd-darwin-arm64",
  "darwin-x64": "libravdbd-darwin-amd64",
  "linux-x64": "libravdbd-linux-amd64",
  "linux-arm64": "libravdbd-linux-arm64",
  "win32-x64": "libravdbd-windows-amd64.exe",
};

export function detectDaemonReleaseTarget(platform = process.platform, arch = process.arch) {
  return DAEMON_RELEASE_TARGETS[`${platform}-${arch}`] ?? null;
}

export function buildDaemonReleaseAssetURL(version, target) {
  return `${DAEMON_RELEASE_REPO}/v${version}/${target}`;
}
