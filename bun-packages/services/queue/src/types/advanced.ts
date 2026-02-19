/**
 * Advanced queue features types (Distributed, Dead Letter, etc.)
 */

import type { Queue } from "./basic";

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
	readonly type: "unbounded";
	readonly capacity: "unbounded";
	readonly parentQueue: string;
	readonly deadLetterConfig: DeadLetterConfig;
}
