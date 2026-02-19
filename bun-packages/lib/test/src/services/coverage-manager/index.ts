import { CoverageManager } from "./manager";
import type { CoverageConfig } from "./types";

export function createCoverageManager(cwd: string, config?: Partial<CoverageConfig>): CoverageManager {
	return new CoverageManager(cwd, config);
}

export { CoverageManager };
export * from "./types";
