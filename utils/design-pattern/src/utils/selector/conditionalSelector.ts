/**
 * Represents a pair of a condition and a result.
 * The result can be a value of type U or a function that takes an input of type T and returns a value of type U.
 * @template T The type of the input value.
 * @template U The type of the result value.
 */
import { resolveValue } from "./resolver";

interface ConditionPair<T, U> {
	/** A function that evaluates the input and returns true if the condition is met, false otherwise. */
	condition: (input: T) => boolean;
	/** The result to be returned if the condition is met. It can be a direct value or a function that computes the value. */
	result: U | ((input: T) => U);
}

/**
 * Creates a selector function that evaluates a series of conditions and returns a corresponding result.
 * This is useful for implementing complex conditional logic in a clean and declarative way, similar to a switch statement but more powerful.
 *
 * @template T The type of the input value for the selector.
 * @template U The type of the output value from the selector.
 * @param {ReadonlyArray<ConditionPair<T, U>>} conditions An array of condition-result pairs. The selector will iterate through this array and return the result of the first pair whose condition evaluates to true.
 * @param {U | ((input: T) => U)} defaultValue The default value or function to be returned if no conditions are met.
 * @returns {(input: T) => U} A selector function that takes an input of type T and returns a result of type U.
 */
export const createSelector = <T, U>(
	conditions: ReadonlyArray<ConditionPair<T, U>>,
	defaultValue: U | ((input: T) => U),
) => {
	return (input: T): U => {
		for (const pair of conditions) {
			if (pair.condition(input)) {
				return resolveValue(pair.result, input);
			}
		}
		return resolveValue(defaultValue, input);
	};
};
