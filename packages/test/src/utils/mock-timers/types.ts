export interface TimerState {
	now: number;
	timers: Map<number, Timer>;
	nextId: number;
	originalDate: typeof Date;
	originalSetTimeout: typeof setTimeout;
	originalClearTimeout: typeof clearTimeout;
	originalSetInterval: typeof setInterval;
	originalClearInterval: typeof clearInterval;
}

export interface Timer {
	id: number;
	type: "timeout" | "interval";
	callback: () => void;
	delay: number;
	createdAt: number;
	executedAt?: number;
	interval?: boolean;
}
