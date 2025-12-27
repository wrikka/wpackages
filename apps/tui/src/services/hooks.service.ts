/**
 * Hooks Service - Effect Handler
 * Execute lifecycle hooks
 */

import type { HookContext, HooksDef } from "../types";

// Simple Result type
type ResultType<E, A> = { _tag: "Success"; value: A } | { _tag: "Failure"; error: E };

/**
 * Execute beforeAll hook
 */
export const executeBeforeAll = async (
	hooks: HooksDef | undefined,
	context: HookContext,
): Promise<ResultType<string, void>> => {
	if (!hooks?.beforeAll) {
		return { _tag: "Success", value: undefined };
	}

	try {
		return await hooks.beforeAll(context);
	} catch (error) {
		return { _tag: "Failure", error: `beforeAll hook error: ${error}` };
	}
};

/**
 * Execute beforeEach hook
 */
export const executeBeforeEach = async (
	hooks: HooksDef | undefined,
	context: HookContext,
): Promise<ResultType<string, void>> => {
	if (!hooks?.beforeEach) {
		return { _tag: "Success", value: undefined };
	}

	try {
		return await hooks.beforeEach(context);
	} catch (error) {
		return { _tag: "Failure", error: `beforeEach hook error: ${error}` };
	}
};

/**
 * Execute afterEach hook
 */
export const executeAfterEach = async (
	hooks: HooksDef | undefined,
	context: HookContext,
): Promise<ResultType<string, void>> => {
	if (!hooks?.afterEach) {
		return { _tag: "Success", value: undefined };
	}

	try {
		return await hooks.afterEach(context);
	} catch (error) {
		return { _tag: "Failure", error: `afterEach hook error: ${error}` };
	}
};

/**
 * Execute afterAll hook
 */
export const executeAfterAll = async (
	hooks: HooksDef | undefined,
	context: HookContext,
): Promise<ResultType<string, void>> => {
	if (!hooks?.afterAll) {
		return { _tag: "Success", value: undefined };
	}

	try {
		return await hooks.afterAll(context);
	} catch (error) {
		return { _tag: "Failure", error: `afterAll hook error: ${error}` };
	}
};

/**
 * Execute onError hook
 */
export const executeOnError = async (
	hooks: HooksDef | undefined,
	error: unknown,
	context: HookContext,
): Promise<void> => {
	if (!hooks?.onError) {
		return;
	}

	try {
		await hooks.onError(error, context);
	} catch (hookError) {
		console.error("Error in onError hook:", hookError);
	}
};
