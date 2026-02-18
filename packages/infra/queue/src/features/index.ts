/**
 * Features 4-20: Advanced Queue Features
 * Distributed, Dead Letter, Batch, Rate Limit, Monitoring, Hooks, Middleware, Auto-scaling, TTL, Compression, Order, Snapshot, Transaction, Routing, Validation, Backpressure, Federation
 */

import type {
	AutoScalingConfig,
	BackpressureConfig,
	BackpressureStatus,
	BatchConfig,
	BatchMetadata,
	BatchResult,
	CompressionConfig,
	CompressionStats,
	DeadLetterConfig,
	DeadLetterItem,
	DeadLetterQueue,
	DistributedMessage,
	DistributedQueue,
	DistributedQueueConfig,
	FederatedMessage,
	FederationConfig,
	FederationStatus,
	MiddlewareFunction,
	OrderStrategy,
	Queue,
	QueueHealth,
	QueueHooks,
	QueueMetrics,
	QueueOfferResult,
	QueueShutdown,
	QueueSnapshot,
	QueueStats,
	RateLimitConfig,
	RateLimitStatus,
	RouterConfig,
	ScalingStatus,
	SnapshotMetadata,
	TTLStatus,
	Transaction,
	TransactionOperation,
	TransactionResult,
	ValidationConfig,
	ValidationResult,
} from "../types";

// ============================================================================
// Feature 4: Distributed Queue
// ============================================================================

class DistributedQueueImpl<A> implements DistributedQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "distributed" as const;
	readonly capacity: number | "unbounded" = "unbounded";
	readonly _A?: A;
	readonly config: DistributedQueueConfig;
	private items: DistributedMessage<A>[] = [];
	private isShutdown = false;
	private waiters: { resolve: (value: A) => void; reject: (reason: Error) => void }[] = [];
	partitionAssignments: Map<number, string> = new Map();

	constructor(config: DistributedQueueConfig) {
		this.config = config;
		for (let i = 0; i < config.partitionCount; i++) {
			this.partitionAssignments.set(i, config.nodeId);
		}
	}

	get size(): number { return this.items.length; }
	get isEmpty(): boolean { return this.items.length === 0; }
	get isFull(): boolean { return false; }

	private getPartitionKey(item: A): string {
		return JSON.stringify(item);
	}

	private getPartition(key: string): number {
		let hash = 0;
		for (const char of key) {
			hash = ((hash << 5) - hash) + char.charCodeAt(0);
			hash = hash & hash;
		}
		return Math.abs(hash) % this.config.partitionCount;
	}

	enqueue(item: A): QueueOfferResult {
		if (this.isShutdown) return { _tag: "OfferFailure", reason: "shutdown" };
		const partitionKey = this.getPartitionKey(item);
		const message: DistributedMessage<A> = {
			value: item,
			partitionKey,
			nodeId: this.config.nodeId,
			timestamp: Date.now(),
		};
		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(item);
			return { _tag: "OfferSuccess" };
		}
		this.items.push(message);
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<A | undefined> {
		if (this.isShutdown && this.items.length === 0) return undefined;
		if (this.items.length > 0) {
			const item = this.items.shift();
			return item?.value;
		}
		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
		});
	}

	async peek(): Promise<A | undefined> {
		return this.items[0]?.value;
	}

	shutdown(): QueueShutdown {
		this.isShutdown = true;
		for (const waiter of this.waiters) waiter.reject(new Error("Queue shutdown"));
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	getPartitionInfo(partition: number): { nodeId: string; count: number } {
		const nodeId = this.partitionAssignments.get(partition) ?? this.config.nodeId;
		const count = this.items.filter((item) => this.getPartition(item.partitionKey) === partition).length;
		return { nodeId, count };
	}

	rebalancePartitions(): void {
		// Simulate partition reassignment
		for (let i = 0; i < this.config.partitionCount; i++) {
			this.partitionAssignments.set(i, this.config.nodeId);
		}
	}
}

export const createDistributedQueue = <A>(config: DistributedQueueConfig): DistributedQueue<A> => {
	return new DistributedQueueImpl<A>(config) as DistributedQueue<A>;
};

// ============================================================================
// Feature 5: Dead Letter Queue
// ============================================================================

class DeadLetterQueueImpl<A> implements DeadLetterQueue<A> {
	readonly _tag = "Queue" as const;
	readonly type = "unbounded" as const;
	readonly capacity = "unbounded" as const;
	readonly _A?: A;
	readonly parentQueue: string;
	readonly deadLetterConfig: DeadLetterConfig;
	private items: DeadLetterItem<A>[] = [];
	private isShutdown = false;
	private waiters: { resolve: (value: DeadLetterItem<A>) => void; reject: (reason: Error) => void }[] = [];

