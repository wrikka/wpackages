export class TimeoutError extends Error {
	public override readonly name = "TimeoutError";

	constructor(message = "Operation timed out") {
		super(message);
	}
}

export type WithTimeoutOptions = {
	readonly message?: string;
};

export const withTimeout = async <T>(
	promise: Promise<T>,
	ms: number,
	options: WithTimeoutOptions = {},
): Promise<T> => {
	if (!Number.isFinite(ms) || ms < 0) {
		throw new RangeError("withTimeout: ms must be a non-negative finite number");
	}

	let timer: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			reject(new TimeoutError(options.message));
		}, ms);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		if (timer) clearTimeout(timer);
	}
};
