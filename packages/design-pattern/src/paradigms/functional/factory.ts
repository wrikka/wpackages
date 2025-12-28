/**
 * @module Factory
 * @description Functional Programming (FP) Factory Pattern implementations.
 */

/**
 * Creates a factory function from a given builder function.
 * @template TInput - The input type for the builder.
 * @template TOutput - The output type of the builder.
 * @param {(input: TInput) => TOutput} builder - The function that constructs the object.
 * @returns {(input: TInput) => TOutput} A new factory function.
 */
export const createFactory = <TInput, TOutput>(
	builder: (input: TInput) => TOutput,
): (input: TInput) => TOutput => {
	return (input) => builder(input);
};

/**
 * Creates a factory function that applies default values to the input before passing it to the builder.
 * @template TInput - The input type, must be an object.
 * @template TOutput - The output type.
 * @param {(input: TInput) => TOutput} builder - The function that constructs the object.
 * @param {Partial<TInput>} defaultProps - The default properties to apply to the input.
 * @returns {(input: Partial<TInput>) => TOutput} A new factory function that accepts partial input.
 */
export const createFactoryWithDefaults = <TInput extends object, TOutput>(
	builder: (input: TInput) => TOutput,
	defaultProps: TInput,
) => {
	return (input: Partial<TInput>): TOutput => {
		const mergedInput = { ...defaultProps, ...input } as TInput;
		return builder(mergedInput);
	};
};
