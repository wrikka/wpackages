export const createDebouncer = <T extends (...args: any[]) => any>(
	fn: T,
	delayMs: number,
): (...args: Parameters<T>) => void => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args: Parameters<T>) => {
		if (timeoutId !== undefined) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			fn(...args);
			timeoutId = undefined;
		}, delayMs);
	};
};

export const createThrottler = <
	T extends (...args: readonly unknown[]) => void,
>(
	fn: T,
	delayMs: number,
): (...args: Parameters<T>) => void => {
	let lastCall = 0;

	return (...args: Parameters<T>) => {
		const now = Date.now();
		if (now - lastCall >= delayMs) {
			lastCall = now;
			fn(...args);
		}
	};
};
