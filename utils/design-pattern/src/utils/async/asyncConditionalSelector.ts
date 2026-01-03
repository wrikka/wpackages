/**
 * @template T The type of the input value.
 * @template U The type of the result value.
 */
interface AsyncConditionPair<T, U> {
	/** A function that evaluates the input and returns a Promise resolving to true or false. */
	condition: (input: T) => Promise<boolean> | boolean;
	/** The result to be returned if the condition is met. Can be a value, a Promise, or a function returning a value or a Promise. */
	result: U | Promise<U> | ((input: T) => U | Promise<U>);
}

/**
 * Creates an asynchronous selector function that evaluates a series of conditions and returns a corresponding result.
 * This is useful for handling complex conditional logic involving asynchronous operations.
 *
 * @template T The type of the input value for the selector.
 * @template U The type of the output value from the selector.
 * @param {ReadonlyArray<AsyncConditionPair<T, U>>} conditions An array of async condition-result pairs.
 * @param {U | Promise<U> | ((input: T) => U | Promise<U>)} defaultValue The default value or function to be returned if no conditions are met.
 * @returns {(input: T) => Promise<U>} An async selector function that takes an input and returns a Promise resolving to the result.
 */
export const createAsyncSelector = <T, U>(
	conditions: ReadonlyArray<AsyncConditionPair<T, U>>,
	defaultValue: U | Promise<U> | ((input: T) => U | Promise<U>),
) => {
	return async (input: T): Promise<U> => {
		for (const pair of conditions) {
			if (await Promise.resolve(pair.condition(input))) {
				const result = pair.result;
				if (typeof result === 'function') {
					return Promise.resolve((result as (input: T) => U | Promise<U>)(input));
				}
				return Promise.resolve(result);
			}
		}

		if (typeof defaultValue === 'function') {
			return Promise.resolve((defaultValue as (input: T) => U | Promise<U>)(input));
		}
		return Promise.resolve(defaultValue);
	};
};
