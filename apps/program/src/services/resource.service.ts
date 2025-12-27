/**
 * Resource - For describing resources that need to be acquired and released.
 */

import { Scope } from "./scope.service"; // Removed missing import

/**
 * Exit status for resource release
 */
export type Exit =
	| { _tag: "Success" }
	| { _tag: "Failure"; error: unknown };

/**
 * A Resource is a data structure that describes a resource that can be
 * acquired and released.
 */
export interface Resource<A> {
	readonly acquire: Promise<A>;
	readonly release: (resource: A, exit: Exit) => Promise<void>;
}

/**
 * Resource Options
 */
export interface ResourceOptions {
	/**
	 * Whether to automatically retry acquisition on failure
	 */
	retryAcquisition?: boolean;

	/**
	 * Maximum number of retry attempts
	 */
	maxRetries?: number;

	/**
	 * Delay between retry attempts (in milliseconds)\   */
	retryDelay?: number;
}

/**
 * Creates a resource from an acquire and release effect.
 */
export const makeResource = <A>(
	acquire: Promise<A>,
	release: (resource: A, exit: Exit) => Promise<void>,
	options: ResourceOptions = {},
): Resource<A> => ({
	acquire: options.retryAcquisition ? retryAcquire(acquire, options) : acquire,
	release,
});

/**
 * Retry resource acquisition with exponential backoff
 */
function retryAcquire<A>(
	acquire: Promise<A>,
	options: ResourceOptions,
): Promise<A> {
	const maxRetries = options.maxRetries ?? 3;
	const retryDelay = options.retryDelay ?? 1000;

	return new Promise((resolve, reject) => {
		(async () => {
			let lastError: unknown;

			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				try {
					const result = await acquire;
					resolve(result);
					return;
				} catch (error) {
					lastError = error;
				}

				// Wait before retrying (except on last attempt)
				if (attempt < maxRetries) {
					await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
				}
			}

			reject(lastError);
		})();
	});
}

/**
 * Uses a resource within a scope, guaranteeing that the resource is released.
 */
export const use = <A>(
	resource: Resource<A>,
	scope: Scope,
): Promise<A> => {
	return resource.acquire.then(a => {
		scope.addFinalizer(exit => resource.release(a, exit).then(() => {}));
		return Promise.resolve(a);
	});
};

/**
 * Map over a resource to transform its value
 */
export const map = <A, B>(
	resource: Resource<A>,
	f: (a: A) => B,
): Resource<B> => ({
	acquire: resource.acquire.then(f),
	release: (_b, exit) => resource.release(undefined as unknown as A, exit),
});

/**
 * Chain resources together
 */
export const flatMap = <A, B>(
	resource: Resource<A>,
	f: (a: A) => Resource<B>,
): Resource<B> => ({
	acquire: resource.acquire.then(a => f(a).acquire),
	release: (b, exit) => f(undefined as unknown as A).release(b, exit),
});

/**
 * Zip two resources together
 */
export const zip = <A, B>(
	first: Resource<A>,
	second: Resource<B>,
): Resource<[A, B]> => ({
	acquire: Promise.all([first.acquire, second.acquire]),
	release: ([a, b], exit) => Promise.all([first.release(a, exit), second.release(b, exit)]).then(() => undefined),
});

/**
 * Create a resource from a simple value
 */
export const fromValue = <A>(value: A): Resource<A> => ({
	acquire: Promise.resolve(value),
	release: () => Promise.resolve(undefined),
});

/**
 * Create a resource that requires async setup
 */
export const fromAsync = <A>(
	acquire: Promise<A>,
): Resource<A> => ({
	acquire,
	release: () => Promise.resolve(undefined),
});

/**
 * Scoped Execution Options
 */
export interface ScopedOptions {
	/**
	 * Timeout for resource acquisition (in milliseconds)
	 */
	acquisitionTimeout?: number;

	/**
	 * Timeout for resource usage (in milliseconds)
	 */
	usageTimeout?: number;
}

/**
 * A helper function to create a scoped effect.
 * It acquires a resource, uses it, and then releases it.
 */
export const scoped = <A, B>(
	resource: Resource<A>,
	useFn: (a: A) => Promise<B>,
	options: ScopedOptions = {},
): Promise<B> => {
	const scope = Scope.make();

	// Apply timeouts if specified
	let acquireEffect = resource.acquire as Promise<A>;
	if (options.acquisitionTimeout) {
		acquireEffect = acquireEffect.then(v => new Promise<A>((resolve) => {
			const timer = setTimeout(() => resolve(v), options.acquisitionTimeout);
			acquireEffect.then(() => clearTimeout(timer));
		}));
	}

	return acquireEffect.then((acquireResult: A) => {
		const resourceValue = acquireResult;
		scope.addFinalizer((exit: Exit) => resource.release(resourceValue, exit));

		let useEffect = useFn(resourceValue);
		if (options.usageTimeout) {
			useEffect = useEffect.then(v => new Promise<B>((resolve) => {
				const timer = setTimeout(() => resolve(v), options.usageTimeout);
				useEffect.then(() => clearTimeout(timer));
			}));
		}

		return useEffect.then((result: B) => {
			return scope.close({ _tag: "Success" }).then(() => result);
		});
	});
};

/**
 * Execute a resource with automatic cleanup
 */
export const useResource = async <A, B>(
	resource: Resource<A>,
	useFn: (a: A) => Promise<B>,
): Promise<B> => {
	return scoped(resource, useFn);
};
