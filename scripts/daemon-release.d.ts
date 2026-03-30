export const DAEMON_RELEASE_REPO: string;
export const DAEMON_RELEASE_TARGETS: Record<string, string>;
export function detectDaemonReleaseTarget(platform?: string, arch?: string): string | null;
export function buildDaemonReleaseAssetURL(version: string, target: string): string;
