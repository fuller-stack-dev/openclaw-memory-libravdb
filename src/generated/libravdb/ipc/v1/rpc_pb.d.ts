import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3, Struct } from "@bufbuild/protobuf";
/**
 * @generated from message libravdb.ipc.v1.RpcRequest
 */
export declare class RpcRequest extends Message<RpcRequest> {
    /**
     * @generated from field: uint64 id = 1;
     */
    id: bigint;
    /**
     * @generated from field: string method = 2;
     */
    method: string;
    /**
     * @generated from field: bytes params = 3;
     */
    params: Uint8Array<ArrayBuffer>;
    constructor(data?: PartialMessage<RpcRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RpcRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RpcRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RpcRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RpcRequest;
    static equals(a: RpcRequest | PlainMessage<RpcRequest> | undefined, b: RpcRequest | PlainMessage<RpcRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.RpcResponse
 */
export declare class RpcResponse extends Message<RpcResponse> {
    /**
     * @generated from field: uint64 id = 1;
     */
    id: bigint;
    /**
     * @generated from field: bytes result = 2;
     */
    result: Uint8Array<ArrayBuffer>;
    /**
     * @generated from field: libravdb.ipc.v1.RpcError error = 3;
     */
    error?: RpcError;
    constructor(data?: PartialMessage<RpcResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RpcResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RpcResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RpcResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RpcResponse;
    static equals(a: RpcResponse | PlainMessage<RpcResponse> | undefined, b: RpcResponse | PlainMessage<RpcResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.RpcError
 */
export declare class RpcError extends Message<RpcError> {
    /**
     * @generated from field: string message = 1;
     */
    message: string;
    /**
     * @generated from field: int32 code = 2;
     */
    code: number;
    constructor(data?: PartialMessage<RpcError>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RpcError";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RpcError;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RpcError;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RpcError;
    static equals(a: RpcError | PlainMessage<RpcError> | undefined, b: RpcError | PlainMessage<RpcError> | undefined): boolean;
}
/**
 * Proto map values cannot be repeated; wrap string slices for exclude_by_collection.
 *
 * @generated from message libravdb.ipc.v1.StringList
 */
export declare class StringList extends Message<StringList> {
    /**
     * @generated from field: repeated string values = 1;
     */
    values: string[];
    constructor(data?: PartialMessage<StringList>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.StringList";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): StringList;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): StringList;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): StringList;
    static equals(a: StringList | PlainMessage<StringList> | undefined, b: StringList | PlainMessage<StringList> | undefined): boolean;
}
/**
 * Mirrors store.SearchResult (libravdbd/store/libravdb.go).
 *
 * @generated from message libravdb.ipc.v1.SearchResult
 */
export declare class SearchResult extends Message<SearchResult> {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * @generated from field: double score = 2;
     */
    score: number;
    /**
     * @generated from field: string text = 3;
     */
    text: string;
    /**
     * @generated from field: google.protobuf.Struct metadata = 4;
     */
    metadata?: Struct;
    /**
     * @generated from field: uint64 version = 5;
     */
    version: bigint;
    constructor(data?: PartialMessage<SearchResult>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.SearchResult";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SearchResult;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SearchResult;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SearchResult;
    static equals(a: SearchResult | PlainMessage<SearchResult> | undefined, b: SearchResult | PlainMessage<SearchResult> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.MarkdownSourceMeta
 */
export declare class MarkdownSourceMeta extends Message<MarkdownSourceMeta> {
    /**
     * @generated from field: string source_root = 1;
     */
    sourceRoot: string;
    /**
     * @generated from field: string source_path = 2;
     */
    sourcePath: string;
    /**
     * @generated from field: string source_kind = 3;
     */
    sourceKind: string;
    /**
     * @generated from field: string file_hash = 4;
     */
    fileHash: string;
    /**
     * @generated from field: int64 source_size = 5;
     */
    sourceSize: bigint;
    /**
     * @generated from field: int64 source_mtime_ms = 6;
     */
    sourceMtimeMs: bigint;
    /**
     * @generated from field: int32 ingest_version = 7;
     */
    ingestVersion: number;
    /**
     * @generated from field: string hash_backend = 8;
     */
    hashBackend: string;
    constructor(data?: PartialMessage<MarkdownSourceMeta>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.MarkdownSourceMeta";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MarkdownSourceMeta;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MarkdownSourceMeta;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MarkdownSourceMeta;
    static equals(a: MarkdownSourceMeta | PlainMessage<MarkdownSourceMeta> | undefined, b: MarkdownSourceMeta | PlainMessage<MarkdownSourceMeta> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DreamPromotionEntry
 */
export declare class DreamPromotionEntry extends Message<DreamPromotionEntry> {
    /**
     * @generated from field: string text = 1;
     */
    text: string;
    /**
     * @generated from field: double score = 2;
     */
    score: number;
    /**
     * @generated from field: int32 recall_count = 3;
     */
    recallCount: number;
    /**
     * @generated from field: int32 unique_queries = 4;
     */
    uniqueQueries: number;
    /**
     * @generated from field: string section = 5;
     */
    section: string;
    /**
     * @generated from field: int32 line = 6;
     */
    line: number;
    /**
     * @generated from field: int32 source_line = 7;
     */
    sourceLine: number;
    /**
     * @generated from field: google.protobuf.Struct metadata = 8;
     */
    metadata?: Struct;
    constructor(data?: PartialMessage<DreamPromotionEntry>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DreamPromotionEntry";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DreamPromotionEntry;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DreamPromotionEntry;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DreamPromotionEntry;
    static equals(a: DreamPromotionEntry | PlainMessage<DreamPromotionEntry> | undefined, b: DreamPromotionEntry | PlainMessage<DreamPromotionEntry> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.AccessCountUpdate
 */
export declare class AccessCountUpdate extends Message<AccessCountUpdate> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: repeated string ids = 2;
     */
    ids: string[];
    constructor(data?: PartialMessage<AccessCountUpdate>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AccessCountUpdate";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AccessCountUpdate;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AccessCountUpdate;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AccessCountUpdate;
    static equals(a: AccessCountUpdate | PlainMessage<AccessCountUpdate> | undefined, b: AccessCountUpdate | PlainMessage<AccessCountUpdate> | undefined): boolean;
}
/**
 * Kernel message (libravdbd/server/kernel_handlers.go kernelMessage).
 *
 * @generated from message libravdb.ipc.v1.KernelMessage
 */
export declare class KernelMessage extends Message<KernelMessage> {
    /**
     * @generated from field: string role = 1;
     */
    role: string;
    /**
     * @generated from field: string content = 2;
     */
    content: string;
    /**
     * @generated from field: string id = 3;
     */
    id: string;
    constructor(data?: PartialMessage<KernelMessage>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.KernelMessage";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): KernelMessage;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): KernelMessage;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): KernelMessage;
    static equals(a: KernelMessage | PlainMessage<KernelMessage> | undefined, b: KernelMessage | PlainMessage<KernelMessage> | undefined): boolean;
}
/**
 * assemble_context_internal debug is arbitrary JSON in the current daemon.
 *
 * @generated from message libravdb.ipc.v1.AssembleContextInternalResponse
 */
export declare class AssembleContextInternalResponse extends Message<AssembleContextInternalResponse> {
    /**
     * @generated from field: repeated libravdb.ipc.v1.KernelMessage messages = 1;
     */
    messages: KernelMessage[];
    /**
     * @generated from field: int32 estimated_tokens = 2;
     */
    estimatedTokens: number;
    /**
     * @generated from field: string system_prompt_addition = 3;
     */
    systemPromptAddition: string;
    /**
     * @generated from field: libravdb.ipc.v1.AssemblyDebug debug = 4;
     */
    debug?: AssemblyDebug;
    constructor(data?: PartialMessage<AssembleContextInternalResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AssembleContextInternalResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AssembleContextInternalResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AssembleContextInternalResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AssembleContextInternalResponse;
    static equals(a: AssembleContextInternalResponse | PlainMessage<AssembleContextInternalResponse> | undefined, b: AssembleContextInternalResponse | PlainMessage<AssembleContextInternalResponse> | undefined): boolean;
}
/**
 * Typed debug payload for assemble_context_internal.
 * Mirrors the fields produced by the transport layer's assembleDebugToProto.
 *
 * @generated from message libravdb.ipc.v1.AssemblyDebug
 */
export declare class AssemblyDebug extends Message<AssemblyDebug> {
    /**
     * @generated from field: bool recovery_trigger_fired = 1;
     */
    recoveryTriggerFired: boolean;
    /**
     * @generated from field: bool cross_session_raw_recovery = 2;
     */
    crossSessionRawRecovery: boolean;
    /**
     * @generated from field: int32 recovery_reserve_tokens = 3;
     */
    recoveryReserveTokens: number;
    /**
     * @generated from field: repeated libravdb.ipc.v1.RecoveryOrderEntry recovery_deduped_order = 4;
     */
    recoveryDedupedOrder: RecoveryOrderEntry[];
    /**
     * @generated from field: repeated libravdb.ipc.v1.RecoveryOrderEntry recovery_fitted_order = 5;
     */
    recoveryFittedOrder: RecoveryOrderEntry[];
    constructor(data?: PartialMessage<AssemblyDebug>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AssemblyDebug";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AssemblyDebug;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AssemblyDebug;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AssemblyDebug;
    static equals(a: AssemblyDebug | PlainMessage<AssemblyDebug> | undefined, b: AssemblyDebug | PlainMessage<AssemblyDebug> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.RecoveryOrderEntry
 */
export declare class RecoveryOrderEntry extends Message<RecoveryOrderEntry> {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * @generated from field: string recovery_scope = 2;
     */
    recoveryScope: string;
    /**
     * @generated from field: double final_score = 3;
     */
    finalScore: number;
    /**
     * @generated from field: int32 token_estimate = 4;
     */
    tokenEstimate: number;
    constructor(data?: PartialMessage<RecoveryOrderEntry>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RecoveryOrderEntry";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RecoveryOrderEntry;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RecoveryOrderEntry;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RecoveryOrderEntry;
    static equals(a: RecoveryOrderEntry | PlainMessage<RecoveryOrderEntry> | undefined, b: RecoveryOrderEntry | PlainMessage<RecoveryOrderEntry> | undefined): boolean;
}
/**
 * Pointer-backed overrides: optional preserves unset vs zero for Go migration.
 *
 * @generated from message libravdb.ipc.v1.AssembleConfigOverrides
 */
export declare class AssembleConfigOverrides extends Message<AssembleConfigOverrides> {
    /**
     * @generated from field: optional bool use_session_recall_projection = 1;
     */
    useSessionRecallProjection?: boolean;
    /**
     * @generated from field: optional bool use_session_summary_search_experiment = 2;
     */
    useSessionSummarySearchExperiment?: boolean;
    /**
     * @generated from field: optional double token_budget_fraction = 3;
     */
    tokenBudgetFraction?: number;
    /**
     * @generated from field: optional double authored_hard_budget_fraction = 4;
     */
    authoredHardBudgetFraction?: number;
    /**
     * @generated from field: optional double authored_soft_budget_fraction = 5;
     */
    authoredSoftBudgetFraction?: number;
    /**
     * @generated from field: optional double elevated_guidance_budget_fraction = 6;
     */
    elevatedGuidanceBudgetFraction?: number;
    /**
     * @generated from field: optional int32 top_k = 7;
     */
    topK?: number;
    /**
     * @generated from field: optional int32 continuity_min_turns = 8;
     */
    continuityMinTurns?: number;
    /**
     * @generated from field: optional int32 continuity_tail_budget_tokens = 9;
     */
    continuityTailBudgetTokens?: number;
    /**
     * @generated from field: optional int32 continuity_prior_context_tokens = 10;
     */
    continuityPriorContextTokens?: number;
    /**
     * @generated from field: optional int32 compact_threshold = 11;
     */
    compactThreshold?: number;
    /**
     * @generated from field: optional int32 compact_session_token_budget = 12;
     */
    compactSessionTokenBudget?: number;
    /**
     * @generated from field: optional double section7_theta1 = 13;
     */
    section7Theta1?: number;
    /**
     * @generated from field: optional double section7_kappa = 14;
     */
    section7Kappa?: number;
    /**
     * @generated from field: optional double section7_hop_eta = 15;
     */
    section7HopEta?: number;
    /**
     * @generated from field: optional double section7_hop_threshold = 16;
     */
    section7HopThreshold?: number;
    /**
     * @generated from field: optional int32 section7_coarse_top_k = 17;
     */
    section7CoarseTopK?: number;
    /**
     * @generated from field: optional int32 section7_second_pass_top_k = 18;
     */
    section7SecondPassTopK?: number;
    /**
     * @generated from field: optional double section7_authority_recency_lambda = 19;
     */
    section7AuthorityRecencyLambda?: number;
    /**
     * @generated from field: optional double section7_authority_recency_weight = 20;
     */
    section7AuthorityRecencyWeight?: number;
    /**
     * @generated from field: optional double section7_authority_frequency_weight = 21;
     */
    section7AuthorityFrequencyWeight?: number;
    /**
     * @generated from field: optional double section7_authority_authored_weight = 22;
     */
    section7AuthorityAuthoredWeight?: number;
    /**
     * @generated from field: optional double recovery_floor_score = 23;
     */
    recoveryFloorScore?: number;
    /**
     * @generated from field: optional int32 recovery_min_top_k = 24;
     */
    recoveryMinTopK?: number;
    /**
     * @generated from field: optional double recovery_min_confidence_mean = 25;
     */
    recoveryMinConfidenceMean?: number;
    /**
     * @generated from field: optional double recency_lambda_session = 26;
     */
    recencyLambdaSession?: number;
    /**
     * @generated from field: optional double recency_lambda_user = 27;
     */
    recencyLambdaUser?: number;
    /**
     * @generated from field: optional double recency_lambda_global = 28;
     */
    recencyLambdaGlobal?: number;
    /**
     * @generated from field: optional double ingestion_gate_threshold = 29;
     */
    ingestionGateThreshold?: number;
    constructor(data?: PartialMessage<AssembleConfigOverrides>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AssembleConfigOverrides";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AssembleConfigOverrides;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AssembleConfigOverrides;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AssembleConfigOverrides;
    static equals(a: AssembleConfigOverrides | PlainMessage<AssembleConfigOverrides> | undefined, b: AssembleConfigOverrides | PlainMessage<AssembleConfigOverrides> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.RankCandidate
 */
export declare class RankCandidate extends Message<RankCandidate> {
    /**
     * @generated from field: string id = 1;
     */
    id: string;
    /**
     * @generated from field: string text = 2;
     */
    text: string;
    /**
     * @generated from field: double score = 3;
     */
    score: number;
    /**
     * @generated from field: google.protobuf.Struct metadata = 4;
     */
    metadata?: Struct;
    constructor(data?: PartialMessage<RankCandidate>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RankCandidate";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RankCandidate;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RankCandidate;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RankCandidate;
    static equals(a: RankCandidate | PlainMessage<RankCandidate> | undefined, b: RankCandidate | PlainMessage<RankCandidate> | undefined): boolean;
}
/**
 * health.Status (libravdbd/health/check.go) — health RPC.
 *
 * @generated from message libravdb.ipc.v1.HealthResponse
 */
export declare class HealthResponse extends Message<HealthResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    /**
     * @generated from field: string message = 2;
     */
    message: string;
    constructor(data?: PartialMessage<HealthResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.HealthResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): HealthResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): HealthResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): HealthResponse;
    static equals(a: HealthResponse | PlainMessage<HealthResponse> | undefined, b: HealthResponse | PlainMessage<HealthResponse> | undefined): boolean;
}
/**
 * compact.Result (libravdbd/compact/summarize.go) — compact_session RPC.
 *
 * @generated from message libravdb.ipc.v1.CompactSessionResponse
 */
export declare class CompactSessionResponse extends Message<CompactSessionResponse> {
    /**
     * @generated from field: bool did_compact = 1;
     */
    didCompact: boolean;
    /**
     * @generated from field: int32 clusters_formed = 2;
     */
    clustersFormed: number;
    /**
     * @generated from field: int32 clusters_declined = 3;
     */
    clustersDeclined: number;
    /**
     * @generated from field: int32 turns_removed = 4;
     */
    turnsRemoved: number;
    /**
     * @generated from field: string summary_method = 5;
     */
    summaryMethod: string;
    /**
     * @generated from field: double mean_confidence = 6;
     */
    meanConfidence: number;
    constructor(data?: PartialMessage<CompactSessionResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.CompactSessionResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CompactSessionResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CompactSessionResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CompactSessionResponse;
    static equals(a: CompactSessionResponse | PlainMessage<CompactSessionResponse> | undefined, b: CompactSessionResponse | PlainMessage<CompactSessionResponse> | undefined): boolean;
}
/**
 * compact.GatingSignals (libravdbd/compact/gate.go) — gating_scalar RPC.
 *
 * @generated from message libravdb.ipc.v1.GatingScalarResponse
 */
export declare class GatingScalarResponse extends Message<GatingScalarResponse> {
    /**
     * @generated from field: double g = 1;
     */
    g: number;
    /**
     * @generated from field: double t = 2;
     */
    t: number;
    /**
     * @generated from field: double h = 3;
     */
    h: number;
    /**
     * @generated from field: double r = 4;
     */
    r: number;
    /**
     * @generated from field: double d = 5;
     */
    d: number;
    /**
     * @generated from field: double input_freq = 6;
     */
    inputFreq: number;
    /**
     * @generated from field: double mem_saturation = 7;
     */
    memSaturation: number;
    /**
     * @generated from field: double p = 8;
     */
    p: number;
    /**
     * @generated from field: double a = 9;
     */
    a: number;
    /**
     * @generated from field: double dtech = 10;
     */
    dtech: number;
    /**
     * @generated from field: double gconv = 11;
     */
    gconv: number;
    /**
     * @generated from field: double gtech = 12;
     */
    gtech: number;
    constructor(data?: PartialMessage<GatingScalarResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.GatingScalarResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GatingScalarResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GatingScalarResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GatingScalarResponse;
    static equals(a: GatingScalarResponse | PlainMessage<GatingScalarResponse> | undefined, b: GatingScalarResponse | PlainMessage<GatingScalarResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ExportMemoryRecord
 */
export declare class ExportMemoryRecord extends Message<ExportMemoryRecord> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: string id = 2;
     */
    id: string;
    /**
     * @generated from field: string text = 3;
     */
    text: string;
    /**
     * @generated from field: google.protobuf.Struct metadata = 4;
     */
    metadata?: Struct;
    constructor(data?: PartialMessage<ExportMemoryRecord>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ExportMemoryRecord";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ExportMemoryRecord;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ExportMemoryRecord;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ExportMemoryRecord;
    static equals(a: ExportMemoryRecord | PlainMessage<ExportMemoryRecord> | undefined, b: ExportMemoryRecord | PlainMessage<ExportMemoryRecord> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.EnsureCollectionsRequest
 */
export declare class EnsureCollectionsRequest extends Message<EnsureCollectionsRequest> {
    /**
     * @generated from field: repeated string collections = 1;
     */
    collections: string[];
    constructor(data?: PartialMessage<EnsureCollectionsRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.EnsureCollectionsRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): EnsureCollectionsRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): EnsureCollectionsRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): EnsureCollectionsRequest;
    static equals(a: EnsureCollectionsRequest | PlainMessage<EnsureCollectionsRequest> | undefined, b: EnsureCollectionsRequest | PlainMessage<EnsureCollectionsRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.EnsureCollectionsResponse
 */
export declare class EnsureCollectionsResponse extends Message<EnsureCollectionsResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<EnsureCollectionsResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.EnsureCollectionsResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): EnsureCollectionsResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): EnsureCollectionsResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): EnsureCollectionsResponse;
    static equals(a: EnsureCollectionsResponse | PlainMessage<EnsureCollectionsResponse> | undefined, b: EnsureCollectionsResponse | PlainMessage<EnsureCollectionsResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.InsertTextRequest
 */
export declare class InsertTextRequest extends Message<InsertTextRequest> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: string id = 2;
     */
    id: string;
    /**
     * @generated from field: string text = 3;
     */
    text: string;
    /**
     * @generated from field: google.protobuf.Struct metadata = 4;
     */
    metadata?: Struct;
    constructor(data?: PartialMessage<InsertTextRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.InsertTextRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InsertTextRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InsertTextRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InsertTextRequest;
    static equals(a: InsertTextRequest | PlainMessage<InsertTextRequest> | undefined, b: InsertTextRequest | PlainMessage<InsertTextRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.InsertTextResponse
 */
export declare class InsertTextResponse extends Message<InsertTextResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<InsertTextResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.InsertTextResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InsertTextResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InsertTextResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InsertTextResponse;
    static equals(a: InsertTextResponse | PlainMessage<InsertTextResponse> | undefined, b: InsertTextResponse | PlainMessage<InsertTextResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.InsertSessionTurnRequest
 */
export declare class InsertSessionTurnRequest extends Message<InsertSessionTurnRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string id = 2;
     */
    id: string;
    /**
     * @generated from field: string text = 3;
     */
    text: string;
    /**
     * @generated from field: google.protobuf.Struct metadata = 4;
     */
    metadata?: Struct;
    constructor(data?: PartialMessage<InsertSessionTurnRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.InsertSessionTurnRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InsertSessionTurnRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InsertSessionTurnRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InsertSessionTurnRequest;
    static equals(a: InsertSessionTurnRequest | PlainMessage<InsertSessionTurnRequest> | undefined, b: InsertSessionTurnRequest | PlainMessage<InsertSessionTurnRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.InsertSessionTurnResponse
 */
export declare class InsertSessionTurnResponse extends Message<InsertSessionTurnResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<InsertSessionTurnResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.InsertSessionTurnResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): InsertSessionTurnResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): InsertSessionTurnResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): InsertSessionTurnResponse;
    static equals(a: InsertSessionTurnResponse | PlainMessage<InsertSessionTurnResponse> | undefined, b: InsertSessionTurnResponse | PlainMessage<InsertSessionTurnResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.IngestMarkdownDocumentRequest
 */
export declare class IngestMarkdownDocumentRequest extends Message<IngestMarkdownDocumentRequest> {
    /**
     * @generated from field: string source_doc = 1;
     */
    sourceDoc: string;
    /**
     * @generated from field: string text = 2;
     */
    text: string;
    /**
     * @generated from field: string tokenizer_id = 3;
     */
    tokenizerId: string;
    /**
     * @generated from field: bool core_doc = 4;
     */
    coreDoc: boolean;
    /**
     * @generated from field: libravdb.ipc.v1.MarkdownSourceMeta source_meta = 5;
     */
    sourceMeta?: MarkdownSourceMeta;
    constructor(data?: PartialMessage<IngestMarkdownDocumentRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.IngestMarkdownDocumentRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IngestMarkdownDocumentRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IngestMarkdownDocumentRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IngestMarkdownDocumentRequest;
    static equals(a: IngestMarkdownDocumentRequest | PlainMessage<IngestMarkdownDocumentRequest> | undefined, b: IngestMarkdownDocumentRequest | PlainMessage<IngestMarkdownDocumentRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.IngestMarkdownDocumentResponse
 */
export declare class IngestMarkdownDocumentResponse extends Message<IngestMarkdownDocumentResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<IngestMarkdownDocumentResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.IngestMarkdownDocumentResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IngestMarkdownDocumentResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IngestMarkdownDocumentResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IngestMarkdownDocumentResponse;
    static equals(a: IngestMarkdownDocumentResponse | PlainMessage<IngestMarkdownDocumentResponse> | undefined, b: IngestMarkdownDocumentResponse | PlainMessage<IngestMarkdownDocumentResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DeleteAuthoredDocumentRequest
 */
export declare class DeleteAuthoredDocumentRequest extends Message<DeleteAuthoredDocumentRequest> {
    /**
     * @generated from field: string source_doc = 1;
     */
    sourceDoc: string;
    constructor(data?: PartialMessage<DeleteAuthoredDocumentRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DeleteAuthoredDocumentRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DeleteAuthoredDocumentRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DeleteAuthoredDocumentRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DeleteAuthoredDocumentRequest;
    static equals(a: DeleteAuthoredDocumentRequest | PlainMessage<DeleteAuthoredDocumentRequest> | undefined, b: DeleteAuthoredDocumentRequest | PlainMessage<DeleteAuthoredDocumentRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DeleteAuthoredDocumentResponse
 */
export declare class DeleteAuthoredDocumentResponse extends Message<DeleteAuthoredDocumentResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<DeleteAuthoredDocumentResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DeleteAuthoredDocumentResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DeleteAuthoredDocumentResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DeleteAuthoredDocumentResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DeleteAuthoredDocumentResponse;
    static equals(a: DeleteAuthoredDocumentResponse | PlainMessage<DeleteAuthoredDocumentResponse> | undefined, b: DeleteAuthoredDocumentResponse | PlainMessage<DeleteAuthoredDocumentResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.PromoteDreamEntriesRequest
 */
export declare class PromoteDreamEntriesRequest extends Message<PromoteDreamEntriesRequest> {
    /**
     * @generated from field: string user_id = 1;
     */
    userId: string;
    /**
     * @generated from field: string source_doc = 2;
     */
    sourceDoc: string;
    /**
     * @generated from field: string source_root = 3;
     */
    sourceRoot: string;
    /**
     * @generated from field: string source_path = 4;
     */
    sourcePath: string;
    /**
     * @generated from field: string source_kind = 5;
     */
    sourceKind: string;
    /**
     * @generated from field: string file_hash = 6;
     */
    fileHash: string;
    /**
     * @generated from field: int64 source_size = 7;
     */
    sourceSize: bigint;
    /**
     * @generated from field: int64 source_mtime_ms = 8;
     */
    sourceMtimeMs: bigint;
    /**
     * @generated from field: int32 ingest_version = 9;
     */
    ingestVersion: number;
    /**
     * @generated from field: string hash_backend = 10;
     */
    hashBackend: string;
    /**
     * @generated from field: repeated libravdb.ipc.v1.DreamPromotionEntry entries = 11;
     */
    entries: DreamPromotionEntry[];
    constructor(data?: PartialMessage<PromoteDreamEntriesRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.PromoteDreamEntriesRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): PromoteDreamEntriesRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): PromoteDreamEntriesRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): PromoteDreamEntriesRequest;
    static equals(a: PromoteDreamEntriesRequest | PlainMessage<PromoteDreamEntriesRequest> | undefined, b: PromoteDreamEntriesRequest | PlainMessage<PromoteDreamEntriesRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DreamPromotionResponse
 */
export declare class DreamPromotionResponse extends Message<DreamPromotionResponse> {
    /**
     * @generated from field: int32 promoted = 1;
     */
    promoted: number;
    /**
     * @generated from field: int32 rejected = 2;
     */
    rejected: number;
    constructor(data?: PartialMessage<DreamPromotionResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DreamPromotionResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DreamPromotionResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DreamPromotionResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DreamPromotionResponse;
    static equals(a: DreamPromotionResponse | PlainMessage<DreamPromotionResponse> | undefined, b: DreamPromotionResponse | PlainMessage<DreamPromotionResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.SearchTextRequest
 */
export declare class SearchTextRequest extends Message<SearchTextRequest> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: string text = 2;
     */
    text: string;
    /**
     * @generated from field: int32 k = 3;
     */
    k: number;
    /**
     * @generated from field: repeated string exclude_ids = 4;
     */
    excludeIds: string[];
    constructor(data?: PartialMessage<SearchTextRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.SearchTextRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SearchTextRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SearchTextRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SearchTextRequest;
    static equals(a: SearchTextRequest | PlainMessage<SearchTextRequest> | undefined, b: SearchTextRequest | PlainMessage<SearchTextRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.SearchTextCollectionsRequest
 */
export declare class SearchTextCollectionsRequest extends Message<SearchTextCollectionsRequest> {
    /**
     * @generated from field: repeated string collections = 1;
     */
    collections: string[];
    /**
     * @generated from field: string text = 2;
     */
    text: string;
    /**
     * @generated from field: int32 k = 3;
     */
    k: number;
    /**
     * @generated from field: map<string, libravdb.ipc.v1.StringList> exclude_by_collection = 4;
     */
    excludeByCollection: {
        [key: string]: StringList;
    };
    constructor(data?: PartialMessage<SearchTextCollectionsRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.SearchTextCollectionsRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SearchTextCollectionsRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SearchTextCollectionsRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SearchTextCollectionsRequest;
    static equals(a: SearchTextCollectionsRequest | PlainMessage<SearchTextCollectionsRequest> | undefined, b: SearchTextCollectionsRequest | PlainMessage<SearchTextCollectionsRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.SearchTextResponse
 */
export declare class SearchTextResponse extends Message<SearchTextResponse> {
    /**
     * @generated from field: repeated libravdb.ipc.v1.SearchResult results = 1;
     */
    results: SearchResult[];
    constructor(data?: PartialMessage<SearchTextResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.SearchTextResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SearchTextResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SearchTextResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SearchTextResponse;
    static equals(a: SearchTextResponse | PlainMessage<SearchTextResponse> | undefined, b: SearchTextResponse | PlainMessage<SearchTextResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ListByMetaRequest
 */
export declare class ListByMetaRequest extends Message<ListByMetaRequest> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: string key = 2;
     */
    key: string;
    /**
     * @generated from field: string value = 3;
     */
    value: string;
    constructor(data?: PartialMessage<ListByMetaRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ListByMetaRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListByMetaRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListByMetaRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListByMetaRequest;
    static equals(a: ListByMetaRequest | PlainMessage<ListByMetaRequest> | undefined, b: ListByMetaRequest | PlainMessage<ListByMetaRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ListCollectionRequest
 */
export declare class ListCollectionRequest extends Message<ListCollectionRequest> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    constructor(data?: PartialMessage<ListCollectionRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ListCollectionRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListCollectionRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListCollectionRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListCollectionRequest;
    static equals(a: ListCollectionRequest | PlainMessage<ListCollectionRequest> | undefined, b: ListCollectionRequest | PlainMessage<ListCollectionRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ExpandSummaryRequest
 */
export declare class ExpandSummaryRequest extends Message<ExpandSummaryRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string summary_id = 2;
     */
    summaryId: string;
    /**
     * @generated from field: int32 max_depth = 3;
     */
    maxDepth: number;
    constructor(data?: PartialMessage<ExpandSummaryRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ExpandSummaryRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ExpandSummaryRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ExpandSummaryRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ExpandSummaryRequest;
    static equals(a: ExpandSummaryRequest | PlainMessage<ExpandSummaryRequest> | undefined, b: ExpandSummaryRequest | PlainMessage<ExpandSummaryRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.QueryRawSessionRequest
 */
export declare class QueryRawSessionRequest extends Message<QueryRawSessionRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string text = 2;
     */
    text: string;
    /**
     * @generated from field: int32 k = 3;
     */
    k: number;
    /**
     * @generated from field: repeated string exclude_ids = 4;
     */
    excludeIds: string[];
    constructor(data?: PartialMessage<QueryRawSessionRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.QueryRawSessionRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): QueryRawSessionRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): QueryRawSessionRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): QueryRawSessionRequest;
    static equals(a: QueryRawSessionRequest | PlainMessage<QueryRawSessionRequest> | undefined, b: QueryRawSessionRequest | PlainMessage<QueryRawSessionRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ListLifecycleJournalRequest
 */
export declare class ListLifecycleJournalRequest extends Message<ListLifecycleJournalRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: int32 limit = 2;
     */
    limit: number;
    constructor(data?: PartialMessage<ListLifecycleJournalRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ListLifecycleJournalRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ListLifecycleJournalRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ListLifecycleJournalRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ListLifecycleJournalRequest;
    static equals(a: ListLifecycleJournalRequest | PlainMessage<ListLifecycleJournalRequest> | undefined, b: ListLifecycleJournalRequest | PlainMessage<ListLifecycleJournalRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.BumpAccessCountsRequest
 */
export declare class BumpAccessCountsRequest extends Message<BumpAccessCountsRequest> {
    /**
     * @generated from field: repeated libravdb.ipc.v1.AccessCountUpdate updates = 1;
     */
    updates: AccessCountUpdate[];
    constructor(data?: PartialMessage<BumpAccessCountsRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.BumpAccessCountsRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): BumpAccessCountsRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): BumpAccessCountsRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): BumpAccessCountsRequest;
    static equals(a: BumpAccessCountsRequest | PlainMessage<BumpAccessCountsRequest> | undefined, b: BumpAccessCountsRequest | PlainMessage<BumpAccessCountsRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.BumpAccessCountsResponse
 */
export declare class BumpAccessCountsResponse extends Message<BumpAccessCountsResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<BumpAccessCountsResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.BumpAccessCountsResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): BumpAccessCountsResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): BumpAccessCountsResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): BumpAccessCountsResponse;
    static equals(a: BumpAccessCountsResponse | PlainMessage<BumpAccessCountsResponse> | undefined, b: BumpAccessCountsResponse | PlainMessage<BumpAccessCountsResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DeleteRequest
 */
export declare class DeleteRequest extends Message<DeleteRequest> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: string id = 2;
     */
    id: string;
    constructor(data?: PartialMessage<DeleteRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DeleteRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DeleteRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DeleteRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DeleteRequest;
    static equals(a: DeleteRequest | PlainMessage<DeleteRequest> | undefined, b: DeleteRequest | PlainMessage<DeleteRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DeleteResponse
 */
export declare class DeleteResponse extends Message<DeleteResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<DeleteResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DeleteResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DeleteResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DeleteResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DeleteResponse;
    static equals(a: DeleteResponse | PlainMessage<DeleteResponse> | undefined, b: DeleteResponse | PlainMessage<DeleteResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DeleteBatchRequest
 */
export declare class DeleteBatchRequest extends Message<DeleteBatchRequest> {
    /**
     * @generated from field: string collection = 1;
     */
    collection: string;
    /**
     * @generated from field: repeated string ids = 2;
     */
    ids: string[];
    constructor(data?: PartialMessage<DeleteBatchRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DeleteBatchRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DeleteBatchRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DeleteBatchRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DeleteBatchRequest;
    static equals(a: DeleteBatchRequest | PlainMessage<DeleteBatchRequest> | undefined, b: DeleteBatchRequest | PlainMessage<DeleteBatchRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.DeleteBatchResponse
 */
export declare class DeleteBatchResponse extends Message<DeleteBatchResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<DeleteBatchResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.DeleteBatchResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): DeleteBatchResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): DeleteBatchResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): DeleteBatchResponse;
    static equals(a: DeleteBatchResponse | PlainMessage<DeleteBatchResponse> | undefined, b: DeleteBatchResponse | PlainMessage<DeleteBatchResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.CompactSessionRequest
 */
export declare class CompactSessionRequest extends Message<CompactSessionRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: bool force = 2;
     */
    force: boolean;
    /**
     * @generated from field: int32 target_size = 3;
     */
    targetSize: number;
    /**
     * @generated from field: int32 continuity_min_turns = 4;
     */
    continuityMinTurns: number;
    /**
     * @generated from field: int32 continuity_tail_budget_tokens = 5;
     */
    continuityTailBudgetTokens: number;
    /**
     * @generated from field: int32 continuity_prior_context_tokens = 6;
     */
    continuityPriorContextTokens: number;
    constructor(data?: PartialMessage<CompactSessionRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.CompactSessionRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CompactSessionRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CompactSessionRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CompactSessionRequest;
    static equals(a: CompactSessionRequest | PlainMessage<CompactSessionRequest> | undefined, b: CompactSessionRequest | PlainMessage<CompactSessionRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.GatingScalarRequest
 */
export declare class GatingScalarRequest extends Message<GatingScalarRequest> {
    /**
     * @generated from field: string user_id = 1;
     */
    userId: string;
    /**
     * @generated from field: string text = 2;
     */
    text: string;
    constructor(data?: PartialMessage<GatingScalarRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.GatingScalarRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GatingScalarRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GatingScalarRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GatingScalarRequest;
    static equals(a: GatingScalarRequest | PlainMessage<GatingScalarRequest> | undefined, b: GatingScalarRequest | PlainMessage<GatingScalarRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.FlushNamespaceRequest
 */
export declare class FlushNamespaceRequest extends Message<FlushNamespaceRequest> {
    /**
     * @generated from field: string user_id = 1;
     */
    userId: string;
    /**
     * @generated from field: string namespace = 2;
     */
    namespace: string;
    constructor(data?: PartialMessage<FlushNamespaceRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.FlushNamespaceRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FlushNamespaceRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FlushNamespaceRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FlushNamespaceRequest;
    static equals(a: FlushNamespaceRequest | PlainMessage<FlushNamespaceRequest> | undefined, b: FlushNamespaceRequest | PlainMessage<FlushNamespaceRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.SessionLifecycleHintRequest
 */
export declare class SessionLifecycleHintRequest extends Message<SessionLifecycleHintRequest> {
    /**
     * @generated from field: string hook = 1;
     */
    hook: string;
    /**
     * @generated from field: string reason = 2;
     */
    reason: string;
    /**
     * @generated from field: string session_file = 3;
     */
    sessionFile: string;
    /**
     * @generated from field: string session_id = 4;
     */
    sessionId: string;
    /**
     * @generated from field: string session_key = 5;
     */
    sessionKey: string;
    /**
     * @generated from field: string agent_id = 6;
     */
    agentId: string;
    /**
     * @generated from field: string workspace_dir = 7;
     */
    workspaceDir: string;
    /**
     * @generated from field: int32 message_count = 8;
     */
    messageCount: number;
    /**
     * @generated from field: int32 duration_ms = 9;
     */
    durationMs: number;
    /**
     * @generated from field: bool transcript_archived = 10;
     */
    transcriptArchived: boolean;
    /**
     * @generated from field: string next_session_id = 11;
     */
    nextSessionId: string;
    /**
     * @generated from field: string next_session_key = 12;
     */
    nextSessionKey: string;
    constructor(data?: PartialMessage<SessionLifecycleHintRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.SessionLifecycleHintRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SessionLifecycleHintRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SessionLifecycleHintRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SessionLifecycleHintRequest;
    static equals(a: SessionLifecycleHintRequest | PlainMessage<SessionLifecycleHintRequest> | undefined, b: SessionLifecycleHintRequest | PlainMessage<SessionLifecycleHintRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.SessionLifecycleHintResponse
 */
export declare class SessionLifecycleHintResponse extends Message<SessionLifecycleHintResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    /**
     * @generated from field: string hook = 2;
     */
    hook: string;
    /**
     * @generated from field: string session_id = 3;
     */
    sessionId: string;
    /**
     * @generated from field: string reason = 4;
     */
    reason: string;
    constructor(data?: PartialMessage<SessionLifecycleHintResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.SessionLifecycleHintResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): SessionLifecycleHintResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): SessionLifecycleHintResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): SessionLifecycleHintResponse;
    static equals(a: SessionLifecycleHintResponse | PlainMessage<SessionLifecycleHintResponse> | undefined, b: SessionLifecycleHintResponse | PlainMessage<SessionLifecycleHintResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.MemoryStatusResponse
 */
export declare class MemoryStatusResponse extends Message<MemoryStatusResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    /**
     * @generated from field: string message = 2;
     */
    message: string;
    /**
     * @generated from field: int32 turn_count = 3;
     */
    turnCount: number;
    /**
     * @generated from field: int32 memory_count = 4;
     */
    memoryCount: number;
    /**
     * @generated from field: int32 lifecycle_hint_count = 5;
     */
    lifecycleHintCount: number;
    /**
     * @generated from field: double gating_threshold = 6;
     */
    gatingThreshold: number;
    /**
     * @generated from field: bool abstractive_ready = 7;
     */
    abstractiveReady: boolean;
    /**
     * @generated from field: string embedding_profile = 8;
     */
    embeddingProfile: string;
    constructor(data?: PartialMessage<MemoryStatusResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.MemoryStatusResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): MemoryStatusResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): MemoryStatusResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): MemoryStatusResponse;
    static equals(a: MemoryStatusResponse | PlainMessage<MemoryStatusResponse> | undefined, b: MemoryStatusResponse | PlainMessage<MemoryStatusResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ExportMemoryRequest
 */
export declare class ExportMemoryRequest extends Message<ExportMemoryRequest> {
    /**
     * @generated from field: string user_id = 1;
     */
    userId: string;
    /**
     * @generated from field: string namespace = 2;
     */
    namespace: string;
    constructor(data?: PartialMessage<ExportMemoryRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ExportMemoryRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ExportMemoryRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ExportMemoryRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ExportMemoryRequest;
    static equals(a: ExportMemoryRequest | PlainMessage<ExportMemoryRequest> | undefined, b: ExportMemoryRequest | PlainMessage<ExportMemoryRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.ExportMemoryResponse
 */
export declare class ExportMemoryResponse extends Message<ExportMemoryResponse> {
    /**
     * @generated from field: repeated libravdb.ipc.v1.ExportMemoryRecord records = 1;
     */
    records: ExportMemoryRecord[];
    constructor(data?: PartialMessage<ExportMemoryResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.ExportMemoryResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): ExportMemoryResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): ExportMemoryResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): ExportMemoryResponse;
    static equals(a: ExportMemoryResponse | PlainMessage<ExportMemoryResponse> | undefined, b: ExportMemoryResponse | PlainMessage<ExportMemoryResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.FlushNamespaceResponse
 */
export declare class FlushNamespaceResponse extends Message<FlushNamespaceResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<FlushNamespaceResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.FlushNamespaceResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FlushNamespaceResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FlushNamespaceResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FlushNamespaceResponse;
    static equals(a: FlushNamespaceResponse | PlainMessage<FlushNamespaceResponse> | undefined, b: FlushNamespaceResponse | PlainMessage<FlushNamespaceResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.FlushResponse
 */
export declare class FlushResponse extends Message<FlushResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<FlushResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.FlushResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): FlushResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): FlushResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): FlushResponse;
    static equals(a: FlushResponse | PlainMessage<FlushResponse> | undefined, b: FlushResponse | PlainMessage<FlushResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.BootstrapSessionKernelRequest
 */
export declare class BootstrapSessionKernelRequest extends Message<BootstrapSessionKernelRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string session_key = 2;
     */
    sessionKey: string;
    /**
     * @generated from field: string user_id = 3;
     */
    userId: string;
    constructor(data?: PartialMessage<BootstrapSessionKernelRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.BootstrapSessionKernelRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): BootstrapSessionKernelRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): BootstrapSessionKernelRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): BootstrapSessionKernelRequest;
    static equals(a: BootstrapSessionKernelRequest | PlainMessage<BootstrapSessionKernelRequest> | undefined, b: BootstrapSessionKernelRequest | PlainMessage<BootstrapSessionKernelRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.BootstrapSessionKernelResponse
 */
export declare class BootstrapSessionKernelResponse extends Message<BootstrapSessionKernelResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<BootstrapSessionKernelResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.BootstrapSessionKernelResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): BootstrapSessionKernelResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): BootstrapSessionKernelResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): BootstrapSessionKernelResponse;
    static equals(a: BootstrapSessionKernelResponse | PlainMessage<BootstrapSessionKernelResponse> | undefined, b: BootstrapSessionKernelResponse | PlainMessage<BootstrapSessionKernelResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.IngestMessageKernelRequest
 */
export declare class IngestMessageKernelRequest extends Message<IngestMessageKernelRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string session_key = 2;
     */
    sessionKey: string;
    /**
     * @generated from field: string user_id = 3;
     */
    userId: string;
    /**
     * @generated from field: libravdb.ipc.v1.KernelMessage message = 4;
     */
    message?: KernelMessage;
    /**
     * @generated from field: bool is_heartbeat = 5;
     */
    isHeartbeat: boolean;
    constructor(data?: PartialMessage<IngestMessageKernelRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.IngestMessageKernelRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IngestMessageKernelRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IngestMessageKernelRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IngestMessageKernelRequest;
    static equals(a: IngestMessageKernelRequest | PlainMessage<IngestMessageKernelRequest> | undefined, b: IngestMessageKernelRequest | PlainMessage<IngestMessageKernelRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.IngestMessageKernelResponse
 */
export declare class IngestMessageKernelResponse extends Message<IngestMessageKernelResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    /**
     * @generated from field: int32 ingested = 2;
     */
    ingested: number;
    constructor(data?: PartialMessage<IngestMessageKernelResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.IngestMessageKernelResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IngestMessageKernelResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IngestMessageKernelResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IngestMessageKernelResponse;
    static equals(a: IngestMessageKernelResponse | PlainMessage<IngestMessageKernelResponse> | undefined, b: IngestMessageKernelResponse | PlainMessage<IngestMessageKernelResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.AfterTurnKernelRequest
 */
export declare class AfterTurnKernelRequest extends Message<AfterTurnKernelRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string session_key = 2;
     */
    sessionKey: string;
    /**
     * @generated from field: string user_id = 3;
     */
    userId: string;
    /**
     * @generated from field: repeated libravdb.ipc.v1.KernelMessage messages = 4;
     */
    messages: KernelMessage[];
    /**
     * @generated from field: int32 pre_prompt_message_count = 5;
     */
    prePromptMessageCount: number;
    /**
     * @generated from field: bool is_heartbeat = 6;
     */
    isHeartbeat: boolean;
    constructor(data?: PartialMessage<AfterTurnKernelRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AfterTurnKernelRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AfterTurnKernelRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AfterTurnKernelRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AfterTurnKernelRequest;
    static equals(a: AfterTurnKernelRequest | PlainMessage<AfterTurnKernelRequest> | undefined, b: AfterTurnKernelRequest | PlainMessage<AfterTurnKernelRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.AfterTurnKernelResponse
 */
export declare class AfterTurnKernelResponse extends Message<AfterTurnKernelResponse> {
    /**
     * @generated from field: bool ok = 1;
     */
    ok: boolean;
    constructor(data?: PartialMessage<AfterTurnKernelResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AfterTurnKernelResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AfterTurnKernelResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AfterTurnKernelResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AfterTurnKernelResponse;
    static equals(a: AfterTurnKernelResponse | PlainMessage<AfterTurnKernelResponse> | undefined, b: AfterTurnKernelResponse | PlainMessage<AfterTurnKernelResponse> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.AssembleContextInternalRequest
 */
export declare class AssembleContextInternalRequest extends Message<AssembleContextInternalRequest> {
    /**
     * @generated from field: string session_id = 1;
     */
    sessionId: string;
    /**
     * @generated from field: string session_key = 2;
     */
    sessionKey: string;
    /**
     * @generated from field: string user_id = 3;
     */
    userId: string;
    /**
     * @generated from field: repeated libravdb.ipc.v1.KernelMessage messages = 4;
     */
    messages: KernelMessage[];
    /**
     * @generated from field: int32 token_budget = 5;
     */
    tokenBudget: number;
    /**
     * @generated from field: string prompt = 6;
     */
    prompt: string;
    /**
     * @generated from field: bool emit_debug = 7;
     */
    emitDebug: boolean;
    /**
     * @generated from field: libravdb.ipc.v1.AssembleConfigOverrides config = 8;
     */
    config?: AssembleConfigOverrides;
    constructor(data?: PartialMessage<AssembleContextInternalRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.AssembleContextInternalRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): AssembleContextInternalRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): AssembleContextInternalRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): AssembleContextInternalRequest;
    static equals(a: AssembleContextInternalRequest | PlainMessage<AssembleContextInternalRequest> | undefined, b: AssembleContextInternalRequest | PlainMessage<AssembleContextInternalRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.RankCandidatesRequest
 */
export declare class RankCandidatesRequest extends Message<RankCandidatesRequest> {
    /**
     * @generated from field: repeated libravdb.ipc.v1.RankCandidate candidates = 1;
     */
    candidates: RankCandidate[];
    /**
     * @generated from field: string query_text = 2;
     */
    queryText: string;
    /**
     * @generated from field: string session_id = 3;
     */
    sessionId: string;
    /**
     * @generated from field: string user_id = 4;
     */
    userId: string;
    /**
     * @generated from field: int32 k1 = 5;
     */
    k1: number;
    /**
     * @generated from field: int32 k2 = 6;
     */
    k2: number;
    constructor(data?: PartialMessage<RankCandidatesRequest>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RankCandidatesRequest";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RankCandidatesRequest;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RankCandidatesRequest;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RankCandidatesRequest;
    static equals(a: RankCandidatesRequest | PlainMessage<RankCandidatesRequest> | undefined, b: RankCandidatesRequest | PlainMessage<RankCandidatesRequest> | undefined): boolean;
}
/**
 * @generated from message libravdb.ipc.v1.RankCandidatesResponse
 */
export declare class RankCandidatesResponse extends Message<RankCandidatesResponse> {
    /**
     * @generated from field: repeated libravdb.ipc.v1.RankCandidate ranked = 1;
     */
    ranked: RankCandidate[];
    constructor(data?: PartialMessage<RankCandidatesResponse>);
    static readonly runtime: typeof proto3;
    static readonly typeName = "libravdb.ipc.v1.RankCandidatesResponse";
    static readonly fields: FieldList;
    static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): RankCandidatesResponse;
    static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): RankCandidatesResponse;
    static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): RankCandidatesResponse;
    static equals(a: RankCandidatesResponse | PlainMessage<RankCandidatesResponse> | undefined, b: RankCandidatesResponse | PlainMessage<RankCandidatesResponse> | undefined): boolean;
}
//# sourceMappingURL=rpc_pb.d.ts.map