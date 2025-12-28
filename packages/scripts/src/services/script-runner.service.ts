import { createConfigManager } from "@wts/config-manager";
import { Context, Effect, Layer } from "effect";
import { scriptRunnerConfigSchema } from "../config";
import { DEFAULT_SCRIPT_RUNNER_CONFIG } from "../constant";
import type { Script, ScriptResult, ScriptRunnerConfig } from "../types";
import { isValidScript, sortScriptsByDependencies } from "../utils";

/**
 * Script runner service errors
 */
export class ScriptRunnerError extends Error {
	readonly _tag = "ScriptRunnerError";
	constructor(message: string, cause?: unknown) {
		super(message);
		this.cause = cause;
	}
}

/**
 * Script runner service interface
 */
export interface ScriptRunnerService {
	readonly runScript: (
		script: Script,
	) => Effect.Effect<ScriptResult, ScriptRunnerError>;
	readonly runScripts: (
		scripts: Script[],
	) => Effect.Effect<ScriptResult[], ScriptRunnerError>;
	readonly runScriptByName: (
		name: string,
	) => Effect.Effect<ScriptResult, ScriptRunnerError>;
	readonly listScripts: () => Effect.Effect<Script[], ScriptRunnerError>;
}

/**
 * Script runner service tag
 */
export const ScriptRunnerService = Context.GenericTag<ScriptRunnerService>(
	"ScriptRunnerService",
);

/**
 * Create script runner service
 */
export const makeScriptRunner = Effect.gen(function*() {
	// Create config manager
	const configManager = createConfigManager<ScriptRunnerConfig>({
		name: "scripts",
		defaultConfig: DEFAULT_SCRIPT_RUNNER_CONFIG,
		schema: scriptRunnerConfigSchema,
	});

	// Load configuration
	let config: ScriptRunnerConfig;
	try {
		const configResult = yield* Effect.promise(() => configManager.load());
		config = configResult.config;
	} catch (error) {
		return yield* Effect.fail(
			new ScriptRunnerError("Failed to load configuration", error),
		);
	}

	// Run a single script
	const runScript = (script: Script): Effect.Effect<ScriptResult, ScriptRunnerError> =>
		Effect.gen(function*() {
			if (!isValidScript(script)) {
				return yield* Effect.fail(
					new ScriptRunnerError(`Invalid script configuration: ${(script as any).name}`),
				);
			}

			const startTime = Date.now();

			try {
				// Execute the script command
				const result = yield* Effect.promise(
					() =>
						new Promise<{ stdout: string; stderr: string }>(
							(resolve, reject) => {
								const { spawn } = require("node:child_process");
								const child = spawn(script.command, {
									shell: true,
									cwd: script.cwd || config.cwd,
									env: { ...config.env, ...script.env },
								});

								let stdout = "";
								let stderr = "";

								child.stdout?.on("data", (data: Buffer) => {
									stdout += data.toString();
								});

								child.stderr?.on("data", (data: Buffer) => {
									stderr += data.toString();
								});

								child.on("close", (code: number) => {
									if (code === 0) {
										resolve({ stdout, stderr });
									} else {
										reject(
											new Error(`Script exited with code ${code}: ${stderr}`),
										);
									}
								});

								child.on("error", (error: Error) => {
									reject(error);
								});
							},
						),
				);

				const duration = Date.now() - startTime;

				return {
					name: script.name,
					success: true,
					output: result.stdout,
					error: result.stderr || undefined,
					duration,
				} satisfies ScriptResult;
			} catch (error) {
				const duration = Date.now() - startTime;

				return {
					name: script.name,
					success: false,
					error: error instanceof Error ? error.message : String(error),
					duration,
				} satisfies ScriptResult;
			}
		});

	// Run multiple scripts
	const runScripts = (scripts: Script[]): Effect.Effect<ScriptResult[], ScriptRunnerError> =>
		Effect.gen(function*() {
			// Sort scripts by dependencies
			const sortedScripts = sortScriptsByDependencies(scripts);

			// Run scripts in parallel or sequence based on configuration
			if (config.parallel) {
				const results = yield* Effect.forEach(sortedScripts, runScript, {
					concurrency: "unbounded",
				});
				return results;
			} else {
				const results: ScriptResult[] = [];
				for (const script of sortedScripts) {
					const result = yield* runScript(script);
					results.push(result);
				}
				return results;
			}
		});

	// Run script by name
	const runScriptByName = (name: string): Effect.Effect<ScriptResult, ScriptRunnerError> =>
		Effect.gen(function*() {
			const script = config.scripts[name];
			if (!script) {
				return yield* Effect.fail(
					new ScriptRunnerError(`Script not found: ${name}`),
				);
			}

			return yield* runScript(script);
		});

	// List all available scripts
	const listScripts = (): Effect.Effect<Script[], ScriptRunnerError> => Effect.succeed(Object.values(config.scripts));

	return {
		runScript,
		runScripts,
		runScriptByName,
		listScripts,
	} satisfies ScriptRunnerService;
});

/**
 * Script runner service layer
 */
export const ScriptRunnerServiceLive = Layer.effect(
	ScriptRunnerService,
	makeScriptRunner,
);
