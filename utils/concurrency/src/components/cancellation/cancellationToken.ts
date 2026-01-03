import type { CancellationToken, CancellationTokenSource } from "./types";

export const createCancellationTokenSource = (): CancellationTokenSource => {
	let cancelled = false;
	const callbacks: Array<() => void> = [];

	const token: CancellationToken = {
		isCancelled: () => cancelled,

		throwIfCancelled: () => {
			if (cancelled) {
				throw new Error("Operation was cancelled");
			}
		},

		onCancelled: (callback: () => void) => {
			if (cancelled) {
				callback();
			} else {
				callbacks.push(callback);
			}
		},
	};

	const cancel = () => {
		if (!cancelled) {
			cancelled = true;
			for (const callback of callbacks) {
				try {
					callback();
				} catch (error) {
					console.error("Error in cancellation callback:", error);
				}
			}
			callbacks.length = 0;
		}
	};

	return {
		token,
		cancel,
	};
};

export const withCancellation = <T>(
	promise: Promise<T>,
	token: CancellationToken,
): Promise<T> => {
	return new Promise<T>((resolve, reject) => {
		// Check if already cancelled
		token.throwIfCancelled();

		// Set up cancellation listener
		token.onCancelled(() => {
			reject(new Error("Operation was cancelled"));
		});

		// Handle the original promise
		promise.then(resolve).catch(reject);
	});
};
