import type { WatchOptions as ChokidarWatchOptions } from "chokidar";

export type CacheConfig = {
	readonly ttl?: number | undefined;
	readonly enabled?: boolean | undefined;
};

import type { WdevOptions } from "./wdev";

export type DevServerConfig = {
	readonly plugins?: WdevOptions<object>;
	readonly root?: string;
	readonly port?: number;
	readonly hostname?: string;
	readonly watch?: Partial<ChokidarWatchOptions>;
	readonly cache?: Partial<CacheConfig>;
	readonly server?: {
		readonly middleware?: Array<(req: Request, res: Response, next: () => Promise<void>) => Promise<void>>;
	};
};

export type ServerStats = {
	readonly performance: {
		readonly startTime: number;
		readonly totalReloads: number;
		readonly totalFileEvents: number;
		readonly averageReloadTime: number;
		readonly maxReloadTime: number;
		readonly minReloadTime: number;
		readonly watchedFiles: number;
	};
	readonly watcher: { readonly active: boolean } | null;
	readonly cache: { readonly active: boolean } | null;
	readonly vite: { readonly status: "running" | "stopped" } | null;
	readonly server: { readonly status: "running" | "stopped" } | null;
};

export type DevServerInstance = {
	readonly start: () => Promise<void>;
	readonly stop: () => Promise<void>;
	readonly onReload: (callback: () => void | Promise<void>) => void;
	readonly getStats: () => ServerStats;
	readonly getPerformanceStats: () => {
		readonly startTime: number;
		readonly totalReloads: number;
		readonly totalFileEvents: number;
		readonly averageReloadTime: number;
		readonly maxReloadTime: number;
		readonly minReloadTime: number;
		readonly watchedFiles: number;
	};
	readonly getRecommendations: () => string[];
};
