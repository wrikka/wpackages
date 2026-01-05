import { Effect, Layer } from "effect";
import { RandomGenerationError } from "./error";
import { ConfigLive, Logger, LoggerLive, Random } from "./services";

export const program = Effect.gen(function*() {
	const random = yield* Random;
	const logger = yield* Logger;
	const n = yield* random.next();
	yield* Effect.sync(() => logger.info("random-number-generated", { number: n }));
});

const RandomLive = Layer.succeed(Random, {
	next: () => {
		const n = Math.random();
		return n < 0.1
			? Effect.fail(new RandomGenerationError({ reason: "Unlucky draw" }))
			: Effect.succeed(n);
	},
});

export const MainLive = Layer.merge(
	LoggerLive.pipe(Layer.provide(ConfigLive)),
	RandomLive,
);
