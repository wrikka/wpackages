import type { FSWatcher } from "node:fs";

export interface HMRConfig {
	enabled: boolean;
	debounceMs: number;
	ignorePatterns: string[];
	extensions: string[];
	hotModules: Set<string>;
	concurrency: number;
}

export interface HMRUpdate {
	type: "test" | "module" | "config";
	filePath: string;
	affectedTests: string[];
	changes: string[];
}

export interface HotModule {
	id: string;
	accepts: string[];
	disposes: (() => void)[];
}

export type WatcherMap = Map<string, FSWatcher>;
