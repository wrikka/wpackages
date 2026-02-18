export interface Schedule<out A> {
	readonly _tag: "Schedule";
	readonly _A: A;
}

export interface Interval {
	readonly start: number;
	readonly end: number;
}

export interface Recurs {
	readonly _tag: "Recurs";
	readonly n: number;
}

export interface Spaced {
	readonly _tag: "Spaced";
	readonly duration: number;
}

export interface Exponential {
	readonly _tag: "Exponential";
	readonly baseDelay: number;
	readonly factor: number;
}

export interface Composed {
	readonly _tag: "Composed";
	readonly schedule1: ScheduleType;
	readonly schedule2: ScheduleType;
}

export interface Cron {
	readonly _tag: "Cron";
	readonly pattern: string;
}

export type ScheduleType = Recurs | Spaced | Exponential | Composed | Cron;
