/**
 * Timeout types
 */

import type { TimeoutError } from "../errors";

export type TimeoutConfig = {
	readonly duration: number;
	readonly signal?: AbortSignal | undefined;
	readonly onTimeout?: (() => void) | undefined;
};

export type TimeoutResult<T> =
	| { readonly success: true; readonly value: T; readonly duration: number }
	| {
		readonly success: false;
		readonly error: TimeoutError;
		readonly duration: number;
	};

export type TimeoutStrategy = "abort" | "reject" | "cancel";

export type TimeoutOptions = {
	readonly duration: number;
	readonly strategy?: TimeoutStrategy;
	readonly cleanup?: () => void | Promise<void>;
	readonly onTimeout?: () => void;
};
