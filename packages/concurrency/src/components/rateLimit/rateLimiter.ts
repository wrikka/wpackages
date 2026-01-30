import type { RateLimiter, RateLimiterOptions } from "./types";

export const createRateLimiter = (_options: RateLimiterOptions): RateLimiter => {
	const { maxRequests, interval } = _options;

	let requests = 0;
	let resetTime = Date.now() + interval;
	const queue: Array<() => void> = [];

	const processQueue = () => {
		const now = Date.now();

		// Reset if interval has passed
		if (now >= resetTime) {
			requests = 0;
			resetTime = now + interval;
		}

		// Process queued requests if we have capacity
		while (queue.length > 0 && requests < maxRequests) {
			const next = queue.shift();
			if (next) {
				requests++;
				next();
			}
		}
	};

	// Set up interval to process queue periodically
	const intervalId = setInterval(processQueue, 10);

	const wait = (): Promise<void> => {
		return new Promise((resolve) => {
			const now = Date.now();

			// Reset if interval has passed
			if (now >= resetTime) {
				requests = 0;
				resetTime = now + interval;
			}

			if (requests < maxRequests) {
				requests++;
				resolve();
			} else {
				queue.push(() => resolve());
			}
		});
	};

	const getStats = () => ({
		remaining: Math.max(0, maxRequests - requests),
		resetTime,
	});

	const reset = () => {
		requests = 0;
		resetTime = Date.now() + interval;
	};

	// Clean up interval on process exit
	const cleanup = () => {
		clearInterval(intervalId);
	};

	// Add cleanup to process exit events
	if (typeof process !== "undefined") {
		process.on("exit", cleanup);
	}

	return {
		wait,
		getStats,
		reset,
	};
};