	constructor(parentQueue: string, config: DeadLetterConfig) {
		this.parentQueue = parentQueue;
		this.deadLetterConfig = config;
	}

	get size(): number { return this.items.length; }
	get isEmpty(): boolean { return this.items.length === 0; }
	get isFull(): boolean { return false; }

	addDeadLetter(item: A, error: Error, retryCount: number): QueueOfferResult {
		if (this.isShutdown) return { _tag: "OfferFailure", reason: "shutdown" };
		const deadItem: DeadLetterItem<A> = {
			originalValue: item,
			failedAt: Date.now(),
			errorMessage: error.message,
			retryCount,
			originalQueue: this.parentQueue,
		};
		if (this.waiters.length > 0) {
			const waiter = this.waiters.shift()!;
			waiter.resolve(deadItem);
			return { _tag: "OfferSuccess" };
		}
		this.items.push(deadItem);
		return { _tag: "OfferSuccess" };
	}

	async dequeue(): Promise<DeadLetterItem<A> | undefined> {
		if (this.isShutdown && this.items.length === 0) return undefined;
		if (this.items.length > 0) return this.items.shift();
		return new Promise((resolve, reject) => {
			this.waiters.push({ resolve, reject });
		});
	}

	async peek(): Promise<DeadLetterItem<A> | undefined> {
		return this.items[0];
	}

	shutdown(): QueueShutdown {
		this.isShutdown = true;
		for (const waiter of this.waiters) waiter.reject(new Error("Queue shutdown"));
		this.waiters = [];
		return { _tag: "QueueShutdown" };
	}

	retryItem(item: DeadLetterItem<A>): A | undefined {
		if (item.retryCount < this.deadLetterConfig.maxRetries) {
			return item.originalValue;
		}
		return undefined;
	}

	getRetryableItems(): DeadLetterItem<A>[] {
		return this.items.filter((item) => item.retryCount < this.deadLetterConfig.maxRetries);
	}
}

export const createDeadLetterQueue = <A>(parentQueue: string, config: DeadLetterConfig): DeadLetterQueue<A> => {
	return new DeadLetterQueueImpl<A>(parentQueue, config) as DeadLetterQueue<A>;
};

export const getRetryableItems = <A>(queue: DeadLetterQueue<A>): Promise<DeadLetterItem<A>[]> => {
	const q = queue as DeadLetterQueueImpl<A>;
	return Promise.resolve(q.getRetryableItems());
};

// ============================================================================
// Feature 6: Batch Processing
// ============================================================================

