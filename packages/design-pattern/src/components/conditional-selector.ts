/**
 * Conditional Selector Component
 * Pure function for selecting based on conditions
 * Eliminates duplication across factory, strategy, and other patterns
 */

/**
 * Select from options based on condition matching
 * @template T - Input type
 * @template R - Result type
 * @param input - Input value to match
 * @param options - Array of condition-result pairs
 * @param defaultResult - Default result if no condition matches
 * @returns Result from matching condition or default
 */
export const selectByCondition = <T, R>(
	input: T,
	options: ReadonlyArray<{
		readonly condition: (input: T) => boolean;
		readonly result: R;
	}>,
	defaultResult: R,
): R => {
	const matched = options.find((opt) => opt.condition(input));
	return matched ? matched.result : defaultResult;
};

/**
 * Select from options based on condition matching (with function results)
 * @template T - Input type
 * @template R - Result type
 * @param input - Input value to match
 * @param options - Array of condition-function pairs
 * @param defaultFn - Default function if no condition matches
 * @returns Result from executing matching function or default
 */
export const selectFunctionByCondition = <T, R>(
	input: T,
	options: ReadonlyArray<{
		readonly condition: (input: T) => boolean;
		readonly fn: (input: T) => R;
	}>,
	defaultFn: (input: T) => R,
): R => {
	const matched = options.find((opt) => opt.condition(input));
	return matched ? matched.fn(input) : defaultFn(input);
};

/**
 * Create a selector function from options
 * @template T - Input type
 * @template R - Result type
 * @param options - Array of condition-result pairs
 * @param defaultResult - Default result if no condition matches
 * @returns Selector function
 */
export const createSelector = <T, R>(
	options: ReadonlyArray<{
		readonly condition: (input: T) => boolean;
		readonly result: R;
	}>,
	defaultResult: R,
): (input: T) => R => (input: T) => selectByCondition(input, options, defaultResult);

/**
 * Create a function selector from options
 * @template T - Input type
 * @template R - Result type
 * @param options - Array of condition-function pairs
 * @param defaultFn - Default function if no condition matches
 * @returns Selector function
 */
export const createFunctionSelector = <T, R>(
	options: ReadonlyArray<{
		readonly condition: (input: T) => boolean;
		readonly fn: (input: T) => R;
	}>,
	defaultFn: (input: T) => R,
): (input: T) => R => (input: T) => selectFunctionByCondition(input, options, defaultFn);
