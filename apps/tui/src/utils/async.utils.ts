/**
 * Async Utilities (Pure Functions)
 * Async helpers and control flow
 */

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Debounce function
 */
export const debounce = <T extends (...args: readonly unknown[]) => unknown>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>): void => {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: readonly unknown[]) => unknown>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void => {
	let lastCall = 0;

	return (...args: Parameters<T>): void => {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			fn(...args);
		}
	};
};
