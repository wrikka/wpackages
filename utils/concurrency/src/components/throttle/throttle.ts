/**
 * throttle - Limit function execution to once per time period
 *
 * @param fn - Function to throttle
 * @param ms - Milliseconds to wait between calls
 * @returns Throttled function
 */
export const throttle = <T extends readonly unknown[]>(
	fn: (...args: T) => void,
	ms: number,
): (...args: T) => Promise<void> => {
	let lastRun = 0;
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args: T) => {
		return new Promise((resolve) => {
			const now = Date.now();
			const timeSinceLastRun = now - lastRun;

			if (timeSinceLastRun >= ms) {
				fn(...args);
				lastRun = now;
				resolve();
			} else {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				timeoutId = setTimeout(() => {
					fn(...args);
					lastRun = Date.now();
					resolve();
				}, ms - timeSinceLastRun);
			}
		});
	};
};
