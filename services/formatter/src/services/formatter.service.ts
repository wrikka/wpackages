import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export type FormatterEngine = "auto" | "dprint" | "biome";

export type FormatOptions = {
	engine?: FormatterEngine;
	check?: boolean;
	cwd?: string;
	configPath?: string;
};

type SpawnResult = { stdout: string; stderr: string; exitCode: number };

const spawnAsync = (
	command: string,
	args: string[],
	opts: { cwd?: string } = {},
): Promise<SpawnResult> =>
	new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(command, args, {
			cwd: opts.cwd,
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: true,
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (buf: Buffer) => {
			stdout += buf.toString("utf8");
		});
		child.stderr?.on("data", (buf: Buffer) => {
			stderr += buf.toString("utf8");
		});

		child.on("error", rejectPromise);
		child.on("close", (exitCode) => {
			resolvePromise({
				stdout,
				stderr,
				exitCode: exitCode ?? 0,
			});
		});
	});

const findUp = (startDir: string, fileNames: string[]): string | null => {
	let current = resolve(startDir);

	while (true) {
		for (const fileName of fileNames) {
			const candidate = join(current, fileName);
			if (existsSync(candidate)) return candidate;
		}

		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
};

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
	options:
		& Required<Pick<FormatOptions, "check" | "cwd">>
		& Pick<FormatOptions, "configPath">,
): { command: string; args: string[] } => {
	const resolvedPaths = paths.length === 0 ? ["."] : paths;

	if (engine === "biome") {
		const args = [
			"biome",
			"format",
			options.check ? "--check" : "--write",
		];

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
		throw new Error(
			`${tool} failed with exit code ${res.exitCode}. ${res.stderr || res.stdout}`.trim(),
		);
	}

	return { stdout: res.stdout, stderr: res.stderr };
};
