import type { Effect } from "../types";
import type { Fiber, FiberId, FiberMetrics, FiberOptions, FiberPool } from "../types/fiber";

let fiberIdCounter = 0;
let fiberPool: FiberPool = {
	maxConcurrent: 100,
	running: new Set(),
	queued: [],
} as FiberPool;

export const createFiberId = (): FiberId => ({
	_tag: "FiberId",
	id: fiberIdCounter++,
});

export const createFiber = <A, E>(
	effect: Effect<A, E>,
	options: FiberOptions = {},
): Fiber<A, E> => {
	const id = createFiberId();
	const cancelToken = options.cancelToken || new AbortController().signal;

	return {
		id,
		status: "running",
		priority: options.priority || "medium",
		createdAt: Date.now(),
		cancelToken,
		children: [],
	};
};

export const runFiber = async <A, E>(
	fiber: Fiber<A, E>,
	effect: Effect<A, E>,
): Promise<A> => {
	if (fiber.cancelToken.aborted) {
		fiber.status = "cancelled";
		throw new Error("Fiber cancelled");
	}

	fiber.startedAt = Date.now();
	fiber.status = "running";
	fiberPool.running.add(fiber.id);

	try {
		const result = await effect();
		fiber.status = "completed";
		fiber.completedAt = Date.now();
		fiber.result = result;
		return result;
	} catch (error) {
		fiber.status = "failed";
		fiber.completedAt = Date.now();
		fiber.error = error as E;
		throw error;
	} finally {
		fiberPool.running.delete(fiber.id);
	}
};

export const cancelFiber = (fiber: Fiber<any, any>): void => {
	if (fiber.status === "running") {
		fiber.status = "cancelled";
		fiber.completedAt = Date.now();
		fiberPool.running.delete(fiber.id);
	}
};

export const fork = <A, E>(
	effect: Effect<A, E>,
	options?: FiberOptions,
): Effect<A, E> => {
	return async () => {
		const fiber = createFiber(effect, options);
		return await runFiber(fiber, effect);
	};
};

export const forkAll = <const Effects extends readonly Effect<any, any>[]>(
	effects: Effects,
	options?: FiberOptions,
): Effect<{
	[K in keyof Effects]: Effects[K] extends Effect<infer A, any> ? A : never;
}> => {
	return async () => {
		const results = await Promise.all(
			effects.map((effect) => fork(effect, options)()),
		);
		return results as any;
	};
};

export const setFiberPoolMaxConcurrent = (max: number): void => {
	fiberPool.maxConcurrent = max;
};

export const getFiberMetrics = (): FiberMetrics => {
	const allFibers = [...fiberPool.running, ...fiberPool.queued.map((q) => q.fiber)];
	const completedFibers = allFibers.filter((f) => f.status === "completed");
	const failedFibers = allFibers.filter((f) => f.status === "failed");
	const cancelledFibers = allFibers.filter((f) => f.status === "cancelled");

	const executionTimes = completedFibers
		.map((f) => (f.completedAt || 0) - (f.startedAt || f.createdAt))
		.filter((t) => t > 0);

	const averageExecutionTime =
		executionTimes.length > 0
			? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
			: 0;

	return {
		totalFibers: allFibers.length,
		runningFibers: fiberPool.running.size,
		queuedFibers: fiberPool.queued.length,
		completedFibers: completedFibers.length,
		failedFibers: failedFibers.length,
		cancelledFibers: cancelledFibers.length,
		averageExecutionTime,
	};
};

export const withPriority = <A, E>(
	effect: Effect<A, E>,
	priority: "high" | "medium" | "low",
): Effect<A, E> => {
	return fork(effect, { priority });
};

export const withTimeout = <A, E>(
	effect: Effect<A, E>,
	timeoutMs: number,
): Effect<A, E | { _tag: "TimeoutError"; message: string }> => {
	return fork(effect, { timeout: timeoutMs });
};

export const withCancellation = <A, E>(
	effect: Effect<A, E>,
	cancelToken: AbortSignal,
): Effect<A, E> => {
	return fork(effect, { cancelToken });
};
