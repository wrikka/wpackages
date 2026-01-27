import { resolve } from "node:path";
import type { FormatOptions, FormatterEngine } from "./types/formatter";
import { findUp, ProcessError, spawnAsync } from "./utils";

const detectEngine = (cwd: string): Exclude<FormatterEngine, "auto"> => {
	const biomeConfig = findUp(cwd, ["biome.json", "biome.jsonc"]);
	if (biomeConfig) return "biome";

	const dprintConfig = findUp(cwd, ["dprint.json"]);
	if (dprintConfig) return "dprint";

	return "dprint";
};

const createEngineCommand = (
	engine: Exclude<FormatterEngine, "auto">,
	paths: string[],
	options: Required<Pick<FormatOptions, "check" | "cwd">> & {
		configPath?: string;
	},
): { command: string; args: string[] } => {
	const resolvedPaths = paths.length === 0 ? ["."] : paths;

	if (engine === "biome") {
		const args = ["biome", "format", options.check ? "--check" : "--write"];

		if (options.configPath) {
			args.push("--config-path", options.configPath);
		}

		args.push(...resolvedPaths);
		return { command: "bunx", args };
	}

	const args = ["dprint", "fmt"];
	if (options.check) args.push("--check");
	if (options.configPath) args.push("--config", options.configPath);
	args.push(...resolvedPaths);
	return { command: "bunx", args };
};

export const format = async (
	paths: string[],
	options: FormatOptions = {},
): Promise<{ stdout: string; stderr: string }> => {
	const cwd = options.cwd ? resolve(options.cwd) : process.cwd();
	const engine: Exclude<FormatterEngine, "auto"> = options.engine && options.engine !== "auto"
		? options.engine
		: detectEngine(cwd);

	const { command, args } = createEngineCommand(engine, paths, {
		check: options.check ?? false,
		cwd,
		configPath: options.configPath
			? resolve(cwd, options.configPath)
			: undefined,
	});

	const res = await spawnAsync(command, args, { cwd });
	if (res.exitCode !== 0) {
		const tool = engine === "biome" ? "biome" : "dprint";
		throw new ProcessError(
			`${tool} failed with exit code ${res.exitCode}`,
			res.stdout,
			res.stderr,
			res.exitCode,
		);
	}

	return { stdout: res.stdout, stderr: res.stderr };
};

export type { FormatOptions, FormatterEngine } from "./types/formatter";
export { ProcessError } from "./utils/process";
