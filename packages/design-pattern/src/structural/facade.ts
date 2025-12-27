/**
 * Facade Pattern - Pure functional implementation
 */

export const createFacade = <TSubsystems, TOperations>(
	subsystems: TSubsystems,
	operations: (subsystems: TSubsystems) => TOperations,
): TOperations => operations(subsystems);

export const createLazyFacade = <TSubsystems, TOperations>(
	subsystemsFactory: () => TSubsystems,
	operations: (subsystems: TSubsystems) => TOperations,
): TOperations => {
	let subsystems: TSubsystems | undefined;
	const getSubsystems = (): TSubsystems => {
		if (!subsystems) {
			subsystems = subsystemsFactory();
		}
		return subsystems;
	};
	const lazyOperations = {} as TOperations;
	const ops = operations({} as TSubsystems);
	for (const key in ops) {
		if (typeof ops[key] === "function") {
			lazyOperations[key] = ((...args: unknown[]) => {
				const actualOps = operations(getSubsystems());
				return (actualOps[key] as (...args: unknown[]) => unknown)(...args);
			}) as TOperations[typeof key];
		}
	}
	return lazyOperations;
};
