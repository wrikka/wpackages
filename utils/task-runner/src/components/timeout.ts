/**
 * Setup timeout for a process
 */
export const setupTimeout = (
	timeout: number | undefined,
	onTimeout: () => void,
): NodeJS.Timeout | undefined => {
	if (!timeout) {
		return undefined;
	}

	return setTimeout(() => {
		onTimeout();
	}, timeout);
};

/**
 * Clear timeout if exists
 */
export const clearTimeoutIfExists = (timeoutId: NodeJS.Timeout | undefined): void => {
	if (timeoutId) {
		clearTimeout(timeoutId);
	}
};

/**
 * Check if timeout occurred
 */
export const isTimeout = (timedOut: boolean): boolean => timedOut === true;
