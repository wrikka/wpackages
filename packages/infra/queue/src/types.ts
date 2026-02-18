/**
 * Queue Types - Complete type definitions for all queue features
 */

// ============================================================================
// Basic Queue Types
// ============================================================================

export type QueueType = "bounded" | "unbounded" | "priority" | "delayed" | "persistent" | "distributed";

export interface Queue<A> {
	readonly _tag: "Queue";
	readonly type: QueueType;
	readonly capacity: number | "unbounded";
	readonly size: number;
	readonly isEmpty: boolean;
	readonly isFull: boolean;
	readonly _A?: A;
}

export interface BoundedQueue<A> extends Queue<A> {
	readonly type: "bounded";
	readonly capacity: number;
}

export interface UnboundedQueue<A> extends Queue<A> {
	readonly type: "unbounded";
	readonly capacity: "unbounded";
}

// ============================================================================
// Queue Operation Results
// ============================================================================

export type QueueOfferResult = OfferSuccess | OfferFailure;

export interface OfferSuccess {
	readonly _tag: "OfferSuccess";
}

export interface OfferFailure {
	readonly _tag: "OfferFailure";
	readonly reason: "full" | "shutdown" | "timeout" | "rejected";
}

export type QueuePollResult<A> = PollSuccess<A> | PollFailure;

export interface PollSuccess<A> {
	readonly _tag: "PollSuccess";
	readonly value: A;
	readonly metadata?: MessageMetadata;
}

export interface PollFailure {
	readonly _tag: "PollFailure";
	readonly reason: "empty" | "shutdown" | "timeout";
}

export interface QueueShutdown {
	readonly _tag: "QueueShutdown";
}

// ============================================================================
// Feature 1: Priority Queue
// ============================================================================

export type PriorityLevel = "critical" | "high" | "normal" | "low";

export interface PriorityQueueItem<A> {
	readonly value: A;
	readonly priority: PriorityLevel;
	readonly priorityValue: number;
	readonly enqueuedAt: number;
}

export interface PriorityQueue<A> extends Queue<A> {
	readonly type: "priority";
	readonly capacity: number;
}

export interface PriorityOfferResult extends OfferSuccess {
	readonly assignedPriority: PriorityLevel;
}

// ============================================================================
// Feature 2: Delayed Queue
// ============================================================================

export interface DelayedQueueItem<A> {
	readonly value: A;
	readonly executeAt: number;
	readonly delayMs: number;
	readonly enqueuedAt: number;
}

export interface DelayedQueue<A> extends Queue<A> {
	readonly type: "delayed";
}

// ============================================================================
// Feature 3: Persistent Queue
// ============================================================================

export interface PersistentQueueConfig {
	readonly storageType: "file" | "sqlite" | "redis" | "memory";
	readonly path?: string;
	readonly connectionString?: string;
	readonly syncIntervalMs: number;
	readonly autoRecover: boolean;
}

export interface PersistentQueue<A> extends Queue<A> {
	readonly type: "persistent";
	readonly config: PersistentQueueConfig;
	readonly lastPersistedAt: number;
}

export interface PersistenceStatus {
	readonly isPersisted: boolean;
	readonly lastError?: string | undefined;
	readonly pendingWrites: number;
}

// ============================================================================
// Feature 4: Distributed Queue
// ============================================================================

export interface DistributedQueueConfig {
	readonly nodeId: string;
	readonly coordinatorUrl?: string;
	readonly replicationFactor: number;
	readonly partitionCount: number;
}

export interface DistributedQueue<A> extends Queue<A> {
	readonly config: DistributedQueueConfig;
	readonly partitionAssignments: Map<number, string>;
}

export interface DistributedMessage<A> {
	readonly value: A;
	readonly partitionKey: string;
	readonly nodeId: string;
	readonly timestamp: number;
}

// ============================================================================
// Feature 5: Dead Letter Queue
// ============================================================================

export interface DeadLetterConfig {
	readonly maxRetries: number;
	readonly retryDelayMs: number;
	readonly retryBackoff: "fixed" | "exponential";
	readonly deadLetterAfterRetries: boolean;
	readonly deadLetterQueueName?: string;
}

export interface DeadLetterItem<A> {
	readonly originalValue: A;
	readonly failedAt: number;
	readonly errorMessage: string;
	readonly retryCount: number;
	readonly originalQueue: string;
}

