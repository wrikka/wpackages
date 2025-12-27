/**
 * Bridge Pattern - Pure functional implementation
 */

export const createBridge = <TAbstraction, TImplementation>(
	implementation: TImplementation,
	abstraction: (impl: TImplementation) => TAbstraction,
): TAbstraction => abstraction(implementation);

export const createMultiBridge = <
	TAbstraction,
	TImplementations extends Record<string, unknown>,
>(
	implementations: TImplementations,
	abstraction: <K extends keyof TImplementations>(
		impl: TImplementations[K],
	) => TAbstraction,
) => ({
	use: <K extends keyof TImplementations>(key: K): TAbstraction => abstraction(implementations[key]),
});
