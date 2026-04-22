import type { PluginRuntime } from "./plugin-runtime.js";
import type {
  LoggerLike,
  PluginConfig,
  RecallCache,
  SearchResult,
} from "./types.js";
import {
  AssembleContextInternalRequest,
  AssembleContextInternalResponse,
  BootstrapSessionKernelRequest,
  IngestMessageKernelRequest,
  CompactSessionRequest,
} from "./generated/libravdb/ipc/v1/rpc_pb.js";
import { resolveDurableNamespace } from "./durable-namespace.js";

type KernelCompatibleMessage = {
  role: string;
  content: string;
  id?: string;
};

type OpenClawCompatibleMessage = {
  role: string;
  content: Array<{ type: "text"; text: string }>;
  id?: string;
};

type OpenClawCompatibleAssembleResult = {
  messages: OpenClawCompatibleMessage[];
  estimatedTokens: number;
  systemPromptAddition: string;
  debug?: AssembleContextInternalResponse["debug"];
};

function stringifyKernelBlock(block: unknown): string {
  if (!block || typeof block !== "object") {
    return "";
  }
  const record = block as Record<string, unknown>;
  switch (record.type) {
    case "text":
      return typeof record.text === "string" ? record.text : "";
    case "thinking":
      return typeof record.thinking === "string" ? record.thinking : "";
    case "toolCall": {
      const name = typeof record.name === "string" ? record.name : "tool";
      const args = record.arguments;
      let renderedArgs = "";
      if (typeof args === "string") {
        renderedArgs = args;
      } else if (args !== undefined) {
        try {
          renderedArgs = JSON.stringify(args);
        } catch {
          renderedArgs = String(args);
        }
      }
      return renderedArgs ? `[tool:${name}] ${renderedArgs}` : `[tool:${name}]`;
    }
    case "image":
      return "[image omitted]";
    default:
      return typeof record.text === "string" ? record.text : "";
  }
}

function normalizeKernelContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }
  return content.map(stringifyKernelBlock).filter((part) => part.length > 0).join("\n");
}

export function normalizeKernelMessage(message: {
  role: string;
  content: unknown;
  id?: string;
}): KernelCompatibleMessage {
  return {
    role: message.role,
    content: normalizeKernelContent(message.content),
    ...(typeof message.id === "string" ? { id: message.id } : {}),
  };
}

export function normalizeKernelMessages(
  messages: Array<{ role: string; content: unknown; id?: string }>,
): KernelCompatibleMessage[] {
  return messages.map((message) => normalizeKernelMessage(message));
}

export function normalizeAssembleResult(result: {
  messages?: Array<{ role: string; content?: unknown; id?: string }>;
  estimatedTokens?: number;
  systemPromptAddition?: string;
  debug?: AssembleContextInternalResponse["debug"];
}): OpenClawCompatibleAssembleResult {
  const messages = Array.isArray(result.messages)
    ? result.messages.map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: [{ type: "text" as const, text: normalizeKernelContent(message.content) }],
        ...(typeof message.id === "string" ? { id: message.id } : {}),
      }))
    : [];
  return {
    messages,
    estimatedTokens:
      typeof result.estimatedTokens === "number" ? result.estimatedTokens : 0,
    systemPromptAddition:
      typeof result.systemPromptAddition === "string" ? result.systemPromptAddition : "",
    ...(result.debug !== undefined ? { debug: result.debug } : {}),
  };
}

