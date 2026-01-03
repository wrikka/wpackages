type Selector<T, U> = (input: T) => U;

/**
 * Chains multiple selector functions together, where the output of one selector becomes the input for the next.
 * This allows for the creation of complex data transformation pipelines from smaller, reusable selectors.
 *
 * @param {...Selector<any, any>[]} selectors A sequence of selector functions to chain.
 * @returns {Selector<any, any>} A new selector function that represents the entire chain.
 * @throws {Error} If no selectors are provided.
 */
export const chainSelectors = <T, U>(...selectors: [Selector<T, any>, ...Selector<any, any>[], Selector<any, U>]): Selector<T, U> => {
    if (selectors.length === 0) {
        throw new Error('chainSelectors requires at least one selector.');
    }

    return (initialInput: T): U => {
        return selectors.reduce((currentInput, selector) => {
            return selector(currentInput);
        }, initialInput as any);
    };
};
