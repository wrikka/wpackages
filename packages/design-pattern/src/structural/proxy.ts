/**
 * Proxy Pattern - Pure functional implementation
 */

export const createProxy = <T extends object>(
	target: T,
	handler: Partial<ProxyHandler<T>>,
): T => new Proxy(target, handler);

export const createLazyProxy = <T extends object>(factory: () => T): T => {
	let instance: T | undefined;
	return new Proxy({} as T, {
		get: (_, prop) => {
			if (!instance) {
				instance = factory();
			}
			return instance[prop as keyof T];
		},
	});
};

export const createLoggingProxy = <T extends object>(
	target: T,
	logger: (method: string, args: unknown[], result: unknown) => void = (
		method,
		args,
		result,
	) => console.log(`Method: ${method}, Args:`, args, "Result:", result),
): T => {
	return new Proxy(target, {
		get: (obj, prop) => {
			const value = obj[prop as keyof T];
			if (typeof value === "function") {
				return (...args: unknown[]) => {
					const result = (value as (...args: unknown[]) => unknown).apply(
						obj,
						args,
					);
					logger(String(prop), args, result);
					return result;
				};
			}
			return value;
		},
	});
};
