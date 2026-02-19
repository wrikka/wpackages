/**
 * Queue operation result types
 */

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
}

export interface PollFailure {
	readonly _tag: "PollFailure";
	readonly reason: "empty" | "shutdown" | "timeout";
}

export interface QueueShutdown {
	readonly _tag: "QueueShutdown";
}

export interface OfferSuccess {
	readonly _tag: "OfferSuccess";
}
