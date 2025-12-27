export type RateLimiterOptions = {
	maxRequests: number;
	interval: number; // milliseconds
};

export type RateLimiter = {
	wait: () => Promise<void>;
	getStats: () => {
		remaining: number;
		resetTime: number;
	};
	reset: () => void;
};
