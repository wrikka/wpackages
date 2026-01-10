export type WorkerTask<T = any> = {
	id: string;
	fn: () => Promise<T>;
};

export type WorkerPoolOptions = {
	maxWorkers?: number;
	idleTimeout?: number; // milliseconds
};

export type WorkerPool = {
	submit: <R>(fn: () => Promise<R>) => Promise<R>;
	submitBatch: <R>(fns: Array<() => Promise<R>>) => Promise<R[]>;
	getStats: () => {
		activeWorkers: number;
		pendingTasks: number;
		completedTasks: number;
	};
	terminate: () => Promise<void>;
};
