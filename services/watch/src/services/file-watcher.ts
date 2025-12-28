import { type FSWatcher, watch, type WatchEventType as NodeWatchEventType } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import type { PerformanceStats, WatcherConfig, WatcherInstance, WatchEvent, WatchEventType } from "../types";
import { createDebouncer } from "../utils/debounce";
import { getPathDepth, normalizePath, resolvePath } from "../utils/path-utils";
import { createPatternMatcher } from "../utils/pattern-matcher";
import { AdvancedPatternMatcher } from "./advanced-matcher";
import { createEventEmitter, type EventEmitter } from "./event-emitter";
import { HotReloadService } from "./hot-reload";
import { PerformanceMonitor } from "./performance-monitor";

const mapEventType = (
	nodeEvent: NodeWatchEventType,
	isFile: boolean,
): WatchEventType => {
	if (nodeEvent === "rename") {
		return isFile ? "unlink" : "unlinkDir";
	}
	return isFile ? "change" : "change";
};

export const createFileWatcher = (config: WatcherConfig): WatcherInstance => {
	const watchers = new Map<string, FSWatcher>();
	const emitter: EventEmitter = createEventEmitter();
	const watchedPaths = new Set<string>();

	let isActive = false;
	let startTime = 0;

	const stats = {
		eventsByType: {} as Record<string, number>,
		totalEvents: 0,
	};

	// Use advanced pattern matcher if available
	const advancedPatternMatcher = Array.isArray(config.ignored)
		? new AdvancedPatternMatcher(config.ignored)
		: null;

	const shouldIgnore = typeof config.ignored === "function"
		? config.ignored
		: advancedPatternMatcher
		? (path: string) => advancedPatternMatcher.shouldIgnore(path)
		: Array.isArray(config.ignored)
		? createPatternMatcher(config.ignored)
		: () => false;

	// Initialize performance monitoring
	const performanceMonitor = new PerformanceMonitor();

	// Initialize hot reload service
	const hotReloadService = new HotReloadService(config.debounceMs ?? 100);

	const emitEvent = async (event: WatchEvent): Promise<void> => {
		const startTime = Date.now();

		stats.totalEvents++;
		stats.eventsByType[event.type] = (stats.eventsByType[event.type] ?? 0) + 1;

		await emitter.emit(event.type, event);
		await emitter.emit("all", event);

		if (config.handler) {
			await config.handler(event);
		}

		// Record performance metrics
		const processingTime = Date.now() - startTime;
		performanceMonitor.recordEvent(event, processingTime);

		// Trigger hot reload if enabled
		if (config.enableHotReload) {
			hotReloadService.triggerReload(event);
		}
	};

	const handleFileChange = createDebouncer<
		(
			eventType: NodeWatchEventType,
			filename: string,
			watchPath: string,
		) => Promise<void>
	>(
		async (
			eventType: NodeWatchEventType,
			filename: string,
			watchPath: string,
		) => {
			if (!filename) return;

			const fullPath = normalizePath(`${watchPath}/${filename}`);

			if (shouldIgnore(fullPath)) return;

			if (config.depth !== undefined) {
				const depth = getPathDepth(fullPath) - getPathDepth(watchPath);
				if (depth > config.depth) return;
			}

			try {
				const stats = await stat(fullPath);
				const isFile = stats.isFile();

				const event: WatchEvent = {
					path: fullPath,
					stats: {
						isDirectory: stats.isDirectory(),
						isFile,
						mtime: stats.mtimeMs,
						size: stats.size,
					},
					timestamp: Date.now(),
					type: mapEventType(eventType, isFile),
				};

				await emitEvent(event);
			} catch {
				const event: WatchEvent = {
					path: fullPath,
					timestamp: Date.now(),
					type: "unlink",
				};
				await emitEvent(event);
			}
		},
		config.debounceMs ?? 100,
	);

	const watchPath = async (path: string): Promise<void> => {
		const resolved = resolvePath(path);

		if (watchers.has(resolved)) return;
		if (shouldIgnore(resolved)) return;

		try {
			const watcher = watch(
				resolved,
				{
					...config.options,
					recursive: config.options?.recursive ?? true,
				},
				(eventType, filename) => {
					handleFileChange(eventType, filename ?? "", resolved);
				},
			);

			watcher.on("error", async (error) => {
				if (config.errorHandler) {
					await config.errorHandler({
						cause: error,
						code: "WATCH_ERROR",
						message: error.message,
						path: resolved,
					});
				}
			});

			watchers.set(resolved, watcher);
			watchedPaths.add(resolved);

			if (!config.ignoreInitial) {
				try {
					const pathStat = await stat(resolved);
					if (pathStat.isDirectory()) {
						await emitEvent({
							path: resolved,
							stats: {
								isDirectory: true,
								isFile: false,
								mtime: pathStat.mtimeMs,
								size: pathStat.size,
							},
							timestamp: Date.now(),
							type: "addDir",
						});

						const entries = await readdir(resolved, { withFileTypes: true });
						for (const entry of entries) {
							const entryPath = normalizePath(`${resolved}/${entry.name}`);
							if (!shouldIgnore(entryPath)) {
								await emitEvent({
									path: entryPath,
									timestamp: Date.now(),
									type: entry.isFile() ? "add" : "addDir",
								});
							}
						}
					} else {
						await emitEvent({
							path: resolved,
							stats: {
								isDirectory: false,
								isFile: true,
								mtime: pathStat.mtimeMs,
								size: pathStat.size,
							},
							timestamp: Date.now(),
							type: "add",
						});
					}
				} catch {
					// Ignore initial scan errors
				}
			}
		} catch (error) {
			if (config.errorHandler) {
				await config.errorHandler({
					cause: error,
					code: "WATCH_START_ERROR",
					message: error instanceof Error ? error.message : "Unknown error",
					path: resolved,
				});
			}
		}
	};

	const unwatchPath = async (path: string): Promise<void> => {
		const resolved = resolvePath(path);
		const watcher = watchers.get(resolved);

		if (watcher) {
			watcher.close();
			watchers.delete(resolved);
			watchedPaths.delete(resolved);
		}
	};

	const start = async (): Promise<void> => {
		if (isActive) return;

		isActive = true;
		startTime = Date.now();

		for (const path of config.paths) {
			await watchPath(path);
		}

		await emitEvent({
			path: "",
			timestamp: Date.now(),
			type: "ready",
		});
	};

	const stop = async (): Promise<void> => {
		if (!isActive) return;

		for (const watcher of watchers.values()) {
			watcher.close();
		}

		watchers.clear();
		watchedPaths.clear();
		emitter.removeAllListeners();
		isActive = false;
	};

	const add = async (paths: string | readonly string[]): Promise<void> => {
		const pathArray = Array.isArray(paths) ? paths : [paths];
		for (const path of pathArray) {
			await watchPath(path);
		}
	};

	const unwatch = async (paths: string | readonly string[]): Promise<void> => {
		const pathArray = Array.isArray(paths) ? paths : [paths];
		for (const path of pathArray) {
			await unwatchPath(path);
		}
	};

	const getStats = () => {
		const eventsByType: Record<string, number> = {};
		for (const type of ["add", "change", "unlink", "addDir", "unlinkDir", "ready", "error"] as const) {
			eventsByType[type] = stats.eventsByType[type] ?? 0;
		}
		return {
			eventsByType: eventsByType as Record<WatchEventType, number>,
			totalEvents: stats.totalEvents,
			uptime: isActive ? Date.now() - startTime : 0,
			watchedPaths: watchedPaths.size,
		};
	};

	const isWatching = () => isActive;

	return {
		add,
		getStats,
		isWatching,
		off: emitter.off,
		on: emitter.on,
		once: emitter.once,
		start,
		stop,
		unwatch,
		// Advanced features
		getPerformanceStats: (): PerformanceStats => performanceMonitor.getStats(),
		getPerformanceRecommendations: () => performanceMonitor.getRecommendations(),
		onHotReload: (callback: (event: WatchEvent) => void | Promise<void>) => hotReloadService.onReload(callback),
		getAdvancedPatternMatcher: () => advancedPatternMatcher,
	};
};