export function buildContextEngineFactory(
  runtime: PluginRuntime,
  cfg: PluginConfig,
  recallCache: RecallCache<SearchResult>,
  logger: LoggerLike = console,
) {
  return {
    info: { id: "libravdb-memory", name: "LibraVDB Memory", ownsCompaction: true },
    ownsCompaction: true,
    async bootstrap(args: { sessionId: string; sessionKey?: string; userId?: string }) {
      const kernel = runtime.getKernel();
      if (kernel) {
        try {
          await kernel.initializeSession({
            clientId: "openclaw-ts-wrapper",
            clientCapabilities: [{ name: "grpc", version: "1.0" }]
          });
        } catch (error) {
           // Proceed even if initialize session fails or doesn't return nonce if secret optional
        }
        return await kernel.bootstrapSession({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
        });
      }
      const rpc = await runtime.getRpc();
      return await rpc.call("bootstrap_session_kernel", args);
    },
    async ingest(args: { sessionId: string; sessionKey?: string; userId?: string; message: { role: string; content: unknown; id?: string }; isHeartbeat?: boolean }) {
      const message = normalizeKernelMessage(args.message);
      const kernel = runtime.getKernel();
      if (kernel) {
        return await kernel.ingestMessage({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
          message,
          isHeartbeat: args.isHeartbeat,
        });
      }
      const rpc = await runtime.getRpc();
      return await rpc.call("ingest_message_kernel", {
        ...args,
        message,
      });
    },
    async assemble(args: {
      sessionId: string;
      sessionKey?: string;
      userId?: string;
      messages: Array<{ role: string; content: unknown; id?: string }>;
      tokenBudget: number;
      prompt?: string;
    }): Promise<OpenClawCompatibleAssembleResult> {
      const messages = normalizeKernelMessages(args.messages);
      const kernel = runtime.getKernel();
      if (kernel) {
        return normalizeAssembleResult(await kernel.assembleContext({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
          queryText: args.prompt ?? "",
          visibleMessages: messages,
          tokenBudget: args.tokenBudget,
          config: {},
          emitDebug: true
        }));
      }

      const rpc = await runtime.getRpc();
      const resp = await rpc.call<AssembleContextInternalResponse>("assemble_context_internal", {
        sessionId: args.sessionId,
        sessionKey: args.sessionKey,
        userId: args.userId,
        messages,
        tokenBudget: args.tokenBudget,
        prompt: args.prompt,
        emitDebug: true,
        config: {
          useSessionRecallProjection: cfg.useSessionRecallProjection,
          useSessionSummarySearchExperiment: cfg.useSessionSummarySearchExperiment,
          tokenBudgetFraction: cfg.tokenBudgetFraction,
          authoredHardBudgetFraction: cfg.authoredHardBudgetFraction,
          authoredSoftBudgetFraction: cfg.authoredSoftBudgetFraction,
          elevatedGuidanceBudgetFraction: cfg.elevatedGuidanceBudgetFraction,
          topK: cfg.topK,
          continuityMinTurns: cfg.continuityMinTurns,
          continuityTailBudgetTokens: cfg.continuityTailBudgetTokens,
          continuityPriorContextTokens: cfg.continuityPriorContextTokens,
          compactThreshold: cfg.compactThreshold,
          compactSessionTokenBudget: cfg.compactSessionTokenBudget,
          section7Theta1: cfg.section7Theta1,
          section7Kappa: cfg.section7Kappa,
          section7HopEta: cfg.section7HopEta,
          section7HopThreshold: cfg.section7HopThreshold,
          section7CoarseTopK: cfg.section7CoarseTopK,
          section7SecondPassTopK: cfg.section7SecondPassTopK,
          section7AuthorityRecencyLambda: cfg.section7AuthorityRecencyLambda,
          section7AuthorityRecencyWeight: cfg.section7AuthorityRecencyWeight,
          section7AuthorityFrequencyWeight: cfg.section7AuthorityFrequencyWeight,
          section7AuthorityAuthoredWeight: cfg.section7AuthorityAuthoredWeight,
          recoveryFloorScore: cfg.recoveryFloorScore,
          recoveryMinTopK: cfg.recoveryMinTopK,
          recoveryMinConfidenceMean: cfg.recoveryMinConfidenceMean,
          recencyLambdaSession: cfg.recencyLambdaSession,
          recencyLambdaUser: cfg.recencyLambdaUser,
          recencyLambdaGlobal: cfg.recencyLambdaGlobal,
          ingestionGateThreshold: cfg.ingestionGateThreshold,
        },
      });
      return normalizeAssembleResult(resp);
    },
    async compact(args: { sessionId: string; force?: boolean; targetSize?: number }) {
      const kernel = runtime.getKernel();
      if (kernel) {
        return await kernel.compactSession({
          sessionId: args.sessionId,
          force: args.force,
          targetSize: args.targetSize,
        });
      }
      const rpc = await runtime.getRpc();
      return await rpc.call("compact_session", args);
    },
    async afterTurn(args: {
      sessionId: string;
      sessionKey?: string;
      userId?: string;
      messages: Array<{ role: string; content: unknown; id?: string }>;
      prePromptMessageCount?: number;
      isHeartbeat?: boolean;
    }) {
      const messages = normalizeKernelMessages(args.messages);
      const kernel = runtime.getKernel();
      if (kernel) {
        return await kernel.afterTurn({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
          messages,
          prePromptMessageCount: args.prePromptMessageCount,
          isHeartbeat: args.isHeartbeat,
        });
      }
      const rpc = await runtime.getRpc();
      return await rpc.call("after_turn_kernel", {
        ...args,
        messages,
      });
    }
  };
}
