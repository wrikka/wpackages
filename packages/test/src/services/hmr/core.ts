import { EventEmitter } from "node:events";
import { watch } from "node:fs";
import { dirname, join, relative } from "node:path";

import type { WorkerPool } from "../core/worker-pool";
import { compileIgnorePatterns, shouldIgnoreFile } from "./ignore";
import { getAffectedTests } from "./impact";
import { rerunAffectedTests } from "./runner";
import type { HMRConfig, HMRUpdate, HotModule, WatcherMap } from "./types";

export class HotModuleReplacement extends EventEmitter {
	private config: HMRConfig;
	private workerPool: WorkerPool;
	private watchers: WatcherMap = new Map();
	private hotModules = new Map<string, HotModule>();
	private debounceTimers = new Map<string, NodeJS.Timeout>();
	private lastRunTime = new Map<string, number>();
	private ignoreRegexes: RegExp[];

	constructor(workerPool: WorkerPool, config: Partial<HMRConfig> = {}) {
		super();
		this.workerPool = workerPool;
		this.config = {
			enabled: true,
			debounceMs: 300,
			ignorePatterns: [
				"**/node_modules/**",
				"**/dist/**",
				"**/build/**",
				"**/coverage/**",
				"**/.git/**",
				"**/*.log",
			],
			extensions: [".ts", ".js", ".mjs", ".cjs"],
			hotModules: new Set(),
			concurrency: 4,
			...config,
		};
		this.ignoreRegexes = compileIgnorePatterns(this.config.ignorePatterns);
	}

	public enableHotModule(modulePath: string): void {
		this.config.hotModules.add(modulePath);
	}

	public accept(moduleId: string, callback?: () => void): void {
		if (!this.hotModules.has(moduleId)) {
			this.hotModules.set(moduleId, {
				id: moduleId,
				accepts: [],
				disposes: [],
			});
		}

		const hotModule = this.hotModules.get(moduleId)!;
		if (callback) {
			hotModule.accepts.push(callback.toString());
		}
	}

	public dispose(moduleId: string, callback: () => void): void {
		if (!this.hotModules.has(moduleId)) {
			this.hotModules.set(moduleId, {
				id: moduleId,
				accepts: [],
				disposes: [],
			});
		}

		const hotModule = this.hotModules.get(moduleId)!;
		hotModule.disposes.push(callback);
	}

	public startWatching(testFiles: string[]): void {
		if (!this.config.enabled) {
			return;
		}

		const directories = this.groupFilesByDirectory(testFiles);
		for (const [dir, files] of directories) {
			this.watchDirectory(dir, files);
		}

		console.log(`🔥 HMR enabled for ${testFiles.length} test files`);
	}

	public stopWatching(): void {
		for (const [, watcher] of this.watchers) {
			watcher.close();
		}
		this.watchers.clear();

		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();

		console.log("🔥 HMR stopped");
	}

	public getStats(): {
		enabled: boolean;
		watchedDirectories: number;
		hotModules: number;
		pendingDebounces: number;
		lastRunTimes: Record<string, number>;
	} {
		return {
			enabled: this.config.enabled,
			watchedDirectories: this.watchers.size,
			hotModules: this.hotModules.size,
			pendingDebounces: this.debounceTimers.size,
			lastRunTimes: Object.fromEntries(this.lastRunTime),
		};
	}

	public updateConfig(config: Partial<HMRConfig>): void {
		this.config = { ...this.config, ...config };
		this.ignoreRegexes = compileIgnorePatterns(this.config.ignorePatterns);
	}

	public isHotModuleEnabled(filePath: string): boolean {
		return this.config.hotModules.has(filePath);
	}

	public addIgnorePattern(pattern: string): void {
		this.config.ignorePatterns.push(pattern);
		this.ignoreRegexes = compileIgnorePatterns(this.config.ignorePatterns);
	}

	public removeIgnorePattern(pattern: string): void {
		const index = this.config.ignorePatterns.indexOf(pattern);
		if (index > -1) {
			this.config.ignorePatterns.splice(index, 1);
			this.ignoreRegexes = compileIgnorePatterns(this.config.ignorePatterns);
		}
	}

	private groupFilesByDirectory(files: string[]): Map<string, string[]> {
		const directories = new Map<string, string[]>();

		for (const file of files) {
			const dir = dirname(file);
			if (!directories.has(dir)) {
				directories.set(dir, []);
			}
			directories.get(dir)!.push(file);
		}

		return directories;
	}

	private watchDirectory(directory: string, testFiles: string[]): void {
		const watcher = watch(directory, { recursive: true }, (eventType, filename) => {
			if (!filename) return;

			const fullPath = join(directory, filename);
			if (
				shouldIgnoreFile({
					cwd: process.cwd(),
					filePath: fullPath,
					ignoreRegexes: this.ignoreRegexes,
					extensions: this.config.extensions,
				})
			) {
				return;
			}

			this.debounceFileChange(fullPath, eventType, testFiles);
		});

		this.watchers.set(directory, watcher);
	}

	private debounceFileChange(filePath: string, eventType: string, testFiles: string[]): void {
		const existingTimer = this.debounceTimers.get(filePath);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		const timer = setTimeout(() => {
			void this.handleFileChange(filePath, eventType, testFiles).catch((error) => {
				console.warn("HMR handleFileChange failed:", error);
			});
			this.debounceTimers.delete(filePath);
		}, this.config.debounceMs);

		this.debounceTimers.set(filePath, timer);
	}

	private async handleFileChange(
		filePath: string,
		eventType: string,
		testFiles: string[],
	): Promise<void> {
		console.log(`🔥 File changed: ${relative(process.cwd(), filePath)} (${eventType})`);

		const affectedTests = getAffectedTests(filePath, testFiles);
		if (affectedTests.length === 0) {
			console.log("ℹ️  No affected tests found");
			return;
		}

		const isHotModule = this.config.hotModules.has(filePath);
		const updateType = getUpdateType(filePath, isHotModule);

		const update: HMRUpdate = {
			type: updateType,
			filePath,
			affectedTests,
			changes: [`${eventType}: ${filePath}`],
		};

		this.emit("update", update);

		if (isHotModule) {
			await this.handleHotModuleUpdate(filePath, update);
		}

		await rerunAffectedTests({
			affectedTests,
			workerPool: this.workerPool,
			concurrency: this.config.concurrency,
			lastRunTime: this.lastRunTime,
			onTestComplete: (event) => {
				this.emit("testComplete", event);
			},
		});
	}

	private async handleHotModuleUpdate(filePath: string, update: HMRUpdate): Promise<void> {
		console.log(`🔥 Hot module update: ${filePath}`);

		const hotModule = this.hotModules.get(filePath);
		if (!hotModule) {
			return;
		}

		for (const dispose of hotModule.disposes) {
			try {
				dispose();
			} catch (error) {
				console.warn("Dispose callback failed:", error);
			}
		}

		hotModule.disposes = [];

		for (const _accept of hotModule.accepts) {
			try {
				console.log("Running accept callback");
			} catch (error) {
				console.warn("Accept callback failed:", error);
			}
		}

		this.emit("hotUpdate", { filePath, update });
	}
}

function getUpdateType(filePath: string, isHotModule: boolean): "test" | "module" | "config" {
	if (filePath.includes(".test.") || filePath.includes(".spec.")) {
		return "test";
	}
	if (isHotModule) {
		return "module";
	}
	if (filePath.includes("config") || filePath.includes(".config.")) {
		return "config";
	}
	return "module";
}
