import type { WorkerPool } from "../core/worker-pool";
import { HotModuleReplacement } from "./core";
import type { HMRConfig } from "./types";

// Global HMR instance
let globalHMR: HotModuleReplacement | undefined;

export function createHMR(workerPool: WorkerPool, config?: Partial<HMRConfig>): HotModuleReplacement {
	if (!globalHMR) {
		globalHMR = new HotModuleReplacement(workerPool, config);
	}
	return globalHMR;
}

export function getHMR(): HotModuleReplacement {
	if (!globalHMR) {
		throw new Error("HMR not initialized. Call createHMR() first.");
	}
	return globalHMR;
}

export function hot(moduleId: string): {
	accept: (callback?: () => void) => void;
	dispose: (callback: () => void) => void;
} {
	const hmr = getHMR();

	return {
		accept: (callback?: () => void) => hmr.accept(moduleId, callback),
		dispose: (callback: () => void) => hmr.dispose(moduleId, callback),
	};
}

export { HotModuleReplacement };
export * from "./types";