export interface DeadLetterQueue<A> extends Queue<A> {
	readonly parentQueue: string;
	readonly deadLetterConfig: DeadLetterConfig;
}

// ============================================================================
// Feature 6: Batch Processing
// ============================================================================

export interface BatchConfig {
	readonly batchSize: number;
	readonly maxWaitMs: number;
	readonly minBatchSize: number;
}

export interface BatchResult<A> {
	readonly items: A[];
	readonly metadata: BatchMetadata;
}

export interface BatchMetadata {
	readonly batchId: string;
	readonly createdAt: number;
	readonly itemCount: number;
	readonly sourceQueue: string;
}

// ============================================================================
// Feature 7: Rate Limiting
// ============================================================================

export interface RateLimitConfig {
	readonly maxRequestsPerSecond: number;
	readonly maxRequestsPerMinute: number;
	readonly burstSize: number;
	readonly strategy: "token-bucket" | "sliding-window" | "fixed-window";
}

export interface RateLimitStatus {
	readonly isLimited: boolean;
	readonly remainingTokens: number;
	readonly resetAt: number;
	readonly currentRate: number;
}

// ============================================================================
// Feature 8: Queue Monitoring
// ============================================================================

export interface QueueMetrics {
	enqueueCount: number;
	dequeueCount: number;
	rejectCount: number;
	errorCount: number;
	avgWaitTimeMs: number;
	avgProcessTimeMs: number;
	peakSize: number;
	currentSize: number;
}

export interface QueueHealth {
	readonly status: "healthy" | "degraded" | "unhealthy";
	readonly lastCheckAt: number;
	readonly issues: string[];
	readonly uptimeMs: number;
}

export interface QueueStats {
	readonly metrics: QueueMetrics;
	readonly health: QueueHealth;
	readonly createdAt: number;
}

// ============================================================================
// Feature 9: Event Hooks
// ============================================================================

export type QueueEventType =
	| "enqueue"
	| "dequeue"
	| "reject"
	| "error"
	| "shutdown"
	| "batch"
	| "retry"
	| "dead-letter";

export interface QueueEvent<A> {
	readonly type: QueueEventType;
	readonly timestamp: number;
	readonly queueName: string;
	readonly data?: A;
	readonly error?: Error;
	readonly metadata?: MessageMetadata;
}

export type QueueEventHandler<A> = (event: QueueEvent<A>) => void | Promise<void>;

export interface QueueHooks<A> {
	readonly onEnqueue?: QueueEventHandler<A>;
	readonly onDequeue?: QueueEventHandler<A>;
	readonly onReject?: QueueEventHandler<A>;
	readonly onError?: QueueEventHandler<Error>;
	readonly onShutdown?: QueueEventHandler<void>;
	readonly onBatch?: QueueEventHandler<A[]>;
	readonly onRetry?: QueueEventHandler<{ item: A; attempt: number }>;
	readonly onDeadLetter?: QueueEventHandler<DeadLetterItem<A>>;
}

// ============================================================================
// Feature 10: Queue Middleware
// ============================================================================

export type MiddlewareFunction<A> = (
	item: A,
	next: () => Promise<QueueOfferResult>,
) => Promise<QueueOfferResult>;

export interface MiddlewareChain<A> {
	readonly use: (middleware: MiddlewareFunction<A>) => MiddlewareChain<A>;
	readonly process: (item: A) => Promise<QueueOfferResult>;
}

// ============================================================================
// Feature 11: Auto-scaling
// ============================================================================

export interface AutoScalingConfig {
	readonly enabled: boolean;
	readonly minCapacity: number;
	readonly maxCapacity: number;
	readonly scaleUpThreshold: number;
	readonly scaleDownThreshold: number;
	readonly scaleUpFactor: number;
	readonly scaleDownFactor: number;
	readonly cooldownMs: number;
}

export interface ScalingStatus {
	readonly currentCapacity: number;
	readonly targetCapacity: number;
	readonly lastScaleAt: number;
	readonly scaleReason?: string;
}

// ============================================================================
// Feature 12: Message TTL (Time To Live)
// ============================================================================

export interface TTLConfig {
	readonly defaultTtlMs: number;
	readonly checkIntervalMs: number;
	readonly expireToDeadLetter: boolean;
}

