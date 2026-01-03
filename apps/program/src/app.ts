import { RandomGenerationError } from "./error";
import { Effect, Layer } from "./lib/functional";
import { ConfigLive, Logger, LoggerLive, Random } from "./services";

const programLogic = Effect.gen(function*() {
	const random = yield Effect.get(Random);
	const logger = yield Effect.get(Logger);
	const n = yield random.next();
	yield Effect.succeed(logger.info("random-number-generated", { number: n }));
});

export const program = Effect.mapError(
	programLogic,
	(e) => e as RandomGenerationError,
);

const RandomLive = Layer.succeed(Random, {
	next: () => {
		const n = Math.random();
		return n < 0.1
			? Effect.fail(new RandomGenerationError({ reason: "Unlucky draw" }))
			: Effect.succeed(n);
	},
});

export const MainLive = Layer.merge(
	ConfigLive,
	Layer.merge(LoggerLive, RandomLive),
);
