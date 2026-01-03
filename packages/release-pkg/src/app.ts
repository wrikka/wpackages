/**
 * Application composition layer
 * Combines all services, utilities, and components
 */

import { release } from "./services/release.service";
import type { ReleaseOptions, ReleaseResult } from "./types/index";

/**
 * Create release application instance
 */
export const createReleaseApp = () => {
	return {
		/**
		 * Execute release
		 */
		async release(options?: Partial<ReleaseOptions>): Promise<ReleaseResult> {
			return release(options);
		},
	};
};

/**
 * Application type
 */
export type ReleaseApp = ReturnType<typeof createReleaseApp>;
