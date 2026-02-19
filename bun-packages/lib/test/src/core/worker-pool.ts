import { EventEmitter } from "node:events";
import os from "node:os";

interface WorkerTask {
	id: string;
	file: string;
	options: WorkerOptions;
	resolve: (result: WorkerResult) => void;
	reject: (error: Error) => void;
	timeout?: NodeJS.Timeout;
}

interface WorkerOptions {
	testNamePattern?: string;
	shard?: string;
	timeout?: number;
	retries?: number;
	coverage?: boolean;
	updateSnapshots?: boolean;
	preloadFiles?: string[];
	env?: Record<string, string | undefined>;
}

interface WorkerResult {
	id: string;
	file: string;
	results: any;
	duration: number;
	coverage?: any;
}

interface WorkerPoolConfig {
	maxWorkers?: number;
	runtimeSetupPath: string;
	runTestScriptPath: string;
	cwd: string;
}

class WorkerPool extends EventEmitter {
	private taskQueue: WorkerTask[] = [];
	private maxWorkers: number;
	private running = 0;
	private shuttingDown = false;
	private runtimeSetupPath: string;
	private runTestScriptPath: string;
	private cwd: string;

	constructor(config: WorkerPoolConfig) {
		super();
		this.maxWorkers = config.maxWorkers ?? Math.max(1, Math.min(os.cpus().length, 8));
		this.runtimeSetupPath = config.runtimeSetupPath;
		this.runTestScriptPath = config.runTestScriptPath;
		this.cwd = config.cwd;
	}

	private processQueue(): void {
		while (!this.shuttingDown && this.running < this.maxWorkers && this.taskQueue.length > 0) {
			const task = this.taskQueue.shift();
			if (!task) return;
			void this.executeTask(task);
		}
	}

	private async executeTask(task: WorkerTask): Promise<void> {
		this.running++;
		this.emit("taskStart", task.id, task.file);

		try {
			const cmd: string[] = ["bun"];

			if (task.options.coverage) {
				cmd.push("--coverage");
			}

			if (task.options.preloadFiles) {
				for (const preloadFile of task.options.preloadFiles) {
					cmd.push("--preload", preloadFile);
				}
			}

			cmd.push("--preload", this.runtimeSetupPath, this.runTestScriptPath, task.file);

			if (task.options.testNamePattern) {
				cmd.push("--testNamePattern", task.options.testNamePattern);
			}
			if (task.options.shard) {
				cmd.push("--shard", task.options.shard);
			}
			if (typeof task.options.retries === "number") {
				cmd.push("--retries", String(task.options.retries));
			}
			if (task.options.updateSnapshots) {
				cmd.push("--update-snapshots");
			}
			const worker = task.options.env
				? Bun.spawn({ cmd, stdout: "pipe", stderr: "pipe", cwd: this.cwd, env: task.options.env })
				: Bun.spawn({ cmd, stdout: "pipe", stderr: "pipe", cwd: this.cwd });
			const stdout = await Bun.readableStreamToText(worker.stdout);
			const stderr = await Bun.readableStreamToText(worker.stderr);
			const exitCode = await worker.exited;

			if (exitCode !== 0) {
				const error = new Error(
					`Test worker for ${task.file} exited with code ${exitCode}${stderr.trim() ? `\n${stderr}` : ""}`,
				);
				task.reject(error);
				return;
			}

			const marker = "__WTEST_RESULT__";
			const markerIndex = stdout.lastIndexOf(marker);
			const jsonText = markerIndex >= 0 ? stdout.slice(markerIndex + marker.length).trim() : stdout.trim();
			const parsed = JSON.parse(jsonText);

			task.resolve({
				id: task.id,
				file: task.file,
				results: parsed.results,
				duration: parsed.durationMs ?? 0,
				coverage: parsed.coverage,
			});
		} catch (error: any) {
			task.reject(error instanceof Error ? error : new Error(String(error)));
		} finally {
			this.running--;
			this.emit("taskEnd", task.id, task.file);
			this.processQueue();
		}
	}

	public runTest(file: string, options: WorkerOptions): Promise<WorkerResult> {
		return new Promise((resolve, reject) => {
			const task: WorkerTask = {
				id: Math.random().toString(36).slice(2, 11),
				file,
				options,
				resolve,
				reject,
			};

			if (this.shuttingDown) {
				reject(new Error("Worker pool is shutting down"));
				return;
			}

			this.taskQueue.push(task);
			this.processQueue();
		});
	}

	public getStats(): {
		totalWorkers: number;
		busyWorkers: number;
		queuedTasks: number;
	} {
		return {
			totalWorkers: this.maxWorkers,
			busyWorkers: this.running,
			queuedTasks: this.taskQueue.length,
		};
	}

	public async shutdown(): Promise<void> {
		this.shuttingDown = true;

		// Cancel all pending tasks
		for (const task of this.taskQueue) {
			if (task.timeout) {
				clearTimeout(task.timeout);
			}
			task.reject(new Error("Worker pool is shutting down"));
		}
		this.taskQueue.length = 0;

		// In-process concurrency limiter: nothing to kill here.
	}

	public setMaxWorkers(maxWorkers: number): void {
		this.maxWorkers = Math.max(1, maxWorkers);
		this.processQueue();
	}
}

export { type WorkerOptions, WorkerPool, type WorkerPoolConfig, type WorkerResult, type WorkerTask };
