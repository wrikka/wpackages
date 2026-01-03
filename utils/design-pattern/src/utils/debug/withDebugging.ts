type Selector<T, U> = (input: T) => U;

/**
 * A Higher-Order Function that adds debugging capabilities to a selector function.
 * It logs the input and output of the selector, which is useful for tracing data flow and debugging.
 *
 * @template T The type of the input value for the selector.
 * @template U The type of the output value from the selector.
 * @param {Selector<T, U>} selector The selector function to debug.
 * @param {string} [selectorName='selector'] An optional name for the selector to be used in log messages.
 * @param {(message: string) => void} [logger=console.log] An optional custom logger function.
 * @returns {Selector<T, U>} A new selector function with debugging logs.
 */
export const withDebugging = <T, U>(
  selector: Selector<T, U>,
  selectorName: string = 'selector',
  logger: (message: string) => void = console.log
): Selector<T, U> => {
  return (input: T): U => {
    logger(`[${selectorName}] Input: ${JSON.stringify(input, null, 2)}`);
    const result = selector(input);
    logger(`[${selectorName}] Output: ${JSON.stringify(result, null, 2)}`);
    return result;
  };
};
