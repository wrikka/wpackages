import { Effect } from "effect";

export type Process = {
	readonly argv: readonly string[];
	readonly exit: (code: number) => void;
};

export const makeCliService = (process: Process) => ({
	getArgs: Effect.succeed(process.argv.slice(2)),
	exit: (code: number): Effect.Effect<void, never, never> => Effect.sync(() => process.exit(code)),
});

// Default service using the global process object
export const CliService = makeCliService(process);
