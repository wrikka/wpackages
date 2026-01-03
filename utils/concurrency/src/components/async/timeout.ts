/**
 * timeout - Add timeout to promise
 *
 * @param promise - Promise to add timeout to
 * @param ms - Timeout in milliseconds
 * @returns Promise that rejects on timeout
 */
export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)),
	]);
};
