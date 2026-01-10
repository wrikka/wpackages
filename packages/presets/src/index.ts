import { Effect } from "effect";
import { createLogger } from "@wpackages/observability";

/**
 * Creates and runs an Effect program with logging support.
 * @param program The Effect program to run.
 */
export const createApp = <A, E>(program: Effect.Effect<A, E>) => {
	const logger = createLogger();
	logger.info("Application starting");

	const runnable = Effect.tapError(program, (error) =>
		Effect.sync(() => logger.error("Application error", { error })),
	);

	return Effect.runPromise(runnable);
};
