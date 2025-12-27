export type WatchEventType =
	| "add"
	| "change"
	| "unlink"
	| "addDir"
	| "unlinkDir"
	| "ready"
	| "error";

export type WatchEvent = {
	readonly type: WatchEventType;
	readonly path: string;
	readonly timestamp: number;
	readonly stats?: {
		readonly size: number;
		readonly mtime: number;
		readonly isFile: boolean;
		readonly isDirectory: boolean;
	};
};

export type WatchError = {
	readonly code: string;
	readonly message: string;
	readonly path?: string;
	readonly cause?: unknown;
};

export type WatchHandler = (event: WatchEvent) => void | Promise<void>;
export type ErrorHandler = (error: WatchError) => void | Promise<void>;

export type WatchFilter = (path: string) => boolean;

export type WatchStats = {
	readonly totalEvents: number;
	readonly eventsByType: Record<WatchEventType, number>;
	readonly watchedPaths: number;
	readonly uptime: number;
	readonly lastEvent?: WatchEvent;
};