export interface MessageMetadata {
	readonly id: string;
	readonly enqueuedAt: number;
	readonly ttlMs?: number;
	readonly expiresAt?: number;
	readonly priority?: PriorityLevel;
	readonly delayMs?: number;
	readonly executeAt?: number;
	readonly tags: string[];
	readonly customData?: Record<string, unknown>;
}

export interface TTLStatus {
	readonly expiredCount: number;
	readonly expiringSoon: number;
	readonly nextExpiryAt?: number;
}

// ============================================================================
// Feature 13: Queue Compression
// ============================================================================

export interface CompressionConfig {
	readonly enabled: boolean;
	readonly algorithm: "gzip" | "brotli" | "lz4" | "zstd";
	readonly thresholdBytes: number;
	readonly level: number;
}

export interface CompressionStats {
	readonly originalBytes: number;
	readonly compressedBytes: number;
	readonly compressionRatio: number;
	readonly itemsCompressed: number;
}

// ============================================================================
// Feature 14: FIFO/LIFO Toggle
// ============================================================================

export type OrderStrategy = "fifo" | "lifo" | "priority" | "random";

export interface OrderConfig {
	readonly strategy: OrderStrategy;
	readonly secondaryStrategy?: OrderStrategy;
}

// ============================================================================
// Feature 15: Queue Snapshot
// ============================================================================

export interface QueueSnapshot<A> {
	readonly id: string;
	readonly createdAt: number;
	readonly items: A[];
	readonly metadata: SnapshotMetadata;
}

export interface SnapshotMetadata {
	readonly queueName: string;
	readonly queueType: QueueType;
	readonly itemCount: number;
	readonly version: number;
}

// ============================================================================
// Feature 16: Transaction Support
// ============================================================================

export interface Transaction<A> {
	readonly id: string;
	readonly operations: TransactionOperation<A>[];
	readonly status: "pending" | "committed" | "rolledback";
}

export interface TransactionOperation<A> {
	readonly type: "enqueue" | "dequeue" | "update";
	readonly queueName: string;
	readonly data?: A;
}

export interface TransactionResult {
	readonly success: boolean;
	readonly committedAt?: number;
	readonly error?: string;
}

// ============================================================================
// Feature 17: Message Routing
// ============================================================================

export interface RouteRule<A> {
	readonly pattern: string | RegExp;
	readonly targetQueue: string;
	readonly condition?: (item: A) => boolean;
	readonly priority: number;
}

export interface RouterConfig<A> {
	readonly defaultQueue: string;
	readonly rules: RouteRule<A>[];
	readonly errorQueue?: string;
}

// ============================================================================
// Feature 18: Schema Validation
// ============================================================================

export interface ValidationConfig<A> {
	readonly schema: ValidationSchema<A>;
	readonly strict: boolean;
	readonly rejectOnInvalid: boolean;
	readonly transformOnValid?: (item: A) => A;
}

export interface ValidationSchema<A> {
	readonly validate: (item: unknown) => ValidationResult<A>;
}

export interface ValidationResult<A> {
	readonly valid: boolean;
	readonly data?: A;
	readonly errors?: ValidationError[];
}

export interface ValidationError {
	readonly path: string;
	readonly message: string;
	readonly value: unknown;
}

// ============================================================================
// Feature 19: Backpressure Handling
// ============================================================================

export interface BackpressureConfig {
	readonly highWatermark: number;
	readonly lowWatermark: number;
	readonly pauseOnPressure: boolean;
	readonly dropOldestOnFull: boolean;
	readonly maxWaitOnBackpressureMs: number;
}

export interface BackpressureStatus {
	readonly isUnderPressure: boolean;
	readonly pressureLevel: "none" | "low" | "medium" | "high" | "critical";
	readonly pausedProducers: number;
}

// ============================================================================
// Feature 20: Queue Federation
// ============================================================================

export interface FederationConfig {
	readonly localQueue: string;
	readonly upstreamQueues: string[];
	readonly downstreamQueues: string[];
	readonly syncIntervalMs: number;
	readonly conflictResolution: "last-write-wins" | "timestamp" | "manual";
}

export interface FederatedMessage<A> {
	readonly value: A;
	readonly originQueue: string;
	readonly federationTimestamp: number;
	readonly hops: number;
}

export interface FederationStatus {
	readonly connectedNodes: number;
	readonly pendingSyncs: number;
	readonly lastSyncAt: number;
}
