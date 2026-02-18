import type { AsyncTask, AsyncTaskResult, QueueOptions } from "../types";
import { defer } from "./defer";

type QueueItem<A> = {
	task: AsyncTask<A>;
	resolve: (result: AsyncTaskResult<A>) => void;
};

export class AsyncQueue<A> {
	private readonly concurrency: number;
	private readonly items: QueueItem<A>[] = [];
	private active = 0;
	private readonly signal?: AbortSignal;

	constructor(options: QueueOptions<A> = {}) {
		this.concurrency = options.concurrency ?? Number.POSITIVE_INFINITY;
		this.signal = options.signal;
	}

	enqueue(task: AsyncTask<A>): Promise<AsyncTaskResult<A>> {
		const { promise, resolve } = defer<AsyncTaskResult<A>>();

		this.items.push({ task, resolve });
		this.items.sort((a, b) => (b.task.priority ?? 0) - (a.task.priority ?? 0));

		this.process();
		return promise;
	}

	private async process(): Promise<void> {
		if (this.signal?.aborted) {
			return;
		}

		while (this.active < this.concurrency && this.items.length > 0) {
			const item = this.items.shift();
			if (!item) break;

			this.active++;

			try {
				const value = await item.task.run();
				item.resolve({ success: true, value });
			} catch (error) {
				item.resolve({ success: false, error });
			} finally {
				this.active--;
				this.process();
			}
		}
	}

	get size(): number {
		return this.items.length;
	}

	get pending(): number {
		return this.active;
	}
}

export const createQueue = <A>(options?: QueueOptions<A>): AsyncQueue<A> => {
	return new AsyncQueue<A>(options);
};
