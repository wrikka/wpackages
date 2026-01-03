import { Effect } from "effect";
import { TimeoutError } from "../types/error";

/**
 * Delay helper using Effect.sleep
 */
export const sleep = (ms: number) => Effect.sleep(ms);

/**
 * Execute an Effect with a timeout.
 */
export const withTimeout = <A, E>(effect: Effect.Effect<A, E>, timeout: number) =>
	Effect.timeoutFail(effect, {
		duration: timeout,
		onTimeout: () => new TimeoutError({ after: timeout }),
	});
