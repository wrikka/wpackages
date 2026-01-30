/**
 * Concurrency configuration
 */

import type { DebounceOptions, RetryOptions, ThrottleOptions, TimeoutOptions } from "../types";

export interface ConcurrencyConfig {
	debounce: DebounceOptions;
	throttle: ThrottleOptions;
	retry: RetryOptions;
	timeout: TimeoutOptions;
}

export const defaultConcurrencyConfig: ConcurrencyConfig = {
	debounce: { delay: 300 },
	retry: { attempts: 3, delay: 1000 },
	throttle: { delay: 300 },
	timeout: { ms: 5000 },
};
