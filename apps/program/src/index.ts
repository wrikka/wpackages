import { Cause, Effect, Exit, Option } from "effect";
import { MainLive, program } from "./app";
import { RandomGenerationError } from "./error";

const runnable = program.pipe(Effect.provide(MainLive));

const main = async () => {
	const exit = await Effect.runPromiseExit(runnable);
	if (Exit.isFailure(exit)) {
		const failure = Cause.failureOption(exit.cause);
		if (Option.isSome(failure)) {
			const error = failure.value;
			if (error instanceof RandomGenerationError) {
				console.error(`Random generation failed: ${error.reason}`);
			} else if (error instanceof Error) {
				console.error(`An unexpected error occurred: ${error.message}`);
			} else {
				console.error("An unknown error occurred.");
			}
		} else {
			console.error("An unexpected defect occurred.");
		}
		process.exitCode = 1;
	}
};

void main();
