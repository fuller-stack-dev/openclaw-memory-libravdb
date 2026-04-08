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

  return params.fallback ?? "default";
}

function firstNonEmpty(value: string | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
