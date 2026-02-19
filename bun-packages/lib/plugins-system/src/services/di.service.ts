import type {
	DIContext,
	DIPluginAPI,
	DependencyDescriptor,
	DependencyLifetime,
	ServiceContainer,
} from "../types/di.types";

export const createServiceContainer = (): ServiceContainer => {
	const services: Map<string, DependencyDescriptor> = new Map();
	const instances: Map<string, unknown> = new Map();
	const scopes: Set<ServiceContainer> = new Set();

	const register = <T>(
		id: string,
		factory: () => T | Promise<T>,
		lifetime: DependencyLifetime = "transient",
	): void => {
		const descriptor: DependencyDescriptor<T> = {
			id,
			factory,
			lifetime,
			dependencies: [],
		};
		services.set(id, descriptor);
	};

	const resolve = async <T>(id: string): Promise<T> => {
		const descriptor = services.get(id);

		if (!descriptor) {
			throw new Error(`Service ${id} not registered`);
		}

		if (descriptor.lifetime === "singleton") {
			if (instances.has(id)) {
				return instances.get(id) as T;
			}

			const instance = await descriptor.factory();
			instances.set(id, instance);
			return instance as T;
		}

		if (descriptor.lifetime === "transient") {
			return (await descriptor.factory()) as T;
		}

		return (await descriptor.factory()) as T;
	};

	const has = (id: string): boolean => {
		return services.has(id);
	};

	const unregister = (id: string): void => {
		services.delete(id);
		instances.delete(id);
	};

	const createScope = (): ServiceContainer => {
		const scopeServices: Map<string, unknown> = new Map();

		const scopedResolve = async <T>(id: string): Promise<T> => {
			const descriptor = services.get(id);

			if (!descriptor) {
				throw new Error(`Service ${id} not registered`);
			}

			if (descriptor.lifetime === "singleton") {
				if (instances.has(id)) {
					return instances.get(id) as T;
				}

				const instance = await descriptor.factory();
				instances.set(id, instance);
				return instance as T;
			}

			if (scopeServices.has(id)) {
				return scopeServices.get(id) as T;
			}

			const instance = await descriptor.factory();
			scopeServices.set(id, instance);
			return instance as T;
		};

		const scopedContainer: ServiceContainer = {
			register,
			resolve: scopedResolve,
			has,
			unregister,
			createScope,
			dispose: async () => {
				scopeServices.clear();
			},
		};

		scopes.add(scopedContainer);
		return scopedContainer;
	};

	const dispose = async (): Promise<void> => {
		instances.clear();
		services.clear();
		for (const scope of scopes) {
			await scope.dispose();
		}
		scopes.clear();
	};

	return Object.freeze({
		register,
		resolve,
		has,
		unregister,
		createScope,
		dispose,
	});
};

export const createDIContext = (
	container: ServiceContainer,
	pluginId: string,
): DIContext => {
	return Object.freeze({
		container,
		pluginId,
	});
};

export const createDIPluginAPI = (context: DIContext): DIPluginAPI => {
	return Object.freeze({
		registerService: <T>(
			id: string,
			factory: () => T | Promise<T>,
			lifetime?: DependencyLifetime,
		): void => {
			context.container.register(id, factory, lifetime);
		},
		getService: async <T>(id: string): Promise<T> => {
			return context.container.resolve<T>(id);
		},
		hasService: (id: string): boolean => {
			return context.container.has(id);
		},
	});
};
