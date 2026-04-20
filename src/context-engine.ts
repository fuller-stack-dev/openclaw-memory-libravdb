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
    async ingest(args: { sessionId: string; sessionKey?: string; userId?: string; message: { role: string; content: string; id?: string }; isHeartbeat?: boolean }) {
      const kernel = runtime.getKernel();
      if (kernel) {
        return await kernel.ingestMessage({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
          message: args.message,
          isHeartbeat: args.isHeartbeat,
        });
      }
      const rpc = await runtime.getRpc();
      return await rpc.call("ingest_message_kernel", args);
    },
    async assemble(args: {
      sessionId: string;
      sessionKey?: string;
      userId?: string;
      messages: Array<{ role: string; content: string; id?: string }>;
      tokenBudget: number;
      prompt?: string;
    }): Promise<AssembleContextInternalResponse> {
      const kernel = runtime.getKernel();
      if (kernel) {
        return await kernel.assembleContext({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
          queryText: args.prompt ?? "",
          visibleMessages: args.messages,
          tokenBudget: args.tokenBudget,
          config: {},
          emitDebug: true
        });
      }

      const rpc = await runtime.getRpc();
      const resp = await rpc.call<AssembleContextInternalResponse>("assemble_context_internal", {
        sessionId: args.sessionId,
        sessionKey: args.sessionKey,
        userId: args.userId,
        messages: args.messages,
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
      return resp;
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
      messages: Array<{ role: string; content: string; id?: string }>;
      prePromptMessageCount?: number;
      isHeartbeat?: boolean;
    }) {
      const kernel = runtime.getKernel();
      if (kernel) {
        return await kernel.afterTurn({
          sessionId: args.sessionId,
          sessionKey: args.sessionKey,
          userId: args.userId,
          messages: args.messages,
          prePromptMessageCount: args.prePromptMessageCount,
          isHeartbeat: args.isHeartbeat,
        });
      }
      const rpc = await runtime.getRpc();
      return await rpc.call("after_turn_kernel", args);
    }
  };
}
