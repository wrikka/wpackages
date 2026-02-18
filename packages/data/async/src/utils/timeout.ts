import type { TimeoutOptions } from "../types";

export class TimeoutError extends Error {
	public override readonly name = "TimeoutError";

	constructor(message = "Operation timed out") {
		super(message);
	}
}

export const withTimeout = async <A>(
	promise: Promise<A>,
	ms: number,
	options: TimeoutOptions = {},
): Promise<A> => {
	if (!Number.isFinite(ms) || ms < 0) {
		throw new RangeError("withTimeout: ms must be a non-negative finite number");
	}

	const { message, signal } = options;

	if (signal?.aborted) {
		throw signal.reason ?? new Error("withTimeout: aborted");
	}

	let timer: ReturnType<typeof setTimeout> | undefined;
	let abortHandler: (() => void) | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			reject(new TimeoutError(message));
		}, ms);

		if (signal) {
			abortHandler = () => {
				if (timer) clearTimeout(timer);
				reject(signal.reason ?? new Error("withTimeout: aborted"));
			};
			signal.addEventListener("abort", abortHandler, { once: true });
		}
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		if (timer) clearTimeout(timer);
		if (abortHandler && signal) {
			signal.removeEventListener("abort", abortHandler);
		}
	}
};
