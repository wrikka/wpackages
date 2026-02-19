import chokidar from "chokidar";
import pc from "picocolors";
import { resolveConfig } from "../config";
import { collectSummary, computeBuildHash, loadCacheHash, saveCacheHash } from "../services";
import type { BuildContext, BuildStep, BunpackConfig, Format, Hooks, Plugin } from "../types";
import { buildBin, buildNative, buildTS, buildWasm, emitDts } from "./builder";

function shouldRunClean(config: BunpackConfig): boolean {
	const policy = config.cleanPolicy;
	if (!config.clean || !config.outDir) return false;
	if (!policy) return true;
	if (policy.enabled === false) return false;
	if (!policy.steps || policy.steps.length === 0) return true;
	return policy.steps.includes("clean");
}

function formatsToClean(config: BunpackConfig): Format[] {
	const formats = Array.isArray(config.format)
		? config.format
		: [config.format].filter((f): f is Format => f !== undefined);
	const policyFormats = config.cleanPolicy?.formats;
	if (!policyFormats || policyFormats.length === 0) return formats;
	return formats.filter((f) => policyFormats.includes(f));
}

export class BuildOrchestrator {
	private config: BunpackConfig;
	private context: BuildContext;

	private constructor(config: BunpackConfig) {
		this.config = config;
		this.context = { resolvedConfig: config };
	}

	private resolveCacheDir(): string | null {
		const cache = this.config.cache;
		if (!cache) return null;

		if (typeof cache === "object" && cache.enabled === false) {
			return null;
		}

		if (typeof cache === "object" && cache.dir) {
			return cache.dir;
		}

		return ".bunpack-cache";
	}

	private async shouldSkipBuildByCache(): Promise<boolean> {
		const cacheDir = this.resolveCacheDir();
		if (!cacheDir) return false;
		if (!this.config.outDir) return false;

		const fs = await import("node:fs/promises");
		const path = await import("node:path");

		const outDirPath = path.resolve(this.config.outDir);
		try {
			const s = await fs.stat(outDirPath);
			if (!s.isDirectory()) return false;
		} catch {
			return false;
		}

		const cwd = process.cwd();
		const hash = await computeBuildHash(cwd, this.config);
		const prev = await loadCacheHash(path.resolve(cacheDir));
		return prev === hash;
	}

	private async updateCacheHash(): Promise<void> {
		const cacheDir = this.resolveCacheDir();
		if (!cacheDir) return;

		const path = await import("node:path");
		const hash = await computeBuildHash(process.cwd(), this.config);
		await saveCacheHash(path.resolve(cacheDir), hash);
	}

	private async runStep(step: BuildStep, fn: () => Promise<void>) {
		try {
			await this.config.hooks?.beforeStep?.(step, this.context);
			await fn();
			await this.config.hooks?.afterStep?.(step, this.context);
		} catch (error) {
			await this.config.hooks?.onError?.(step, error, this.context);
			throw error;
		}
	}

	public static async create(inlineConfig: Partial<BunpackConfig> = {}): Promise<BuildOrchestrator> {
		const config = await resolveConfig(inlineConfig);
		return new BuildOrchestrator(config);
	}

	private async setupPlugins() {
		if (!this.config.plugins || this.config.plugins.length === 0) {
			return;
		}
		for (const plugin of this.config.plugins) {
			await this.setupPlugin(plugin);
		}
	}

	private async setupPlugin(plugin: Plugin) {
		console.log(`Setting up plugin: ${pc.cyan(plugin.name)}`);
		await plugin.setup(this.context);
	}

	private async runHook(name: keyof Hooks) {
		const hook = this.config.hooks?.[name];
		if (hook) {
			if (name === "configResolved") {
				await (hook as (config: BunpackConfig) => void | Promise<void>)(this.context.resolvedConfig);
			} else {
				await (hook as (ctx: BuildContext) => void | Promise<void>)(this.context);
			}
		}
	}

	private async performBuild() {
		await this.runHook("beforeBuild");

		const startedAtMs = Date.now();

		if (await this.shouldSkipBuildByCache()) {
			console.log(pc.green("Cache hit: skipping build."));
			return;
		}

		if (shouldRunClean(this.config) && this.config.outDir) {
			const { rm } = await import("node:fs/promises");
			const path = await import("node:path");
			const formats = formatsToClean(this.config);
			const policy = this.config.cleanPolicy;

			if (!policy?.steps || policy.steps.length === 0) {
				console.log(`Cleaning output directory: ${pc.yellow(this.config.outDir)}`);
				await rm(this.config.outDir, { recursive: true, force: true });
			} else {
				console.log(`Cleaning output directory (policy): ${pc.yellow(this.config.outDir)}`);
				for (const f of formats) {
					await rm(path.join(this.config.outDir, f), { recursive: true, force: true });
				}
				await rm(path.join(this.config.outDir, "types"), { recursive: true, force: true });
				await rm(path.join(this.config.outDir, "bin"), { recursive: true, force: true });
			}
		}

		try {
			await this.runStep("native", async () => buildNative(this.config));
			await this.runStep("wasm", async () => buildWasm(this.config));
			await this.runStep("ts", async () => buildTS(this.config));
			await this.runStep("dts", async () => emitDts(this.config));
			await this.runStep("bin", async () => buildBin(this.config));

			await this.updateCacheHash();

			await this.runHook("afterBuild");

			if (this.config.outDir) {
				const endedAtMs = Date.now();
				const summary = await collectSummary(this.config.outDir, startedAtMs, endedAtMs);
				console.log(pc.bold(pc.green("\nBuild Summary")));
				console.log(`- duration: ${summary.durationMs}ms`);
				console.log(`- total: ${summary.totalBytes} bytes`);
				console.log(`- files: ${summary.artifacts.length}`);
			}

			console.log(pc.green("Build finished successfully!"));
		} catch (error) {
			console.error(pc.red("Build failed:"), error);
			throw error;
		}
	}

	public async build() {
		console.log(pc.green(`Starting build for ${pc.bold(this.config.name ?? "unnamed package")}...`));

		await this.runHook("configResolved");
		await this.setupPlugins();
		await this.performBuild();

		if (this.config.watch) {
			console.log(pc.blue("\nWatching for file changes..."));
			const watchTargets: string[] = ["src", "bunpack.config.ts", "bunpack.config.js"];
			if (this.config.configFile) {
				watchTargets.push(this.config.configFile);
			}

			const watcher = chokidar.watch(watchTargets, {
				ignored: /(^|[/])\../, // ignore dotfiles
				persistent: true,
			});

			let timer: ReturnType<typeof setTimeout> | null = null;

			watcher.on("change", async (path) => {
				console.log(pc.yellow(`\nFile changed: ${path}. Rebuilding...`));
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(async () => {
					await this.performBuild();
				}, 150);
			});
		}
	}
}
