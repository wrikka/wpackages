import type { WorkerMessage, WorkerResponse } from "./worker";

export interface WorkerPoolConfig {
	readonly maxWorkers: number;
	readonly idleTimeout?: number;
	readonly healthCheckInterval?: number;
	readonly maxRestarts?: number;
}

export interface WorkerState {
	id: string;
	worker: Worker;
	isHealthy: boolean;
	lastPing: number;
	restartCount: number;
}

export interface RPCTask<A, E> {
	readonly id: string;
	readonly handler: string;
	readonly data: unknown;
	readonly resolve: (value: A) => void;
	readonly reject: (error: E) => void;
	readonly timeout?: number;
}

export class WorkerPool {
	private workers: WorkerState[] = [];
	private queue: RPCTask<any, any>[] = [];
	private activeTasks = new Map<string, { workerId: string; task: RPCTask<any, any>; timeoutId: ReturnType<typeof setTimeout> }>();
	private healthCheckTimer?: ReturnType<typeof setInterval>;

	constructor(private config: WorkerPoolConfig) { }

	async initialize(): Promise<void> {
		const { maxWorkers = 4, healthCheckInterval = 30000 } = this.config;

		for (let i = 0; i < maxWorkers; i++) {
			await this.createWorker(i);
		}

		this.startHealthCheck(healthCheckInterval);
	}

	private async createWorker(index: number): Promise<WorkerState> {
		const worker = new Worker(new URL("./worker.ts", import.meta.url).href, {
			type: "module",
		});

		const state: WorkerState = {
			id: `worker-${index}`,
			worker,
			isHealthy: true,
			lastPing: Date.now(),
			restartCount: 0,
		};

		worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
			this.handleWorkerMessage(state, event.data);
		};

		worker.onerror = (error) => {
			this.handleWorkerError(state, error);
		};

		this.workers.push(state);
		return state;
	}

	private handleWorkerMessage(state: WorkerState, response: WorkerResponse): void {
		if (response.type === "pong") {
			state.isHealthy = true;
			state.lastPing = Date.now();
			return;
		}

		const active = this.activeTasks.get(response.id);
		if (!active) return;

		clearTimeout(active.timeoutId);
		this.activeTasks.delete(response.id);

		if (response.type === "success") {
			active.task.resolve(response.result);
		} else {
			active.task.reject(new Error(response.error || "Unknown worker error"));
		}

		this.processQueue();
	}

	private handleWorkerError(state: WorkerState, error: ErrorEvent): void {
		console.error(`Worker ${state.id} error:`, error);
		state.isHealthy = false;
		this.restartWorker(state);
	}

	private async restartWorker(state: WorkerState): Promise<void> {
		const { maxRestarts = 3 } = this.config;

		if (state.restartCount >= maxRestarts) {
			console.error(`Worker ${state.id} exceeded max restarts (${maxRestarts}), removing from pool`);
			this.workers = this.workers.filter((w) => w.id !== state.id);
			state.worker.terminate();
			return;
		}

		console.log(`Restarting worker ${state.id} (restart ${state.restartCount + 1}/${maxRestarts})`);

		const index = this.workers.findIndex((w) => w.id === state.id);
		state.worker.terminate();

		const newState = await this.createWorker(index);
		newState.restartCount = state.restartCount + 1;
		this.workers[index] = newState;
	}

	private startHealthCheck(interval: number): void {
		this.healthCheckTimer = setInterval(() => {
			const now = Date.now();
			const timeout = (this.config.healthCheckInterval || 30000) * 2;

			for (const state of this.workers) {
				if (now - state.lastPing > timeout) {
					console.warn(`Worker ${state.id} health check failed`);
					state.isHealthy = false;
					this.restartWorker(state);
				} else {
					const message: WorkerMessage = {
						id: `ping-${Date.now()}-${Math.random()}`,
						type: "ping",
					};
					state.worker.postMessage(message);
				}
			}
		}, interval);
	}

	async execute<A, E>(handler: string, data?: unknown, timeout?: number): Promise<A> {
		return new Promise((resolve, reject) => {
			const task: RPCTask<A, E> = {
				id: `task-${Date.now()}-${Math.random()}`,
				handler,
				data,
				resolve,
				reject,
				timeout,
			};

			this.queue.push(task);
			this.processQueue();
		});
	}

	private processQueue(): void {
		if (this.queue.length === 0) return;

		const availableWorker = this.workers.find((w) => w.isHealthy && !this.isWorkerBusy(w.id));
		if (!availableWorker) return;

		const task = this.queue.shift();
		if (!task) return;

		const timeoutMs = task.timeout || 30000;
		const timeoutId = setTimeout(() => {
			this.activeTasks.delete(task.id);
			task.reject(new Error(`Task ${task.id} timed out after ${timeoutMs}ms`));
			this.restartWorker(availableWorker);
		}, timeoutMs);

		this.activeTasks.set(task.id, { workerId: availableWorker.id, task, timeoutId });

		const message: WorkerMessage = {
			id: task.id,
			type: "rpc",
			handler: task.handler,
			data: task.data,
		};

		availableWorker.worker.postMessage(message);
	}

	private isWorkerBusy(workerId: string): boolean {
		for (const active of Array.from(this.activeTasks.values())) {
			if (active.workerId === workerId) return true;
		}
		return false;
	}

	getStats() {
		return {
			workers: this.workers.length,
			healthyWorkers: this.workers.filter((w) => w.isHealthy).length,
			queued: this.queue.length,
			active: this.activeTasks.size,
		};
	}

	async dispose(): Promise<void> {
		if (this.healthCheckTimer) {
			clearInterval(this.healthCheckTimer);
		}

		for (const [, active] of Array.from(this.activeTasks.entries())) {
			clearTimeout(active.timeoutId);
		}
		this.activeTasks.clear();

		for (const state of this.workers) {
			state.worker.terminate();
		}
		this.workers = [];
		this.queue = [];
	}
}

export const createWorkerPool = (config: WorkerPoolConfig): WorkerPool => {
	return new WorkerPool(config);
};
