import { AsyncLocalStorage } from "node:async_hooks";
import { getBaggage, getSpan, ROOT_CONTEXT, setBaggage, setSpan } from "../models/context";
import type { Context } from "../types/tracing";
import type { Baggage } from "../models/baggage";
import type { Span } from "../types/tracing";

const contextStore = new AsyncLocalStorage<Context>();

/**
 * Returns the currently active context.
 * If no context is active, the ROOT_CONTEXT is returned.
 */
export function getActiveContext(): Context {
	return contextStore.getStore() ?? ROOT_CONTEXT;
}

/**
 * Runs a given function within a specific context.
 */
export function withActiveContext<T>(context: Context, fn: () => T): T {
	return contextStore.run(context, fn);
}

/**
 * Returns the currently active span from the active context.
 */
export function getActiveSpan(): Span | undefined {
	return getSpan(getActiveContext());
}

/**
 * Runs a given function with a specified span set as the active span in the context.
 */
export function withActiveSpan<T>(span: Span, fn: () => T): T {
	const context = setSpan(getActiveContext(), span);
	return withActiveContext(context, fn);
}

/**
 * Returns the currently active baggage from the active context.
 */
export function getActiveBaggage(): Baggage | undefined {
	return getBaggage(getActiveContext());
}

/**
 * Runs a given function with specified baggage set as the active baggage in the context.
 */
export function withActiveBaggage<T>(baggage: Baggage, fn: () => T): T {
	const context = setBaggage(getActiveContext(), baggage);
	return withActiveContext(context, fn);
}
