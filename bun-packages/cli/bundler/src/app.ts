import { resolveConfig } from "./config";
import type { BunpackConfig, Format, Target } from "./types";

async function buildNative(config: BunpackConfig) {
	const napiConfig = config.native?.napi;
	if (!napiConfig) return;

	console.log("Building native addons...");

	const crateDir = napiConfig.crateDir ?? "native";
	const args = ["cargo", "build"];

	if (napiConfig.release) {
		args.push("--release");
	}

	if (napiConfig.features && napiConfig.features.length > 0) {
		args.push("--features", napiConfig.features.join(","));
	}

	const proc = Bun.spawn(args, {
		cwd: crateDir,
		stdio: ["inherit", "inherit", "inherit"],
		env: { ...process.env, ...napiConfig.env },
	});

	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		throw new Error("Native build failed.");
	}

	console.log("Successfully built native addons.");

	const { copyFile, mkdir } = await import("node:fs/promises");
	const path = await import("node:path");

	const outFile = napiConfig.outFile ?? config.name;
	if (!outFile) {
		throw new Error(
			"Could not determine native addon output file name. Please specify 'native.napi.outFile' or 'name' in your config.",
		);
	}

	const sourcePath = path.join(crateDir, "target", napiConfig.release ? "release" : "debug", `${outFile}.node`);
	const destPath = path.join(config.outDir!, `${outFile}.node`);

	await mkdir(path.dirname(destPath), { recursive: true });
	await copyFile(sourcePath, destPath);

	console.log(`Copied native addon to ${destPath}`);
}

async function buildTS(config: BunpackConfig) {
	console.log("Building TypeScript files...");

	if (!config.outDir) {
		throw new Error("Missing 'outDir' in config.");
	}

	const formats = Array.isArray(config.format)
		? config.format
		: [config.format].filter((f): f is Format => f !== undefined);
	const targets = Array.isArray(config.target)
		? config.target
		: [config.target].filter((t): t is Target => t !== undefined);
	const target = targets[0] ?? "bun";

	for (const format of formats) {
		const result = await Bun.build({
			entrypoints: config.entry as string[],
			outdir: config.outDir,
			target,
			format,
			sourcemap: config.sourcemap ? "external" : "none",
			minify: config.minify ?? false,
			external: config.external ?? [],
		});

		if (!result.success) {
			console.error("Build failed");
			for (const message of result.logs) {
				console.error(message);
			}
			throw new AggregateError(result.logs, "Build failed");
		}

		console.log(`Successfully built ${format} format.`);
	}
}

async function emitDts(config: BunpackConfig) {
	if (!config.dts) return;

	console.log("Emitting declaration files...");

	const dtsConfig = typeof config.dts === "boolean" ? {} : config.dts;
	const entry = dtsConfig.entry ?? config.entry;
	const outFile = dtsConfig.outFile ?? "index.d.ts";

	const args = [
		"tsc",
		...(Array.isArray(entry)
			? entry.filter((e): e is string => e !== undefined)
			: [entry].filter((e): e is string => e !== undefined)),
		"--declaration",
		"--emitDeclarationOnly",
		"--target",
		"ES2022",
		"--module",
		"NodeNext",
		"--outFile",
		`${config.outDir}/${outFile}`,
	];

	const proc = Bun.spawn(args, { stdio: ["inherit", "inherit", "inherit"] });
	const exitCode = await proc.exited;

	if (exitCode !== 0) {
		throw new Error("d.ts generation failed.");
	}

	console.log("Successfully emitted declaration files.");
}

export async function build(inlineConfig: Partial<BunpackConfig> = {}) {
	const config = await resolveConfig(inlineConfig);

	console.log("Starting build with resolved config:", config);

	if (config.clean && config.outDir) {
		console.log(`Cleaning output directory: ${config.outDir}`);
		const { rm } = await import("node:fs/promises");
		await rm(config.outDir, { recursive: true, force: true });
	}

	await buildNative(config);
	await buildTS(config);
	await emitDts(config);

	console.log("Build finished.");
}
