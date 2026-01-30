export interface WorkerPoolConfig {
	readonly maxWorkers: number;
	readonly idleTimeout: number;
}

export interface WorkerTask<A, E> {
	readonly id: string;
	readonly fn: () => Promise<A>;
	readonly resolve: (value: A) => void;
	readonly reject: (error: E) => void;
}

export interface ExtendedWorker extends Worker {
	id: string;
}

export class WorkerPool {
	private workers: ExtendedWorker[] = [];
	private queue: WorkerTask<any, any>[] = [];
	private activeTasks = new Map<string, WorkerTask<any, any>>();

	constructor(private config: WorkerPoolConfig) {}

	async initialize(): Promise<void> {
		for (let i = 0; i < this.config.maxWorkers; i++) {
			const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
				type: "module",
			}) as ExtendedWorker;
			worker.id = `worker-${i}`;
			this.workers.push(worker);
		}
	}

	async execute<A, E>(fn: () => Promise<A>): Promise<A> {
		return new Promise((resolve, reject) => {
			const task: WorkerTask<A, E> = {
				id: `task-${Date.now()}-${Math.random()}`,
				fn,
				resolve,
				reject,
			};

			this.queue.push(task);
			this.processQueue();
		});
	}

	private processQueue(): void {
		if (this.queue.length === 0) return;

		const availableWorker = this.workers.find((w) => !this.activeTasks.has(w.id));
		if (!availableWorker) return;

		const task = this.queue.shift();
		if (!task) return;

		this.activeTasks.set(availableWorker.id, task);

		availableWorker.postMessage({
			id: task.id,
			fn: task.fn.toString(),
		});

		availableWorker.onmessage = (event) => {
			if (event.data.id === task.id) {
				this.activeTasks.delete(availableWorker.id);
				task.resolve(event.data.result);
				this.processQueue();
			}
		};

		availableWorker.onerror = (error) => {
			this.activeTasks.delete(availableWorker.id);
			task.reject(error as any);
			this.processQueue();
		};
	}

	async dispose(): Promise<void> {
		for (const worker of this.workers) {
			worker.terminate();
		}
		this.workers = [];
		this.queue = [];
		this.activeTasks.clear();
	}
}

export const createWorkerPool = (config: WorkerPoolConfig): WorkerPool => {
	return new WorkerPool(config);
};
