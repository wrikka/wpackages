type Selector<T, U> = (input: T) => U;

/**
 * A Higher-Order Function that adds memoization to a selector function.
 * It caches the results of the selector for given inputs, so that subsequent calls with the same input return the cached result instantly.
 * This is useful for performance optimization of expensive selector functions.
 *
 * @template T The type of the input value for the selector. Must be a primitive type or an object with a stable reference for caching to work correctly.
 * @template U The type of the output value from the selector.
 * @param {Selector<T, U>} selector The selector function to be memoized.
 * @param {(input: T) => any} [cacheKeyResolver] An optional function to generate a unique key for caching. If not provided, the input itself is used as the key. Useful for objects where reference can change but content is the same.
 * @returns {Selector<T, U> & { clearCache: () => void }} A new selector function with memoization capabilities, plus a `clearCache` method to reset the cache.
 */
export const withMemoization = <T, U>(
  selector: Selector<T, U>,
  cacheKeyResolver?: (input: T) => any
): Selector<T, U> & { clearCache: () => void } => {
  const cache = new Map<any, U>();

  const memoizedSelector = (input: T): U => {
    const key = cacheKeyResolver ? cacheKeyResolver(input) : input;
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = selector(input);
    cache.set(key, result);
    return result;
  };

  memoizedSelector.clearCache = () => {
    cache.clear();
  };

  return memoizedSelector;
};
