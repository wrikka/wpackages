export type SleepOptions = {
	readonly signal?: AbortSignal;
};

export const sleep = (ms: number, options: SleepOptions = {}): Promise<void> => {
	if (!Number.isFinite(ms) || ms < 0) {
		return Promise.reject(new RangeError("sleep: ms must be a non-negative finite number"));
	}

	const { signal } = options;
	if (signal?.aborted) {
		return Promise.reject(signal.reason ?? new Error("sleep: aborted"));
	}

	return new Promise<void>((resolve, reject) => {
		const id = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);

		const onAbort = (): void => {
			clearTimeout(id);
			reject(signal?.reason ?? new Error("sleep: aborted"));
		};

		signal?.addEventListener("abort", onAbort, { once: true });
	});
};
