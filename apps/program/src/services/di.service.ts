/**
 * DI - Simple Dependency Injection
 *
 * ง่ายกว่า Context/Layer มาก!
 */

/**
 * Service Factory - Function that creates a service instance
 */
export type ServiceFactory<T> = () => T;

/**
 * Service Registration Options
 */
export interface ServiceOptions {
	/**
	 * Whether the service should be a singleton (default: true)
	 */
	singleton?: boolean;

	/**
	 * Dependencies required by this service
	 */
	dependencies?: string[];
}

/**
 * Registered Service Information
 */
interface RegisteredService<T> {
	factory: ServiceFactory<T>;
	options: ServiceOptions;
	instance?: T;
}

/**
 * Container - Enhanced service container with factory support and lifecycle management
 */
export class Container {
	private services = new Map<string, RegisteredService<unknown>>();
	private instances = new Map<string, unknown>();

	/**
	 * Register service with factory function
	 */
	register<T>(
		name: string,
		factory: ServiceFactory<T>,
		options: ServiceOptions = {},
	): void {
		const defaultOptions: ServiceOptions = { singleton: true, dependencies: [] };
		const mergedOptions = { ...defaultOptions, ...options };

		this.services.set(name, { factory, options: mergedOptions });

		// If it's a singleton and we want to eagerly create it
		if (mergedOptions.singleton) {
			this.instances.delete(name); // Clear any existing instance
		}
	}

	/**
	 * Register a simple value as a service
	 */
	registerValue<T>(name: string, value: T): void {
		const factory: ServiceFactory<T> = () => value;
		this.register(name, factory, { singleton: true });
		this.instances.set(name, value);
	}

	/**
	 * Get service
	 */
	get<T>(name: string): T {
		const registered = this.services.get(name);
		if (!registered) {
			throw new Error(`Service "${name}" not found`);
		}

		const { factory, options } = registered;

		// Return existing instance for singletons
		if (options.singleton && this.instances.has(name)) {
			return this.instances.get(name) as T;
		}

		// Create new instance
		const newInstance = factory();

		// Store instance for singletons
		if (options.singleton) {
			this.instances.set(name, newInstance);
		}

		return newInstance as T;
	}

	/**
	 * Has service
	 */
	has(name: string): boolean {
		return this.services.has(name);
	}

	/**
	 * Remove service
	 */
	remove(name: string): void {
		this.services.delete(name);
		this.instances.delete(name);
	}

	/**
	 * Clear all
	 */
	clear(): void {
		this.services.clear();
		this.instances.clear();
	}

	/**
	 * Create child container
	 */
	createChild(): Container {
		const child = new Container();

		// Copy parent service definitions
		for (const [name, service] of this.services) {
			child.services.set(name, service);
		}

		return child;
	}

	/**
	 * Resolve all dependencies for a service
	 */
	resolveDependencies(name: string): Record<string, unknown> {
		const registered = this.services.get(name);
		if (!registered) {
			throw new Error(`Service "${name}" not found`);
		}

		const dependencies: Record<string, unknown> = {};
		const depNames = registered.options.dependencies || [];

		for (const depName of depNames) {
			dependencies[depName] = this.get(depName);
		}

		return dependencies;
	}

	/**
	 * Get all registered service names
	 */
	listServices(): string[] {
		return Array.from(this.services.keys());
	}
}

/**
 * Global container
 */
export const container = new Container();

/**
 * Service - Decorator for service registration
 */
export function Service(name: string, options: ServiceOptions = {}) {
	return function<T extends new(...args: any[]) => any>(constructor: T) {
		const factory: ServiceFactory<T> = () => new constructor();
		container.register(name, factory, options);
		return constructor;
	};
}

/**
 * Inject - Get service from container
 */
export function inject<T>(name: string): T {
	return container.get<T>(name);
}

/**
 * Inject multiple services at once
 */
export function injectMany<T extends Record<string, any>>(names: Record<string, string>): T {
	const services = {} as T;
	for (const [key, name] of Object.entries(names)) {
		services[key as keyof T] = container.get(name);
	}
	return services;
}

/**
 * Create a service factory that automatically injects dependencies
 */
export function withDeps<T>(
	depNames: string[],
	factory: (deps: Record<string, unknown>) => T,
): ServiceFactory<T> {
	return () => {
		const deps: Record<string, unknown> = {};
		for (const name of depNames) {
			deps[name] = container.get(name);
		}
		return factory(deps);
	};
}

/**
 * provide - Provide services for function execution
 */
export async function provide<T>(
	services: Record<string, unknown>,
	fn: (container: Container) => Promise<T>,
): Promise<T> {
	const scopedContainer = container.createChild();

	for (const [name, service] of Object.entries(services)) {
		scopedContainer.registerValue(name, service);
	}

	return fn(scopedContainer);
}

/**
 * provideWithFactory - Provide services with factory functions for function execution
 */
export async function provideWithFactory<T>(
	services: Record<string, ServiceFactory<unknown>>,
	fn: (container: Container) => Promise<T>,
): Promise<T> {
	const scopedContainer = container.createChild();

	for (const [name, factory] of Object.entries(services)) {
		scopedContainer.register(name, factory);
	}

	return fn(scopedContainer);
}
