import { createEnvManager } from "@wpackages/config-manager";
import { Console, Effect } from "effect";
import type { CliOptions } from "./types/cli";
import { parseArgs } from "./utils/args";
import { toDotenv } from "./utils/dotenv";

const getArgs = Effect.sync(() => process.argv.slice(2));

const parseOptions = (args: string[]) =>
	Effect.try({
		try: () => parseArgs(args),
		catch: (unknown) => unknown as Error,
	});

const loadEnv = (opts: CliOptions) =>
	Effect.gen(function* (_) {
		const manager = createEnvManager({
			paths: opts.paths,
			...(opts.environment !== undefined ? { environment: opts.environment } : {}),
			expand: opts.expand,
			override: opts.override,
		});

		const result = manager.load();
		if (result._tag === "Failure") {
			return yield* _(Effect.fail((result as any).error as Error));
		}

		return manager.getAll() as Record<string, unknown>;
	});

const formatOutput = (
	outputFormat: "json" | "dotenv",
	data: Record<string, unknown>,
) =>
	Effect.sync(() => {
		if (outputFormat === "dotenv") {
			return toDotenv(data);
		}
		return JSON.stringify(data, null, 2);
	});

const program = Effect.gen(function* (_) {
	const args = yield* _(getArgs);
	const opts = yield* _(parseOptions(args));
	const envData = yield* _(loadEnv(opts));
	const output = yield* _(formatOutput(opts.output, envData));
	yield* _(Console.log(`${output}\n`));
});

export const runEnvManagerApp = () => Effect.runPromise(program);

runEnvManagerApp().catch((error) => {
	console.error(error);
	process.exit(1);
});
