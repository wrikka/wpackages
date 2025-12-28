export type ParallelOptions = {
	concurrency?: number;
	failFast?: boolean;
};

export type ParallelResult<T> =
	| {
			success: true;
			value: T;
	}
	| {
			success: false;
			error: Error;
	};
