export type ParallelOptions = {
	concurrency?: number;
	failFast?: boolean;
};

export type ParallelResult<T> = {
	success: boolean;
	value?: T;
	error?: Error;
};