export const takeBatch = <A>(queue: Queue<A>, config: BatchConfig): Promise<BatchResult<A>> => {
	return (async () => {
		const startTime = Date.now();
		const items: A[] = [];
		const q = queue as unknown as { dequeue(): Promise<A | undefined> };
		while (items.length < config.batchSize && Date.now() - startTime < config.maxWaitMs) {
			if (queue.size > 0) {
				const item = await q.dequeue();
				if (item) items.push(item);
			} else {
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
		}
		const metadata: BatchMetadata = {
			batchId: crypto.randomUUID(),
			createdAt: Date.now(),
			itemCount: items.length,
			sourceQueue: "batch",
		};
		return { items, metadata };
	})();
};

// ============================================================================
// Feature 7: Rate Limiting
// ============================================================================

class TokenBucket {
	private tokens: number;
	private lastRefill: number;
	private maxTokens: number;
	private refillRate: number;

	constructor(config: RateLimitConfig) {
		this.tokens = config.burstSize;
		this.maxTokens = config.burstSize;
		this.refillRate = config.maxRequestsPerSecond;
		this.lastRefill = Date.now();
	}

	tryConsume(): boolean {
		this.refill();
		if (this.tokens >= 1) {
			this.tokens--;
			return true;
		}
		return false;
	}

	private refill(): void {
		const now = Date.now();
		const timePassed = (now - this.lastRefill) / 1000;
		const tokensToAdd = timePassed * this.refillRate;
		this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
		this.lastRefill = now;
	}

	getStatus(): RateLimitStatus {
		this.refill();
		return {
			isLimited: this.tokens < 1,
			remainingTokens: Math.floor(this.tokens),
			resetAt: Date.now() + (1 - this.tokens) / this.refillRate * 1000,
			currentRate: this.refillRate,
		};
	}
}

export const createRateLimiter = (config: RateLimitConfig): TokenBucket => {
	return new TokenBucket(config);
};

// ============================================================================
// Feature 8: Queue Monitoring
// ============================================================================

class QueueMonitor<A> {
	private queue: Queue<A>;
	private metrics: QueueMetrics;
	private createdAt: number;

	constructor(queue: Queue<A>) {
		this.queue = queue;
		this.createdAt = Date.now();
		this.metrics = {
			enqueueCount: 0,
			dequeueCount: 0,
			rejectCount: 0,
			errorCount: 0,
			avgWaitTimeMs: 0,
			avgProcessTimeMs: 0,
			peakSize: 0,
			currentSize: 0,
		};
	}

	recordEnqueue(): void {
		this.metrics.enqueueCount++;
		this.metrics.currentSize = this.queue.size;
		this.metrics.peakSize = Math.max(this.metrics.peakSize, this.queue.size);
	}

	recordDequeue(waitTimeMs: number, processTimeMs: number): void {
		this.metrics.dequeueCount++;
		this.metrics.currentSize = this.queue.size;
		this.metrics.avgWaitTimeMs = (this.metrics.avgWaitTimeMs * (this.metrics.dequeueCount - 1) + waitTimeMs) / this.metrics.dequeueCount;
		this.metrics.avgProcessTimeMs = (this.metrics.avgProcessTimeMs * (this.metrics.dequeueCount - 1) + processTimeMs) / this.metrics.dequeueCount;
	}

	recordReject(): void {
		this.metrics.rejectCount++;
	}

	recordError(): void {
		this.metrics.errorCount++;
	}

	getMetrics(): QueueMetrics {
		return { ...this.metrics };
	}

	getHealth(): QueueHealth {
		const issues: string[] = [];
		if (this.metrics.errorCount > 100) issues.push("High error rate");
		if (this.queue.isFull) issues.push("Queue is full");
		if (this.metrics.avgWaitTimeMs > 5000) issues.push("High wait times");

		let status: "healthy" | "degraded" | "unhealthy" = "healthy";
		if (issues.length > 2) status = "unhealthy";
		else if (issues.length > 0) status = "degraded";

		return {
			status,
			lastCheckAt: Date.now(),
			issues,
			uptimeMs: Date.now() - this.createdAt,
		};
	}

	getStats(): QueueStats {
		return {
			metrics: this.getMetrics(),
			health: this.getHealth(),
			createdAt: this.createdAt,
		};
	}
}

export const createMonitor = <A>(queue: Queue<A>): QueueMonitor<A> => {
	return new QueueMonitor<A>(queue);
};

export const getMetrics = <A>(monitor: QueueMonitor<A>): QueueMetrics => monitor.getMetrics();
export const getHealth = <A>(monitor: QueueMonitor<A>): QueueHealth => monitor.getHealth();
export const getStats = <A>(monitor: QueueMonitor<A>): QueueStats => monitor.getStats();

// ============================================================================
// Feature 9: Event Hooks
// ============================================================================

class EventEmitter<A> {
	private hooks: QueueHooks<A> = {};

	registerHooks(hooks: QueueHooks<A>): void {
		this.hooks = { ...this.hooks, ...hooks };
	}

	async emitEnqueue(data: A): Promise<void> {
		if (this.hooks.onEnqueue) await this.hooks.onEnqueue({ type: "enqueue", timestamp: Date.now(), queueName: "default", data });
	}

	async emitDequeue(data: A): Promise<void> {
		if (this.hooks.onDequeue) await this.hooks.onDequeue({ type: "dequeue", timestamp: Date.now(), queueName: "default", data });
	}

	async emitReject(data: A): Promise<void> {
		if (this.hooks.onReject) await this.hooks.onReject({ type: "reject", timestamp: Date.now(), queueName: "default", data });
	}

	async emitError(error: Error): Promise<void> {
		if (this.hooks.onError) await this.hooks.onError({ type: "error", timestamp: Date.now(), queueName: "default", error });
	}

	async emitShutdown(): Promise<void> {
		if (this.hooks.onShutdown) await this.hooks.onShutdown({ type: "shutdown", timestamp: Date.now(), queueName: "default" });
	}
}

export const createEventEmitter = <A>(): EventEmitter<A> => new EventEmitter<A>();

// ============================================================================
// Feature 10: Queue Middleware
// ============================================================================

export class MiddlewareChainImpl<A> {
	private middlewares: MiddlewareFunction<A>[] = [];

	use(middleware: MiddlewareFunction<A>): MiddlewareChainImpl<A> {
		this.middlewares.push(middleware);
		return this;
	}

	async process(item: A, finalHandler: () => Promise<QueueOfferResult>): Promise<QueueOfferResult> {
		let index = 0;
		const next = async (): Promise<QueueOfferResult> => {
			if (index < this.middlewares.length) {
				const middleware = this.middlewares[index]!;
				index++;
				return middleware(item, next);
			}
			return finalHandler();
		};
		return next();
	}
}

export const createMiddlewareChain = <A>(): MiddlewareChainImpl<A> => new MiddlewareChainImpl<A>();

// ============================================================================
// Feature 11: Auto-scaling
// ============================================================================

export const calculateScaling = (
	currentSize: number,
	currentCapacity: number,
	config: AutoScalingConfig,
	lastScaleAt: number,
): ScalingStatus | null => {
	const now = Date.now();
	if (now - lastScaleAt < config.cooldownMs) return null;

	const utilization = currentSize / currentCapacity;
	let targetCapacity = currentCapacity;
	let scaleReason: string | undefined;

	if (utilization > config.scaleUpThreshold && currentCapacity < config.maxCapacity) {
		targetCapacity = Math.min(config.maxCapacity, Math.floor(currentCapacity * config.scaleUpFactor));
		scaleReason = "High utilization";
	} else if (utilization < config.scaleDownThreshold && currentCapacity > config.minCapacity) {
		targetCapacity = Math.max(config.minCapacity, Math.floor(currentCapacity * config.scaleDownFactor));
		scaleReason = "Low utilization";
	}

	if (targetCapacity === currentCapacity) return null;

	return {
		currentCapacity,
		targetCapacity,
		lastScaleAt: now,
		...(scaleReason ? { scaleReason } : {}),
	};
};

// ============================================================================
// Feature 12: Message TTL
// ============================================================================

export const checkExpiredItems = <A>(items: Array<{ value: A; enqueuedAt: number; ttlMs?: number }>): A[] => {
	const now = Date.now();
	return items
		.filter((item) => item.ttlMs !== undefined && now - item.enqueuedAt > item.ttlMs)
		.map((item) => item.value);
};

export const getTTLStatus = (items: Array<{ enqueuedAt: number; ttlMs?: number }>): TTLStatus => {
	const now = Date.now();
	const expired = items.filter((item) => item.ttlMs !== undefined && now - item.enqueuedAt > item.ttlMs);
	const expiringSoon = items.filter((item) => {
		if (item.ttlMs === undefined) return false;
		const remaining = item.ttlMs - (now - item.enqueuedAt);
		return remaining > 0 && remaining < 60000; // Expiring within 1 minute
	});

	const nextExpiry = items
		.filter((item) => item.ttlMs !== undefined && now - item.enqueuedAt < item.ttlMs!)
		.map((item) => item.enqueuedAt + item.ttlMs!)
		.sort((a, b) => a - b)[0];

	return {
		expiredCount: expired.length,
		expiringSoon: expiringSoon.length,
		...(nextExpiry !== undefined ? { nextExpiryAt: nextExpiry } : {}),
	};
};

// ============================================================================
// Feature 13: Queue Compression
// ============================================================================

export const compressItem = <A>(item: A, config: CompressionConfig): string | undefined => {
	if (!config.enabled) return undefined;
	const serialized = JSON.stringify(item);
	if (serialized.length < config.thresholdBytes) return undefined;
	// Simplified - real implementation would use actual compression
	return `compressed:${serialized.length}`;
};

export const getCompressionStats = (originalBytes: number, compressedBytes: number): CompressionStats => {
	return {
		originalBytes,
		compressedBytes,
		compressionRatio: originalBytes / Math.max(1, compressedBytes),
		itemsCompressed: 1,
	};
};

// ============================================================================
// Feature 14: FIFO/LIFO Toggle
// ============================================================================

export const getNextIndex = (items: unknown[], strategy: OrderStrategy): number => {
	switch (strategy) {
		case "fifo": return 0;
		case "lifo": return items.length - 1;
		case "random": return Math.floor(Math.random() * items.length);
		case "priority":
		default: return 0;
	}
};

// ============================================================================
// Feature 15: Queue Snapshot
// ============================================================================

export const createSnapshot = <A>(queue: Queue<A>, items: A[]): QueueSnapshot<A> => {
	const metadata: SnapshotMetadata = {
		queueName: "queue",
		queueType: queue.type,
		itemCount: items.length,
		version: 1,
	};
	return {
		id: crypto.randomUUID(),
		createdAt: Date.now(),
		items,
		metadata,
	};
};

// ============================================================================
// Feature 16: Transaction Support
// ============================================================================

export const createTransaction = <A>(): Transaction<A> => ({
	id: crypto.randomUUID(),
	operations: [],
	status: "pending",
});

export const addOperation = <A>(
	transaction: Transaction<A>,
	operation: TransactionOperation<A>,
): Transaction<A> => ({
	...transaction,
	operations: [...transaction.operations, operation],
});

export const commitTransaction = async <A>(
	transaction: Transaction<A>,
	handlers: Record<string, (op: TransactionOperation<A>) => Promise<boolean>>,
): Promise<TransactionResult> => {
	for (const operation of transaction.operations) {
		const handler = handlers[operation.queueName];
		if (!handler || !(await handler(operation))) {
			return { success: false, error: `Failed to execute operation on ${operation.queueName}` };
		}
	}
	return { success: true, committedAt: Date.now() };
};

// ============================================================================
// Feature 17: Message Routing
// ============================================================================

export const routeMessage = <A>(item: A, config: RouterConfig<A>): string => {
	for (const rule of config.rules.sort((a, b) => b.priority - a.priority)) {
		const matches = rule.pattern instanceof RegExp
			? rule.pattern.test(JSON.stringify(item))
			: JSON.stringify(item).includes(rule.pattern);
		if (matches && (!rule.condition || rule.condition(item))) {
			return rule.targetQueue;
		}
	}
	return config.defaultQueue;
};

// ============================================================================
// Feature 18: Schema Validation
// ============================================================================

export const validateItem = <A>(item: unknown, config: ValidationConfig<A>): ValidationResult<A> => {
	const result = config.schema.validate(item);
	if (!result.valid && config.strict) {
		return { valid: false, ...(result.errors ? { errors: result.errors } : {}) };
	}
	if (result.valid && config.transformOnValid) {
		return { valid: true, data: config.transformOnValid(result.data!) };
	}
	return result;
};

// ============================================================================
// Feature 19: Backpressure Handling
// ============================================================================

export const checkBackpressure = (queueSize: number, config: BackpressureConfig): BackpressureStatus => {
	const utilization = queueSize / config.highWatermark;
	let pressureLevel: "none" | "low" | "medium" | "high" | "critical" = "none";
	if (utilization >= 1) pressureLevel = "critical";
	else if (utilization >= 0.8) pressureLevel = "high";
	else if (utilization >= 0.6) pressureLevel = "medium";
	else if (utilization >= 0.4) pressureLevel = "low";

	return {
		isUnderPressure: utilization > 0.5,
		pressureLevel,
		pausedProducers: utilization > 0.8 ? 1 : 0,
	};
};

// ============================================================================
// Feature 20: Queue Federation
// ============================================================================

class FederationManager<A> {
	private config: FederationConfig;
	private upstreamMessages: FederatedMessage<A>[] = [];
	private downstreamMessages: Map<string, FederatedMessage<A>[]> = new Map();
	lastSyncAt = 0;

	constructor(config: FederationConfig) {
		this.config = config;
	}

	get connectedNodes(): number {
		return this.config.upstreamQueues.length + this.config.downstreamQueues.length;
	}

	get pendingSyncs(): number {
		return this.upstreamMessages.length + Array.from(this.downstreamMessages.values()).reduce((sum, arr) => sum + arr.length, 0);
	}

	receiveFromUpstream(message: FederatedMessage<A>): void {
		this.upstreamMessages.push(message);
	}

	sendToDownstream(queueName: string, value: A): void {
		const message: FederatedMessage<A> = {
			value,
			originQueue: this.config.localQueue,
			federationTimestamp: Date.now(),
			hops: 1,
		};
		const existing = this.downstreamMessages.get(queueName) ?? [];
		existing.push(message);
		this.downstreamMessages.set(queueName, existing);
	}

	sync(): FederationStatus {
		this.lastSyncAt = Date.now();
		return {
			connectedNodes: this.connectedNodes,
			pendingSyncs: this.pendingSyncs,
			lastSyncAt: this.lastSyncAt,
		};
	}

	resolveConflict<T>(_local: T, remote: T, strategy: FederationConfig["conflictResolution"]): T {
		switch (strategy) {
			case "last-write-wins":
				return remote;
			case "timestamp":
			default:
				return remote;
		}
	}
}

export const createFederationManager = <A>(config: FederationConfig): FederationManager<A> => {
	return new FederationManager<A>(config);
};

export const getFederationStatus = <A>(manager: FederationManager<A>): FederationStatus => manager.sync();
