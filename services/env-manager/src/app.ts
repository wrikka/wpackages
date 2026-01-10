import { createEnvManager } from "@wpackages/config-manager";
import { Console, Effect } from "effect";
import type { CliOptions } from "./types/cli";
import { parseArgs } from "./utils/args";
import { toDotenv } from "./utils/dotenv";
import { formatValidationErrors, loadSchema, validateEnv } from "./utils/schema";
import { writeExampleFile } from "./utils/example-generator";

const getArgs = Effect.sync(() => process.argv.slice(2));

const parseOptions = (args: string[]) =>
	Effect.try({
		try: () => parseArgs(args),
		catch: (unknown: unknown) => unknown as Error,
	});

const loadEnv = (opts: CliOptions) =>
	Effect.gen(function*(_) {
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

const validateSchema = (env: Record<string, unknown>, opts: CliOptions) =>
	Effect.gen(function*(_) {
		if (!opts.schema) return env;

		const schema = loadSchema(opts.schema);
		if (schema._tag === "SchemaLoadError") {
			return yield* _(Effect.fail(new Error(schema.message)));
		}

		const validation = validateEnv(env, schema);
		if (!validation.valid) {
			yield* _(Console.error(formatValidationErrors(validation)));
			return yield* _(Effect.fail(new Error("Schema validation failed")));
		}

		yield* _(Console.log("✓ Schema validation passed"));
		return env;
	});

const generateExampleFile = (env: Record<string, unknown>, opts: CliOptions) =>
	Effect.gen(function*(_) {
		if (!opts.generateExample) return env;

		const outputPath = opts.exampleOutput || ".env.example";
		writeExampleFile(env, outputPath);
		yield* _(Console.log(`✓ Generated .env.example at ${outputPath}`));

		return env;
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

const program = Effect.gen(function*(_) {
	const args = yield* _(getArgs);
	const opts = yield* _(parseOptions(args));
	const envData = yield* _(loadEnv(opts));
	const validatedData = yield* _(validateSchema(envData, opts));
	const exampleData = yield* _(generateExampleFile(validatedData, opts));
	const output = yield* _(formatOutput(opts.output, exampleData));
	yield* _(Console.log(`${output}\n`));
});

export const runEnvManagerApp = () => Effect.runPromise(program);

runEnvManagerApp().catch((error: unknown) => {
	console.error(error);
	process.exit(1);
});
