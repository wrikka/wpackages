/**
 * Adapter Pattern - Pure functional implementation
 * Converts interface of a class into another interface
 */

/**
 * Create a simple adapter that transforms one type to another
 * @template TSource - The source type
 * @template TTarget - The target type
 * @param transform - Function to transform source to target
 * @returns Adapter function that converts source to target
 * @example
 * const adapter = createAdapter<number, string>(n => n.toString());
 * const result = adapter(42); // "42"
 */
export const createAdapter =
	<TSource, TTarget>(transform: (source: TSource) => TTarget) => (source: TSource): TTarget => transform(source);

/**
 * Create a bidirectional adapter that can transform in both directions
 * @template TSource - The source type
 * @template TTarget - The target type
 * @param toTarget - Function to transform source to target
 * @param toSource - Function to transform target back to source
 * @returns Adapter with adapt and reverse methods
 * @example
 * const adapter = createBidirectionalAdapter(
 *   (n: number) => n.toString(),
 *   (s: string) => parseInt(s)
 * );
 */
export const createBidirectionalAdapter = <TSource, TTarget>(
	toTarget: (source: TSource) => TTarget,
	toSource: (target: TTarget) => TSource,
) => ({
	adapt: (source: TSource): TTarget => toTarget(source),
	reverse: (target: TTarget): TSource => toSource(target),
});

/**
 * Create a type adapter for converting between types
 * @template TFrom - The source type
 * @template TTo - The target type
 * @param converter - Function to convert single value
 * @returns Adapter with convert and convertMany methods
 * @example
 * const adapter = createTypeAdapter<number, string>(n => n.toString());
 * adapter.convert(42); // "42"
 * adapter.convertMany([1, 2, 3]); // ["1", "2", "3"]
 */
export const createTypeAdapter = <TFrom, TTo>(
	converter: (value: TFrom) => TTo,
) => ({
	convert: (value: TFrom): TTo => converter(value),
	convertMany: (values: readonly TFrom[]): readonly TTo[] => values.map(converter),
});

/**
 * Create a property adapter (remap object properties)
 * @template TSource - The source object type
 * @template TTarget - The target object type
 * @param mapping - Mapping from target keys to source keys or transformation functions
 * @returns Adapter with adapt method
 * @example
 * const adapter = createPropertyAdapter<
 *   { firstName: string; lastName: string },
 *   { fullName: string }
 * >({
 *   fullName: (source) => `${source.firstName} ${source.lastName}`
 * });
 */
export const createPropertyAdapter = <
	TSource extends Record<string, unknown>,
	TTarget extends Record<string, unknown>,
>(
	mapping: {
		readonly [K in keyof TTarget]: keyof TSource | ((source: TSource) => TTarget[K]);
	},
) => ({
	adapt: (source: TSource): TTarget => {
		const target = {} as TTarget;
		for (const key in mapping) {
			const mapper = mapping[key as keyof typeof mapping];
			if (typeof mapper === "function") {
				target[key as keyof TTarget] = (mapper as (source: TSource) => unknown)(source) as TTarget[keyof TTarget];
			} else {
				target[key as keyof TTarget] = (source[mapper as keyof TSource] as unknown) as TTarget[keyof TTarget];
			}
		}
		return target;
	},
});

/**
 * Create a method adapter (adapt function signatures)
 * @template TSourceArgs - The source function arguments
 * @template TTargetArgs - The target function arguments
 * @template TResult - The return type
 * @param adaptArgs - Function to adapt target args to source args
 * @param method - The original method to adapt
 * @returns Adapted method with new signature
 */
export const createMethodAdapter =
	<TSourceArgs extends readonly unknown[], TTargetArgs extends readonly unknown[], TResult>(
		adaptArgs: (targetArgs: TTargetArgs) => TSourceArgs,
		method: (...args: TSourceArgs) => TResult,
	) =>
	(...args: TTargetArgs): TResult => method(...adaptArgs(args));

/**
 * Create a multi-adapter (adapt multiple sources to one target)
 * @template TSources - Object with multiple source types
 * @template TTarget - The target type
 * @param adapters - Adapters for each source type
 * @returns Adapter with adapt method
 */
export const createMultiAdapter = <
	TSources extends Record<string, unknown>,
	TTarget,
>(
	adapters: {
		readonly [K in keyof TSources]: (source: TSources[K]) => TTarget;
	},
) => ({
	adapt: <K extends keyof TSources>(key: K, source: TSources[K]): TTarget => adapters[key](source),
});

/**
 * Create a conditional adapter that selects adapter based on condition
 * @template TSource - The source type
 * @template TTarget - The target type
 * @param adapters - Array of condition-adapter pairs
 * @param defaultAdapter - Default adapter if no condition matches
 * @returns Adapter with adapt method
 */
export const createConditionalAdapter = <TSource, TTarget>(
	adapters: ReadonlyArray<{
		readonly condition: (source: TSource) => boolean;
		readonly adapter: (source: TSource) => TTarget;
	}>,
	defaultAdapter: (source: TSource) => TTarget,
) => ({
	adapt: (source: TSource): TTarget => {
		const matched = adapters.find((a) => a.condition(source));
		return matched ? matched.adapter(source) : defaultAdapter(source);
	},
});

/**
 * Compose multiple adapters into a single adapter
 * @template T1 - The first source type
 * @template T2 - The intermediate type
 * @template T3 - The final target type
 * @param adapter1 - First adapter
 * @param adapter2 - Second adapter
 * @returns Composed adapter function
 * @example
 * const composed = composeAdapters(
 *   (n: number) => n.toString(),
 *   (s: string) => s.length
 * );
 * composed(42); // 2
 */
export const composeAdapters = <T1, T2, T3>(
	adapter1: (source: T1) => T2,
	adapter2: (source: T2) => T3,
) =>
(source: T1): T3 => adapter2(adapter1(source));
