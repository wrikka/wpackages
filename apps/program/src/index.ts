import { MainLive, program } from "./app";
import { RandomGenerationError } from "./error";
import { Effect } from "./lib/functional";

const runnable = Effect.provideLayer(program, MainLive);

const main = async () => {
	const result = await Effect.runPromiseEither(runnable);
	if (result._tag === "Left") {
		const error = result.left;
		if (error instanceof RandomGenerationError) {
			console.error(`Random generation failed: ${error.reason}`);
		} else if (error instanceof Error) {
			console.error(`An unexpected error occurred: ${error.message}`);
		} else {
			console.error("An unknown error occurred.");
		}
		process.exitCode = 1;
	}
};

void main();
