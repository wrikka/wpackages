export class RandomGenerationError extends Error {
	override readonly name = "RandomGenerationError";
	readonly code = "RANDOM_UNAVAILABLE";
	readonly reason: string;

	constructor(payload: { reason: string }) {
		super(`Random number generation failed: ${payload.reason}`);
		this.reason = payload.reason;
	}
}
