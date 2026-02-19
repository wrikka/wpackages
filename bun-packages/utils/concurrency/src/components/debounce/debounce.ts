/**
 * debounce - Delay function execution until after wait time
 *
 * @param fn - Function to debounce
 * @param ms - Milliseconds to wait
 * @returns Debounced function
 */
export const debounce = <T extends readonly unknown[]>(
	fn: (...args: T) => void,
	ms: number,
): (...args: T) => Promise<void> => {
	let timer: ReturnType<typeof setTimeout> | undefined;

	return (...args: T) => {
		return new Promise((resolve) => {
			if (timer) {
				clearTimeout(timer);
			}

			timer = setTimeout(() => {
				fn(...args);
				resolve();
			}, ms);
		});
	};
};
