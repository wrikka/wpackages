import { Effect } from "effect";
import { showHelp } from "./help";
import { executeCommand as execute, parseArgs, executeCommandWithResult, parseArgsWithResult } from "./parser";
import type { ParsedCLI, ProgramDef, MiddlewareDef, PluginDef } from "./types";

/**
 * TUI Application
 * A functional approach to building command-line interfaces
 */
export class TuiApp {
	constructor(
		private readonly program: ProgramDef,
		private readonly middlewares: MiddlewareDef[] = [],
		private readonly plugins: PluginDef[] = [],
	) {}

	/**
	 * Run the TUI application
	 */
	run(args: string[] = process.argv.slice(2)): Effect.Effect<void, Error> {
		const program = this.program;
		const plugins = this.plugins;

		return Effect.gen(function*() {
			// Initialize plugins
			yield* Effect.all(
				plugins.map(plugin =>
					Effect.tryPromise(async () => {
						const result = plugin.setup?.({ program });
						if (result instanceof Promise) {
							await result;
						}
					})
				),
			);

			// Parse CLI arguments
			const parsed = yield* parseArguments(program, args);

			// Execute command
			const result = yield* executeCommand(program, parsed);

			return result;
		});
	}

	/**
	 * Register middleware
	 */
	use(middleware: MiddlewareDef): TuiApp {
		return new TuiApp(
			this.program,
			[...this.middlewares, middleware],
			this.plugins,
		);
	}

	/**
	 * Register plugin
	 */
	usePlugin(plugin: PluginDef): TuiApp {
		return new TuiApp(
			this.program,
			this.middlewares,
			[...this.plugins, plugin],
		);
	}
}

/**
 * Create a new TUI application
 */
export const createTui = (program: ProgramDef): TuiApp => {
	return new TuiApp(program);
};

// Re-export types and utilities
export * from "./services";
export * from "./types";
export * from "./utils";

// Internal helper functions
const getOption = (options: Record<string, unknown>, key: string): unknown => {
	// biome-ignore lint/complexity/useLiteralKeys: TypeScript noPropertyAccessFromIndexSignature requires bracket notation
	return options[key];
};

const handleHelpOrVersion = (
	options: Record<string, unknown>,
	program: ProgramDef,
	command?: string,
): boolean => {
	if (getOption(options, "help")) {
		showHelp(program, command);
		return true;
	}

	if (getOption(options, "version")) {
		console.log(program.version);
		return true;
	}

	return false;
};

/**
 * Run CLI program (functional style)
 */
export const runCLI = async (
	program: ProgramDef,
	argv: string[] = process.argv.slice(2),
): Promise<void> => {
	const parsed = parseArgs(argv, program);

	if (handleHelpOrVersion(parsed.options as Record<string, unknown>, program, parsed.command)) {
		return;
	}

	// Execute
	await execute(parsed, program);
};

// Internal functions for TuiApp class
const parseArguments = (
	program: ProgramDef,
	args: string[],
): Effect.Effect<ParsedCLI, Error> => {
	return Effect.try(() => parseArgs(args, program));
};

const executeCommand = (
	program: ProgramDef,
	parsed: ParsedCLI,
): Effect.Effect<void, Error> => {
	return Effect.tryPromise(async () => {
		await execute(parsed, program);
	});
};

/**
 * Run CLI program (functional - returns Result)
 * Recommended: Use this for better error handling
 */
export const runCLIWithResult = async (
	program: ProgramDef,
	argv: readonly string[] = process.argv.slice(2),
): Promise<{ _tag: "Success"; value: void } | { _tag: "Failure"; error: string }> => {
	const parseResult = parseArgsWithResult(argv, program);

	if (parseResult._tag === "Failure") {
		return { _tag: "Failure", error: `Parse error: ${JSON.stringify(parseResult.error)}` };
	}

	const parsed = parseResult.value;

	if (handleHelpOrVersion(parsed.options as Record<string, unknown>, program, parsed.command)) {
		return { _tag: "Success", value: undefined };
	}

	// Execute
	return await executeCommandWithResult(parsed, program);
};
