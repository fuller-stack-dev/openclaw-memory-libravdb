const SESSION_KEY_NAMESPACE_PREFIX = "session-key:";
const AGENT_ID_NAMESPACE_PREFIX = "agent-id:";

export function resolveDurableNamespace(params: {
  userId?: string;
  sessionKey?: string;
  agentId?: string;
  fallback?: string;
}): string {
  const explicitUserId = firstNonEmpty(params.userId);
  if (explicitUserId) {
    return explicitUserId;
  }

  const sessionKey = firstNonEmpty(params.sessionKey);
  if (sessionKey) {
    return `${SESSION_KEY_NAMESPACE_PREFIX}${sessionKey}`;
  }

  const agentId = firstNonEmpty(params.agentId);
  if (agentId) {
    return `${AGENT_ID_NAMESPACE_PREFIX}${agentId}`;
  }

  return firstNonEmpty(params.fallback) ?? "default";
}

function firstNonEmpty(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
