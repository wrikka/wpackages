/**
 * Priority queue types
 */

import type { Queue } from "./basic";
import type { OfferSuccess } from "./operations";

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
