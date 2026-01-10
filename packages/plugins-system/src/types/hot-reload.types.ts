export type HotReloadStrategy = "watch" | "poll" | "manual";

export type HotReloadState = "idle" | "watching" | "reloading" | "error";

export interface HotReloadOptions {
	readonly strategy: HotReloadStrategy;
	readonly debounceMs?: number;
	readonly preserveState?: boolean;
	readonly rollbackOnError?: boolean;
	readonly watchPaths?: readonly string[];
	readonly ignorePatterns?: readonly string[];
}

export interface HotReloadEvent {
	readonly type: "hot-reload:start" | "hot-reload:success" | "hot-reload:error" | "hot-reload:rollback";
	readonly pluginId: string;
	readonly timestamp: Date;
	readonly filePath?: string;
	readonly error?: Error;
}

export interface HotReloadResult {
	readonly success: boolean;
	readonly pluginId: string;
	readonly reloadedAt: Date;
	readonly error?: Error;
	readonly rolledBack?: boolean;
}

export interface HotReloadManager {
	readonly start: () => Promise<void>;
	readonly stop: () => Promise<void>;
	 readonly reloadPlugin: (pluginId: string) => Promise<HotReloadResult>;
	readonly getState: () => HotReloadState;
	readonly isWatching: () => boolean;
}
