import { Effect } from "effect";
import { createCli } from "@wpackages/cli-builder";
import { formatService, detectEngine } from "./services";
import { ensureArray } from "./utils";
import { formatIntro, formatSuccess, formatSpinner, formatOutro } from "./components";
import type { FormatOptions, FormatterEngine } from "./types";
import { ProcessError } from "@wpackages/formatter";
import { CLI_NAME, CLI_VERSION } from "./constant";

const resolveEngine = (
	engine: FormatterEngine | undefined,
	cwd: string,
): Effect.Effect<Exclude<FormatterEngine, "auto">, never> => {
	if (engine && engine !== "auto") {
		return Effect.succeed(engine);
	}
	return detectEngine(cwd);
};

const formatProgram = (options: FormatOptions): Effect.Effect<void, ProcessError> =>
	Effect.gen(function*() {
		const paths = ensureArray(options.paths ?? ["."]);
		const cwd = options.cwd ?? process.cwd();
		const check = options.check ?? false;

		console.log(formatIntro("formatter"));

		const engine = yield* resolveEngine(options.engine, cwd);
		console.log(formatSpinner(check, paths));

		const _result = yield* formatService(paths, {
			...options,
			engine,
			cwd,
		});

		console.log(formatSuccess(check ? "Check complete." : "Formatting complete."));
		console.log(formatOutro("All done!"));
	});

const formatAction = async (args: Record<string, any>) => {
	const options: FormatOptions = {
		paths: args._?.length > 0 ? args._ : ["."],
		check: args.check,
		engine: args.engine,
		cwd: args.cwd,
		configPath: args.config,
	};

	await Effect.runPromise(formatProgram(options));
};

export const runFormatterApp = async () => {
	await createCli({
		name: CLI_NAME,
		version: CLI_VERSION,
		commands: [
			{
				name: "format",
				aliases: ["fmt"],
				description: "Format code files",
				options: [
					{
						name: "--check",
						shorthand: "-c",
						description: "Check for formatting issues without writing changes",
						defaultValue: false,
					},
					{
						name: "--engine",
						shorthand: "-e",
						description: 'The formatting engine to use ("auto", "dprint", "biome")',
						defaultValue: "auto",
					},
					{
						name: "--cwd",
						description: "The working directory to run in",
					},
					{
						name: "--config",
						shorthand: "-C",
						description: "Path to the configuration file",
					},
				],
				action: formatAction,
			},
		],
	});
};
