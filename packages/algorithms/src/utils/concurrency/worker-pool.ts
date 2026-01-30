export interface WorkerTask<TInput, TOutput> {
	input: TInput;
	resolve: (value: TOutput) => void;
	reject: (reason?: unknown) => void;
}

export interface WorkerPoolOptions {
	maxWorkers?: number;
	taskTimeout?: number;
}

export class WorkerPool<TInput, TOutput> {
	private workers: Worker[];
	private taskQueue: WorkerTask<TInput, TOutput>[] = [];
	private activeWorkers = 0;
	private maxWorkers: number;
	private taskTimeout: number;

	constructor(workerScript: string | URL, options: WorkerPoolOptions = {}) {
		this.maxWorkers = options.maxWorkers || navigator.hardwareConcurrency || 4;
		this.taskTimeout = options.taskTimeout || 30000;

		this.workers = Array.from({ length: this.maxWorkers }, () => new Worker(workerScript));

		this.workers.forEach((worker) => {
			worker.onmessage = (event) => this.handleWorkerMessage(worker, event.data);
			worker.onerror = (error) => this.handleWorkerError(error);
		});
	}

	async execute(input: TInput): Promise<TOutput> {
		return new Promise((resolve, reject) => {
			const task: WorkerTask<TInput, TOutput> = {
				input,
				resolve,
				reject,
			};

			this.taskQueue.push(task);
			this.processQueue();
		});
	}

	async executeAll(inputs: TInput[]): Promise<TOutput[]> {
		return Promise.all(inputs.map((input) => this.execute(input)));
	}

	private processQueue(): void {
		while (this.taskQueue.length > 0 && this.activeWorkers < this.maxWorkers) {
			const task = this.taskQueue.shift();
			if (!task) break;

			const worker = this.workers[this.activeWorkers]!;
			this.activeWorkers++;

			worker.postMessage(task.input);

			const timeout = setTimeout(() => {
				task.reject(new Error("Task timeout"));
				this.activeWorkers--;
				this.processQueue();
			}, this.taskTimeout);

			(worker as any)._currentTimeout = timeout;
		}
	}

	private handleWorkerMessage(worker: Worker, result: TOutput): void {
		const timeout = (worker as any)._currentTimeout;
		if (timeout) clearTimeout(timeout);

		const task = this.taskQueue.shift();
		if (task) {
			task.resolve(result);
		}

		this.activeWorkers--;
		this.processQueue();
	}

	private handleWorkerError(error: ErrorEvent): void {
		const task = this.taskQueue.shift();
		if (task) {
			task.reject(error.error);
		}

		this.activeWorkers--;
		this.processQueue();
	}

	terminate(): void {
		this.workers.forEach((worker) => worker.terminate());
		this.taskQueue = [];
		this.activeWorkers = 0;
	}
}
