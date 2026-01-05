import { Context, Effect } from "effect";

export class RateLimitError {
	readonly _tag = "RateLimitError";
	constructor(readonly message: string = "Rate limit exceeded") {}
}

export interface RateLimiterStorage {
	check(clientId: string, now: number): Effect.Effect<void, RateLimitError>;
}

export class RateLimiter {
	static readonly Current = Context.GenericTag<RateLimiter>("RateLimiter");

	constructor(private readonly storage: RateLimiterStorage) {}

	check(clientId: string): Effect.Effect<void, RateLimitError> {
		return this.storage.check(clientId, Date.now());
	}
}
