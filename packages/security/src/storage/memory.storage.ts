import { Effect } from "effect";
import type { RateLimiterStorage } from "../services/rate-limit.service";
import { RateLimitError } from "../services/rate-limit.service";

export class InMemoryRateLimiterStorage implements RateLimiterStorage {
	private readonly requests = new Map<string, number[]>();

	constructor(
		private readonly windowMs: number,
		private readonly maxRequests: number,
	) {}

	check(clientId: string, now: number): Effect.Effect<void, RateLimitError> {
		const windowStart = now - this.windowMs;
		const timestamps = this.requests.get(clientId) ?? [];

		const validTimestamps = timestamps.filter((t) => t > windowStart);
		validTimestamps.push(now);

		if (validTimestamps.length > this.maxRequests) {
			return Effect.fail(new RateLimitError());
		}

		this.requests.set(clientId, validTimestamps);
		return Effect.void;
	}
}
